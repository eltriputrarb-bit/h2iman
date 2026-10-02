import connectDB from './db.js';
import User from './models/User.js';

// Secret key sederhana untuk validasi token (bisa disimpan di .env)
const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY_ADMIN_FILM_2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  // GET /api/auth -> Verifikasi token saat HP buka Chrome / Refresh Admin
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan!' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verifikasi struktur & isi token
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      if (decoded.secret !== JWT_SECRET || !decoded.username) {
        return res.status(401).json({ success: false, message: 'Token tidak valid!' });
      }

      // Pastikan user masih ada di DB
      const user = await User.findOne({ username: decoded.username });
      if (!user) {
        return res.status(401).json({ success: false, message: 'User tidak terdaftar!' });
      }

      return res.status(200).json({ success: true, username: user.username });
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Token palsu atau kadaluarsa!' });
    }
  }

  // POST /api/auth (atau /api/login) -> Proses Login & Buat Token
  if (req.method === 'POST') {
    const { username, password } = req.body || {};

    try {
      // Buat user default jika DB masih kosong
      const count = await User.countDocuments();
      if (count === 0) {
        await User.create({ username: 'admin', password: 'admin123' });
      }

      const user = await User.findOne({ username });

      if (!user || user.password !== password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username atau password salah!' 
        });
      }

      // Buat Token Rahasia Terenkripsi Base64
      const tokenPayload = {
        username: user.username,
        secret: JWT_SECRET,
        time: Date.now()
      };
      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

      return res.status(200).json({ 
        success: true, 
        message: 'Login berhasil!', 
        username: user.username,
        token: token 
      });

    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}