import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kroma-designer-studio-secret-key-2026-production';

export interface UserPayload {
  id: number;
  email: string;
  role: 'admin' | 'client';
  name: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (err) {
    return null;
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.' });
  }

  req.user = payload;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Terlarang: Halaman ini hanya untuk Administrator.' });
  }
  next();
}

export function requireClient(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
  }
  next();
}
