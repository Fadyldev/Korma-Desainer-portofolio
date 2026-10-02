import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { getDb, query, queryOne, execute } from './src/server/db.ts';
import { authenticate, requireAdmin, requireClient, generateToken, AuthRequest } from './src/server/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Set up Multer for file storage
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Initialize DB immediately on boot
getDb().catch((err) => console.error('DB Init Error:', err));

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Register (Client only)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, company } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ error: 'Email ini sudah terdaftar. Silakan login.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();

    const insertResult = await execute(
      `INSERT INTO users (email, password_hash, name, role, phone, company, created_at)
       VALUES (?, ?, ?, 'client', ?, ?, ?)`,
      [cleanEmail, passwordHash, name.trim(), phone || null, company || null, now]
    );

    const newUserId = insertResult.lastInsertRowid;
    const token = generateToken({
      id: newUserId,
      email: cleanEmail,
      role: 'client',
      name: name.trim(),
    });

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: newUserId,
        email: cleanEmail,
        name: name.trim(),
        role: 'client',
        phone: phone || null,
        company: company || null,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Gagal melakukan registrasi: ' + (error.message || 'Terjadi kesalahan server') });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await queryOne<any>('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        company: user.company,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Gagal login: ' + (error.message || 'Terjadi kesalahan') });
  }
});

