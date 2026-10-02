import connectDB from './db.js';
import User from './models/User.js';

// Ambil secret token dari Vercel Environment Variables
const ADMIN_SECRET_TOKEN = process.env.ADMIN_TOKEN_SECRET || 'SECRET_ADMIN_TOKEN_2026_SECURE';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Verifikasi Sesi Token (GET /api/auth/verify)
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token !== ADMIN_SECRET_TOKEN) {
      return res.status(401).json({ success: false, message: 'Token tidak valid atau telah kedaluwarsa' });
    }

    return res.status(200).json({ success: true, message: 'Sesi token valid' });
  }

  // 2. Login Admin (POST /api/auth)
  if (req.method === 'POST') {
    await connectDB();
    const { username, password } = req.body || {};

    try {
      const count = await User.countDocuments();
      if (count === 0) {
        await User.create({ username: 'admin', password: 'admin123' });
      }

      const user = await User.findOne({ username });

      if (!user || user.password !== password) {
        return res.status(400).json({ success: false, message: 'Username atau password salah!' });
      }

      return res.status(200).json({
        success: true,
        message: 'Login berhasil!',
        username: user.username,
        token: ADMIN_SECRET_TOKEN
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}