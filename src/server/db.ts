import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let dbInstance: Database | null = null;
let SQL: SqlJsStatic | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('Failed to load existing database file, creating fresh:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Enable foreign keys
  dbInstance.run('PRAGMA foreign_keys = ON;');

  // Initialize tables
  initSchema(dbInstance);
  saveDb();

  return dbInstance;
}

export function saveDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      phone TEXT,
      company TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS website_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      features TEXT NOT NULL,
      starting_price INTEGER NOT NULL,
      image_url TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      cta_text TEXT NOT NULL DEFAULT 'Konsultasi Layanan',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      client_name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      concept TEXT NOT NULL,
      year TEXT NOT NULL,
      tools TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Brief',
      progress INTEGER NOT NULL DEFAULT 15,
      start_date TEXT NOT NULL,
      deadline TEXT NOT NULL,
      deliverables TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      file_url TEXT,
      file_name TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      reply_text TEXT,
      replied_at TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Safe migration for existing databases
  try {
    db.run(`ALTER TABLE contact_messages ADD COLUMN reply_text TEXT;`);
  } catch (e) {
    // Column already exists
  }
  try {
    db.run(`ALTER TABLE contact_messages ADD COLUMN replied_at TEXT;`);
  } catch (e) {
    // Column already exists
  }

  seedInitialData(db);
}