// Get current user profile
app.get('/api/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne<any>('SELECT id, email, name, role, phone, company, avatar_url, created_at FROM users WHERE id = ?', [req.user!.id]);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
app.put('/api/auth/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, company, avatar_url, password } = req.body;
    const userId = req.user!.id;

    if (!name) {
      return res.status(400).json({ error: 'Nama tidak boleh kosong.' });
    }

    if (password && password.trim().length >= 6) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password.trim(), salt);
      await execute('UPDATE users SET name = ?, phone = ?, company = ?, avatar_url = ?, password_hash = ? WHERE id = ?', [
        name.trim(),
        phone || null,
        company || null,
        avatar_url || null,
        hash,
        userId,
      ]);
    } else {
      await execute('UPDATE users SET name = ?, phone = ?, company = ?, avatar_url = ? WHERE id = ?', [
        name.trim(),
        phone || null,
        company || null,
        avatar_url || null,
        userId,
      ]);
    }

    const updated = await queryOne<any>('SELECT id, email, name, role, phone, company, avatar_url FROM users WHERE id = ?', [userId]);
    res.json({ message: 'Profil berhasil diperbarui!', user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. PUBLIC DATA ROUTES
// ==========================================

// Website Content (CMS)
app.get('/api/content', async (_req: Request, res: Response) => {
  try {
    const rows = await query<{ key: string; value: string }>('SELECT key, value FROM website_content');
    const contentMap: Record<string, string> = {};
    for (const r of rows) {
      contentMap[r.key] = r.value;
    }
    res.json(contentMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Services (Public)
app.get('/api/services', async (_req: Request, res: Response) => {
  try {
    const rows = await query<any>('SELECT * FROM services WHERE is_active = 1 ORDER BY id ASC');
    const parsed = rows.map((r) => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
    }));
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Portfolio (Public)
app.get('/api/portfolio', async (req: Request, res: Response) => {
  try {
    const { category, featured } = req.query;
    let sql = 'SELECT * FROM portfolio WHERE 1=1';
    const params: any[] = [];

    if (featured === '1') {
      sql += ' AND is_featured = 1';
    }
    if (category && category !== 'ALL') {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY id DESC';

    const rows = await query<any>(sql, params);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Single Portfolio detail
app.get('/api/portfolio/:id', async (req: Request, res: Response) => {
  try {
    const item = await queryOne<any>('SELECT * FROM portfolio WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: 'Portfolio tidak ditemukan.' });
    }
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Contact message submit (Public)
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nama, email, dan pesan wajib diisi.' });
    }

    const now = new Date().toISOString();
    await execute('INSERT INTO contact_messages (name, email, message, is_read, created_at) VALUES (?, ?, ?, 0, ?)', [
      name.trim(),
      email.trim(),
      message.trim(),
      now,
    ]);

    res.status(201).json({ message: 'Terima kasih! Pesan Anda telah terkirim ke designer kami.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. FILE UPLOAD ENDPOINT
// ==========================================

app.post('/api/upload', authenticate, upload.single('file'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    message: 'File berhasil diunggah!',
    url: fileUrl,
    filename: req.file.originalname,
    storedFilename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// ==========================================
// 4. CLIENT DASHBOARD ROUTES (PROTECTED)
// ==========================================

// Get client's own projects ONLY
app.get('/api/client/projects', authenticate, requireClient, async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.user!.id;
    const projects = await query<any>('SELECT * FROM projects WHERE client_id = ? ORDER BY id DESC', [clientId]);
    const parsed = projects.map((p) => ({
      ...p,
      deliverables: typeof p.deliverables === 'string' ? JSON.parse(p.deliverables || '[]') : p.deliverables,
    }));
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get client's specific project detail ONLY if owned by this client
app.get('/api/client/projects/:id', authenticate, requireClient, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    const clientId = req.user!.id;
    const userRole = req.user!.role;

    const project = await queryOne<any>('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ error: 'Project tidak ditemukan.' });
    }

    // STRICT AUTHORIZATION CHECK: Client can ONLY see their own project
    if (userRole !== 'admin' && project.client_id !== clientId) {
      return res.status(403).json({ error: 'Akses Ditolak: Anda tidak memiliki akses ke project ini.' });
    }

    const updates = await query<any>('SELECT * FROM project_updates WHERE project_id = ? ORDER BY id DESC', [projectId]);
    const client = await queryOne<any>('SELECT id, name, email, company, phone FROM users WHERE id = ?', [project.client_id]);

    project.deliverables = typeof project.deliverables === 'string' ? JSON.parse(project.deliverables || '[]') : project.deliverables;

    res.json({
      project,
      client,
      updates,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Client overview stats
app.get('/api/client/stats', authenticate, requireClient, async (req: AuthRequest, res: Response) => {
  try {
    const clientId = req.user!.id;
    const projects = await query<any>('SELECT status, progress, deadline FROM projects WHERE client_id = ?', [clientId]);

    const activeCount = projects.filter((p) => p.status !== 'Completed').length;
    const completedCount = projects.filter((p) => p.status === 'Completed').length;

    // Upcoming deadline
    const sortedDeadlines = projects
      .filter((p) => p.status !== 'Completed' && p.deadline)
      .map((p) => p.deadline)
      .sort();

    res.json({
      totalProjects: projects.length,
      activeProjects: activeCount,
      completedProjects: completedCount,
      nearestDeadline: sortedDeadlines[0] || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. ADMIN DASHBOARD & CMS ROUTES (ADMIN ONLY)
// ==========================================

// Admin overview stats
app.get('/api/admin/stats', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const clientCountRow = await queryOne<any>("SELECT count(*) as count FROM users WHERE role = 'client'");
    const activeProjectsRow = await queryOne<any>("SELECT count(*) as count FROM projects WHERE status != 'Completed'");
    const completedProjectsRow = await queryOne<any>("SELECT count(*) as count FROM projects WHERE status = 'Completed'");
    const portfolioCountRow = await queryOne<any>('SELECT count(*) as count FROM portfolio');
    const unreadMessagesRow = await queryOne<any>('SELECT count(*) as count FROM contact_messages WHERE is_read = 0');

    res.json({
      totalClients: clientCountRow?.count || 0,
      activeProjects: activeProjectsRow?.count || 0,
      completedProjects: completedProjectsRow?.count || 0,
      totalPortfolio: portfolioCountRow?.count || 0,
      unreadMessages: unreadMessagesRow?.count || 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Website Content (CMS)
app.put('/api/admin/content', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const contents: Record<string, string> = req.body;
    const now = new Date().toISOString();

    for (const [key, val] of Object.entries(contents)) {
      await execute('INSERT INTO website_content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?', [
        key,
        String(val),
        now,
        String(val),
        now,
      ]);
    }

    res.json({ message: 'Konten website berhasil disimpan dan diperbarui!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Portfolio Admin CRUD ---
app.get('/api/admin/portfolio', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await query<any>('SELECT * FROM portfolio ORDER BY id DESC');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/portfolio', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, client_name, category, description, concept, year, tools, image_url, is_featured } = req.body;
    if (!title || !client_name || !image_url) {
      return res.status(400).json({ error: 'Nama project, client brand, dan gambar wajib diisi.' });
    }

    const now = new Date().toISOString();
    const result = await execute(
      `INSERT INTO portfolio (title, client_name, category, description, concept, year, tools, image_url, is_featured, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        client_name.trim(),
        category || 'UMKM',
        description || '',
        concept || '',
        year || String(new Date().getFullYear()),
        tools || 'Adobe Illustrator',
        image_url.trim(),
        is_featured ? 1 : 0,
        now,
      ]
    );

    res.status(201).json({ message: 'Portfolio berhasil ditambahkan!', id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/portfolio/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, client_name, category, description, concept, year, tools, image_url, is_featured } = req.body;
    await execute(
      `UPDATE portfolio SET title = ?, client_name = ?, category = ?, description = ?, concept = ?, year = ?, tools = ?, image_url = ?, is_featured = ?
       WHERE id = ?`,
      [title, client_name, category, description, concept, year, tools, image_url, is_featured ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Portfolio berhasil diperbarui!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/portfolio/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await execute('DELETE FROM portfolio WHERE id = ?', [req.params.id]);
    res.json({ message: 'Portfolio berhasil dihapus!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Services Admin CRUD ---
app.get('/api/admin/services', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await query<any>('SELECT * FROM services ORDER BY id ASC');
    const parsed = rows.map((r) => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features || '[]') : r.features,
    }));
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/services', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { category, name, description, features, starting_price, image_url, is_active, cta_text } = req.body;
    if (!name || !starting_price) {
      return res.status(400).json({ error: 'Nama dan harga wajib diisi.' });
    }

    const now = new Date().toISOString();
    const featStr = Array.isArray(features) ? JSON.stringify(features) : String(features || '[]');

    const result = await execute(
      `INSERT INTO services (category, name, description, features, starting_price, image_url, is_active, cta_text, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category || 'UMKM', name.trim(), description || '', featStr, Number(starting_price), image_url || null, is_active !== false ? 1 : 0, cta_text || 'Pilih Layanan', now]
    );

    res.status(201).json({ message: 'Layanan berhasil dibuat!', id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/services/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { category, name, description, features, starting_price, image_url, is_active, cta_text } = req.body;
    const featStr = Array.isArray(features) ? JSON.stringify(features) : String(features || '[]');

    await execute(
      `UPDATE services SET category = ?, name = ?, description = ?, features = ?, starting_price = ?, image_url = ?, is_active = ?, cta_text = ?
       WHERE id = ?`,
      [category, name, description, featStr, Number(starting_price), image_url, is_active ? 1 : 0, cta_text, req.params.id]
    );

    res.json({ message: 'Layanan berhasil diperbarui!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/services/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await execute('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Layanan berhasil dihapus!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Clients Admin CRUD ---
app.get('/api/admin/clients', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const clients = await query<any>(`
      SELECT u.id, u.name, u.email, u.phone, u.company, u.created_at,
             count(p.id) as project_count
      FROM users u
      LEFT JOIN projects p ON p.client_id = u.id
      WHERE u.role = 'client'
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/clients/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const client = await queryOne<any>('SELECT id, name, email, phone, company, created_at FROM users WHERE id = ? AND role = "client"', [req.params.id]);
    if (!client) {
      return res.status(404).json({ error: 'Client tidak ditemukan.' });
    }

    const projects = await query<any>('SELECT * FROM projects WHERE client_id = ? ORDER BY id DESC', [client.id]);
    res.json({ client, projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/clients', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, phone, company } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();

    const result = await execute(
      `INSERT INTO users (email, password_hash, name, role, phone, company, created_at)
       VALUES (?, ?, ?, 'client', ?, ?, ?)`,
      [cleanEmail, hash, name.trim(), phone || null, company || null, now]
    );

    res.status(201).json({ message: 'Client berhasil didaftarkan!', id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/clients/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, company, password } = req.body;
    if (password && password.trim().length >= 6) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password.trim(), salt);
      await execute('UPDATE users SET name = ?, phone = ?, company = ?, password_hash = ? WHERE id = ?', [
        name.trim(),
        phone || null,
        company || null,
        hash,
        req.params.id,
      ]);
    } else {
      await execute('UPDATE users SET name = ?, phone = ?, company = ? WHERE id = ?', [
        name.trim(),
        phone || null,
        company || null,
        req.params.id,
      ]);
    }
    res.json({ message: 'Data client berhasil diperbarui!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Projects Admin CRUD & Timeline ---
app.get('/api/admin/projects', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const projects = await query<any>(`
      SELECT p.*, u.name as client_name, u.email as client_email, u.company as client_company
      FROM projects p
      JOIN users u ON u.id = p.client_id
      ORDER BY p.id DESC
    `);
    const parsed = projects.map((p) => ({
      ...p,
      deliverables: typeof p.deliverables === 'string' ? JSON.parse(p.deliverables || '[]') : p.deliverables,
    }));
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/projects/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const project = await queryOne<any>(`
      SELECT p.*, u.name as client_name, u.email as client_email, u.company as client_company, u.phone as client_phone
      FROM projects p
      JOIN users u ON u.id = p.client_id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!project) {
      return res.status(404).json({ error: 'Project tidak ditemukan.' });
    }

    const updates = await query<any>('SELECT * FROM project_updates WHERE project_id = ? ORDER BY id DESC', [req.params.id]);
    project.deliverables = typeof project.deliverables === 'string' ? JSON.parse(project.deliverables || '[]') : project.deliverables;

    res.json({ project, updates });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/projects', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { client_id, title, description, category, status, progress, start_date, deadline } = req.body;
    if (!client_id || !title) {
      return res.status(400).json({ error: 'Client dan Nama Project wajib diisi.' });
    }

    const now = new Date().toISOString();
    const result = await execute(
      `INSERT INTO projects (client_id, title, description, category, status, progress, start_date, deadline, deliverables, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?)`,
      [
        Number(client_id),
        title.trim(),
        description || '',
        category || 'UMKM',
        status || 'Brief',
        Number(progress) || 10,
        start_date || now.split('T')[0],
        deadline || '',
        now,
        now,
      ]
    );

    const projectId = result.lastInsertRowid;
    // Add initial timeline update
    await execute(
      `INSERT INTO project_updates (project_id, title, description, status, file_url, file_name, created_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?)`,
      [projectId, 'Project Dimulai & Brief Diterima', 'Project resmi dibuat dan tahap riset/briefing sedang berlangsung.', status || 'Brief', now]
    );

    res.status(201).json({ message: 'Project berhasil dibuat!', id: projectId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/projects/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, status, progress, start_date, deadline } = req.body;
    const now = new Date().toISOString();

    await execute(
      `UPDATE projects SET title = ?, description = ?, category = ?, status = ?, progress = ?, start_date = ?, deadline = ?, updated_at = ?
       WHERE id = ?`,
      [title, description, category, status, Number(progress), start_date, deadline, now, req.params.id]
    );

    res.json({ message: 'Project berhasil diperbarui!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/projects/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await execute('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ message: 'Project berhasil dihapus!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Project Updates (Timeline)
app.post('/api/admin/projects/:id/updates', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    const { title, description, status, file_url, file_name } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Judul update wajib diisi.' });
    }

    const now = new Date().toISOString();
    const result = await execute(
      `INSERT INTO project_updates (project_id, title, description, status, file_url, file_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [projectId, title.trim(), description || '', status || 'Design', file_url || null, file_name || null, now]
    );

    // Also update project's updated_at and optionally status if provided
    if (status) {
      await execute('UPDATE projects SET status = ?, updated_at = ? WHERE id = ?', [status, now, projectId]);
    }

    res.status(201).json({ message: 'Update timeline berhasil ditambahkan!', id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/projects/updates/:updateId', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await execute('DELETE FROM project_updates WHERE id = ?', [req.params.updateId]);
    res.json({ message: 'Update timeline berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Project Deliverables management
app.post('/api/admin/projects/:id/deliverables', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;
    const { name, url, size } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Nama file dan URL deliverables wajib disertakan.' });
    }

    const project = await queryOne<any>('SELECT deliverables FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ error: 'Project tidak ditemukan.' });
    }

    const list = typeof project.deliverables === 'string' ? JSON.parse(project.deliverables || '[]') : project.deliverables || [];
    list.push({
      id: 'del-' + Date.now(),
      name,
      url,
      size: size || 'Unknown size',
      date: new Date().toISOString().split('T')[0],
    });

    const now = new Date().toISOString();
    await execute('UPDATE projects SET deliverables = ?, updated_at = ? WHERE id = ?', [JSON.stringify(list), now, projectId]);

    res.json({ message: 'File deliverable berhasil ditambahkan!', deliverables: list });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/projects/:id/deliverables/:delId', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id: projectId, delId } = req.params;
    const project = await queryOne<any>('SELECT deliverables FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ error: 'Project tidak ditemukan.' });
    }

    const list = typeof project.deliverables === 'string' ? JSON.parse(project.deliverables || '[]') : project.deliverables || [];
    const filtered = list.filter((item: any) => item.id !== delId);

    const now = new Date().toISOString();
    await execute('UPDATE projects SET deliverables = ?, updated_at = ? WHERE id = ?', [JSON.stringify(filtered), now, projectId]);

    res.json({ message: 'Deliverable berhasil dihapus.', deliverables: filtered });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Messages Admin ---
app.get('/api/admin/messages', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const messages = await query<any>('SELECT * FROM contact_messages ORDER BY id DESC');
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/messages/:id/read', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { is_read } = req.body;
    await execute('UPDATE contact_messages SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, req.params.id]);
    res.json({ message: 'Status pesan diperbarui.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/messages/:id/reply', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { reply_text } = req.body;
    const now = new Date().toISOString();
    await execute('UPDATE contact_messages SET reply_text = ?, replied_at = ?, is_read = 1 WHERE id = ?', [
      reply_text || '',
      now,
      req.params.id,
    ]);
    res.json({ message: 'Catatan balasan berhasil disimpan ke database!', replied_at: now });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/messages/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await execute('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pesan berhasil dihapus.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Raw Database Explorer & Download (Admin Only) ---
app.get('/api/admin/database/tables', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const tables = await query<any>(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name ASC;
    `);

    const result = [];
    for (const t of tables) {
      const countRes = await queryOne<any>(`SELECT count(*) as count FROM ${t.name}`);
      result.push({
        name: t.name,
        count: countRes?.count || 0,
      });
    }

    res.json({
      db_path: '/data/database.sqlite',
      tables: result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/database/table/:name', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const tableName = String(req.params.name).replace(/[^a-zA-Z0-9_]/g, '');
    const validTables = ['users', 'services', 'portfolio', 'projects', 'project_updates', 'website_content', 'contact_messages'];
    if (!validTables.includes(tableName)) {
      return res.status(400).json({ error: 'Tabel tidak diizinkan.' });
    }

    const rows = await query<any>(`SELECT * FROM ${tableName} ORDER BY 1 DESC LIMIT 100;`);
    res.json({ tableName, rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/database/download', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const dbPath = path.resolve(__dirname, 'data', 'database.sqlite');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'File database belum tersedia di disk.' });
    }
    res.download(dbPath, 'kroma-database.sqlite');
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. VITE MIDDLEWARE / PRODUCTION SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !fs.existsSync(path.resolve(__dirname, 'dist'))) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production build static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
