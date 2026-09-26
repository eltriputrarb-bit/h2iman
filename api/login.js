import connectDB from './db.js';
import User from './models/User.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  await connectDB();
  const { username, password } = req.body;

  try {
    // 1. Otomatis buat user admin jika DB masih kosong
    const count = await User.countDocuments();
    if (count === 0) {
      await User.create({
        username: 'admin',
        password: 'admin123'
      });
      console.log('💡 Akun default diciptakan: User: admin | Pass: admin123');
    }

    // 2. Cari user & verifikasi
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username atau password salah!' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Login berhasil!', 
      username: user.username 
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}