function seedInitialData(db: Database) {
  // Check if admin user exists
  const checkAdmin = db.exec(`SELECT id FROM users WHERE email = 'admin@kroma.id' OR email = 'fadiyeldiyel@gmail.com'`);
  if (!checkAdmin.length || checkAdmin[0].values.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123password', salt);
    const clientPasswordHash = bcrypt.hashSync('client123password', salt);

    const now = new Date().toISOString();

    // Insert Admin
    db.run(
      `INSERT INTO users (email, password_hash, name, role, phone, company, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin@kroma.id', adminPasswordHash, 'Fikri Maulana (Kroma Studio)', 'admin', '+62 812-8888-9999', 'Kroma Design Studio', now]
    );

    // Also support user email from runtime as admin
    db.run(
      `INSERT OR IGNORE INTO users (email, password_hash, name, role, phone, company, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['fadiyeldiyel@gmail.com', adminPasswordHash, 'Fadiyel (Lead Designer)', 'admin', '+62 811-2233-4455', 'Kroma Design Studio', now]
    );

    // Insert Demo Client
    db.run(
      `INSERT INTO users (email, password_hash, name, role, phone, company, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['client@nusantara.id', clientPasswordHash, 'Budi Santoso', 'client', '+62 813-7777-6666', 'Nusantara Coffee Roasters', now]
    );
  }

  // Check website content
  const checkContent = db.exec(`SELECT count(*) as count FROM website_content`);
  const contentCount = checkContent[0]?.values[0]?.[0] as number || 0;
  if (contentCount === 0) {
    const now = new Date().toISOString();
    const defaultContents: Record<string, string> = {
      hero_badge: 'Professional Logo & Identity Designer',
      hero_title: 'Menciptakan Identitas Visual Logo yang Ikonik & Berkarakter',
      hero_subtitle: 'Membantu brand, korporasi, dan UMKM tampil menonjol dengan sistem identitas visual yang presisi, timeless, dan bermakna mendalam.',
      hero_cta_primary: 'Lihat Portfolio',
      hero_cta_secondary: 'Mulai Project',
      about_name: 'Fikri Maulana',
      about_title: 'Lead Identity & Logo Specialist',
      about_bio: 'Lebih dari 8 tahun mendedikasikan diri dalam merancang logo berstandar internasional. Berfokus pada kesederhanaan geometris, kekuatan tipografi, dan fleksibilitas identitas brand di era digital.',
      about_philosophy: 'Logo bukan sekadar gambar dekoratif, melainkan janji visual pertama sebuah brand kepada dunianya. Simpel, fungsional, dan berakar pada nilai esensial brand Anda.',
      about_experience: 'Telah dipercaya oleh 140+ klien dari sektor teknologi, retail, F&B, dan institusi terkemuka di Asia Tenggara dan global.',
      about_skills: 'Logo Marks, Geometric Typography, Monogram, Visual Identity System, Brand Guidelines Book, Vector Precision Engineering',
      about_tools: 'Adobe Illustrator, Glyphs, Figma, Affinity Designer, Adobe Photoshop',
      contact_headline: 'Siap Membangun Karakter Brand Anda?',
      contact_description: 'Konsultasikan kebutuhan logo dan identitas visual brand Anda. Saya menerima inquiry untuk project baru UMKM, korporasi, maupun custom identity.',
      contact_email: 'designer@kromastudio.id',
      contact_phone: '+62 812-8888-9999',
      contact_location: 'Jakarta, Indonesia',
      footer_text: '© 2026 Kroma Studio. All rights reserved. Crafted with precision for forward-thinking brands.'
    };

    for (const [key, val] of Object.entries(defaultContents)) {
      db.run(`INSERT INTO website_content (key, value, updated_at) VALUES (?, ?, ?)`, [key, val, now]);
    }
  }

  // Check services
  const checkServices = db.exec(`SELECT count(*) as count FROM services`);
  const servicesCount = checkServices[0]?.values[0]?.[0] as number || 0;
  if (servicesCount === 0) {
    const now = new Date().toISOString();
    // Exactly 3 categories required by user
    const defaultServices = [
      {
        category: 'UMKM',
        name: 'Brand Identity Starter (UMKM)',
        description: 'Paket esensial yang dirancang khusus untuk bisnis berkembang dan UMKM yang membutuhkan logo profesional dan siap pakai untuk kemasan, media sosial, dan materi promosi.',
        features: JSON.stringify([
          '3 Konsep Desain Logo Original',
          '3 Putaran Revisi Terarah',
          'Master Files Lengkap (AI, EPS, SVG, PNG Transparan, PDF)',
          'Color Palette & Font Pairing Guide',
          'Mockup Kemasan / Merchandise 3D',
          'Hak Cipta Penuh Milik Klien',
          'Garansi Vektor Tajam Resolusi Tinggi'
        ]),
        starting_price: 3500000,
        image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
        is_active: 1,
        cta_text: 'Pilih Paket UMKM'
      },
      {
        category: 'BUSINESS / CORPORATE',
        name: 'Corporate Brand System',
        description: 'Solusi identitas menyeluruh untuk perusahaan, korporasi, dan brand menengah ke atas dengan riset mendalam, sistem grid geometris presisi, dan brand manual terstruktur.',
        features: JSON.stringify([
          'Riset Pasar & Brand Positioning Analisis',
          '5 Konsep Eksplorasi Logo & Monogram',
          'Revisi Fleksibel hingga Finalisasi Sempurna',
          'Comprehensive Brand Guidelines (40+ Halaman)',
          'Sistem Tipografi & Stationery Suite Lengkap',
          'Aset Digital & Social Media Kit Siap Pakai',
          'Sertifikat Pengalihan Hak Cipta Komersial',
          'Dedicated Project Tracking & Direct Consultation'
        ]),
        starting_price: 12500000,
        image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
        is_active: 1,
        cta_text: 'Konsultasi Corporate'
      },
      {
        category: 'PERSONAL / CUSTOM',
        name: 'Signature & Custom Identity',
        description: 'Perancangan logo bespoke untuk personal branding profesional, creator, publik figur, komunitas, atau monogram custom dengan sentuhan tipografi artistik eksklusif.',
        features: JSON.stringify([
          'Custom Lettering / Monogram Signature',
          '3 Konsep Unik dengan Filosofi Pribadi',
          'Optimasi Avatar & Profil Media Sosial',
          'Stempel, Watermark, & Digital Signature Files',
          'Color Profile Eksklusif RGB & CMYK',
          'Format Siap Cetak dan Web Vektor',
          'Waktu Pengerjaan Cepat & Prioritas'
        ]),
        starting_price: 5500000,
        image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        is_active: 1,
        cta_text: 'Mulai Custom Project'
      }
    ];

    for (const s of defaultServices) {
      db.run(
        `INSERT INTO services (category, name, description, features, starting_price, image_url, is_active, cta_text, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.category, s.name, s.description, s.features, s.starting_price, s.image_url, s.is_active, s.cta_text, now]
      );
    }
  }

  // Check portfolio
  const checkPortfolio = db.exec(`SELECT count(*) as count FROM portfolio`);
  const portfolioCount = checkPortfolio[0]?.values[0]?.[0] as number || 0;
  if (portfolioCount === 0) {
    const now = new Date().toISOString();
    const defaultPortfolio = [
      {
        title: 'Nusantara Coffee Roasters',
        client_name: 'PT Nusantara Roastery Indonesia',
        category: 'UMKM',
        description: 'Identitas logo modern untuk produsen kopi artisan single-origin Nusantara. Menggabungkan siluet biji kopi dengan motif tenun geometris nusantara.',
        concept: 'Simbol biji kopi yang dibentuk dari garis-garis presisi melambangkan konektivitas petani lokal dengan penikmat kopi kontemporer.',
        year: '2024',
        tools: 'Adobe Illustrator, Figma',
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
        is_featured: 1
      },
      {
        title: 'Vectis Capital Partners',
        client_name: 'Vectis Holding Pte Ltd',
        category: 'BUSINESS / CORPORATE',
        description: 'Logo korporasi finansial dan venture capital berbasis di Singapura. Mengusung huruf V yang kokoh menyerupai pilar arsitektur modern.',
        concept: 'Geometri segitiga terbalik dengan sudut stabil melambangkan pertumbuhan berkelanjutan, keamanan dana, dan visi ke depan.',
        year: '2024',
        tools: 'Adobe Illustrator, Glyphs',
        image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        is_featured: 1
      },
      {
        title: 'Aura Studio Architecture',
        client_name: 'Aura Spatial Design',
        category: 'PERSONAL / CUSTOM',
        description: 'Monogram minimalis untuk firma arsitektur minimalis Jepang-Skandinavia (Japandi). Elegan, tenang, dan memiliki ruang negatif yang bersih.',
        concept: 'Huruf A ganda yang membentuk kanopi bayangan ruang, mewakili esensi arsitektur cahaya dan ruang.',
        year: '2023',
        tools: 'Adobe Illustrator, Photoshop',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        is_featured: 1
      },
      {
        title: 'Sola Botanica Organics',
        client_name: 'Sola Wellness Group',
        category: 'UMKM',
        description: 'Brand identity produk perawatan kulit berbahan dasar botanikal alami. Didesain dengan keanggunan garis organik dan warna earth-tone.',
        concept: 'Kelopak bunga matahari yang disederhanakan menjadi komposisi simetris meditatif.',
        year: '2024',
        tools: 'Adobe Illustrator, Procreate',
        image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
        is_featured: 1
      },
      {
        title: 'Synapse AI Cloud Infrastructure',
        client_name: 'Synapse Tech Labs',
        category: 'BUSINESS / CORPORATE',
        description: 'Identitas logo platform neural network computing bervolume tinggi dengan logomark berkesan futuristik dan solid.',
        concept: 'Node simpul data berbentuk heksagonal interlocking yang memvisualisasikan kecepatan pemrosesan data terdistribusi.',
        year: '2024',
        tools: 'Adobe Illustrator, Figma',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        is_featured: 0
      },
      {
        title: 'Rian Dirgantara Creator Mark',
        client_name: 'Rian Dirgantara',
        category: 'PERSONAL / CUSTOM',
        description: 'Personal insignia untuk fotografer lanskap dan konten kreator petualangan. Simpel, kuat, dan mudah dibubuhkan sebagai watermark.',
        concept: 'Inisial R dan D yang melebur menjadi siluet puncak gunung dalam satu tarikan garis kontinu.',
        year: '2023',
        tools: 'Adobe Illustrator',
        image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        is_featured: 0
      }
    ];

    for (const p of defaultPortfolio) {
      db.run(
        `INSERT INTO portfolio (title, client_name, category, description, concept, year, tools, image_url, is_featured, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.title, p.client_name, p.category, p.description, p.concept, p.year, p.tools, p.image_url, p.is_featured, now]
      );
    }
  }

  // Check demo project for client
  const checkProjects = db.exec(`SELECT count(*) as count FROM projects`);
  const projectCount = checkProjects[0]?.values[0]?.[0] as number || 0;
  if (projectCount === 0) {
    const getClient = db.exec(`SELECT id FROM users WHERE email = 'client@nusantara.id'`);
    const clientId = getClient[0]?.values[0]?.[0] as number;

    if (clientId) {
      const now = new Date().toISOString();
      const deliverables = JSON.stringify([
        {
          id: 'del-1',
          name: 'Nusantara-Logo-Primary-Vector.svg',
          size: '1.2 MB',
          url: '/uploads/sample-logo.svg',
          date: '2024-10-15'
        },
        {
          id: 'del-2',
          name: 'Nusantara-Brand-Guidelines-v1.pdf',
          size: '8.4 MB',
          url: '/uploads/sample-guidelines.pdf',
          date: '2024-10-18'
        }
      ]);

      db.run(
        `INSERT INTO projects (client_id, title, description, category, status, progress, start_date, deadline, deliverables, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          'Rebranding Identitas Kopi Nusantara Roasters',
          'Perancangan sistem logo baru, kemasan standing pouch kopi, dan pedoman identitas visual untuk peluncuran toko ritel baru.',
          'UMKM',
          'Design',
          65,
          '2024-10-01',
          '2024-11-15',
          deliverables,
          now,
          now
        ]
      );

      const getProject = db.exec(`SELECT last_insert_rowid()`);
      const projectId = getProject[0]?.values[0]?.[0] as number;

      if (projectId) {
        const updates = [
          {
            title: 'Brief Kebutuhan Brand & Riset Pasar Selesai',
            description: 'Kami telah membedah target audiens pencinta specialty coffee usia 24-40 tahun dan mengidentifikasi diferensiasi utama brand Anda.',
            status: 'Research',
            file_name: 'Research-Brief-Summary.pdf',
            date: '2024-10-05'
          },
          {
            title: 'Presentasi 3 Konsep Awal Logomark',
            description: '3 eksplorasi telah dipaparkan: Konsep A (Geometris Tradisi), Konsep B (Modern Minimalist), Konsep C (Monogram Biji Kopi). Klien memilih arah Konsep A.',
            status: 'Concept',
            file_name: 'Concept-Deck-v1.pdf',
            date: '2024-10-12'
          },
          {
            title: 'Eksplorasi Warna & Detail Tipografi dalam Tahap Desain',
            description: 'Sedang dilakukan penyempurnaan sudut kurva vektor, tes legibilitas ukuran mikro, dan pembuatan palet warna earth tone kopi Nusantara.',
            status: 'Design',
            file_name: null,
            date: '2024-10-20'
          }
        ];

        for (const u of updates) {
          db.run(
            `INSERT INTO project_updates (project_id, title, description, status, file_name, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [projectId, u.title, u.description, u.status, u.file_name, u.date]
          );
        }
      }
    }
  }

  // Check sample messages
  const checkMessages = db.exec(`SELECT count(*) as count FROM contact_messages`);
  const msgCount = checkMessages[0]?.values[0]?.[0] as number || 0;
  if (msgCount === 0) {
    const now = new Date().toISOString();
    db.run(
      `INSERT INTO contact_messages (name, email, message, is_read, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        'Aditia Pratama',
        'aditia@startupfin.id',
        'Halo Mas Fikri, kami tertarik untuk rebranding logo startup fintech kami di Jakarta. Apakah tersedia slot untuk bulan depan? Terima kasih.',
        0,
        now
      ]
    );
  }
}

// SQL query helper utilities
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const stmt = db.prepare(sql);
  if (params.length) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> {
  const db = await getDb();
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid() AS id, changes() AS changes;');
  saveDb();
  const id = (result[0]?.values[0]?.[0] as number) || 0;
  const changes = (result[0]?.values[0]?.[1] as number) || 0;
  return { lastInsertRowid: id, changes };
}
