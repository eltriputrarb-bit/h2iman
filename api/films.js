import mongoose from 'mongoose';
import connectDB from './db.js';
import Film from './models/Film.js';

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY_ADMIN_FILM_2026';

// Helper verifikasi token anti-curi di server (Hanya untuk Admin)
const verifyAdminToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded.secret === JWT_SECRET && Boolean(decoded.username);
  } catch (err) {
    return false;
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
  } catch (dbErr) {
    return res.status(500).json({ message: 'Gagal terhubung ke database: ' + dbErr.message });
  }

  const query = req.query || {};
  const id = query.id || req.body?.id;

  try {
    // GET: Bebas diakses frontend, tapi proteksi akses langsung via URL Browser Address Bar
    if (req.method === 'GET') {
      const acceptHeader = req.headers['accept'] || '';
      const fetchMode = req.headers['sec-fetch-mode'];

      // 1. Blokir jika dibuka langsung dengan mengetikkan URL di browser
      if (fetchMode === 'navigate' && acceptHeader.includes('text/html')) {
        return res.status(403).json({ 
          success: false, 
          message: 'Akses langsung via URL browser dilarang.' 
        });
      }

      // 2. Jika ambil 1 detail film berdasarkan ID
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(404).json({ message: 'ID tidak valid' });
        }
        const film = await Film.findById(id).lean();
        if (!film) return res.status(404).json({ message: 'Film tidak ditemukan' });
        return res.status(200).json(film);
      }

      // 3. Ambil semua daftar film & sembunyikan gambar base64 yang sangat panjang
      const films = await Film.find().sort({ createdAt: -1 }).lean();

      const cleanedFilms = films.map((f) => {
        const obj = { ...f };
        // Sembunyikan string base64 gambar jika terlalu panjang
        if (obj.gambar && obj.gambar.startsWith('data:image')) {
          obj.gambar = '[Base64 Gambar Disembunyikan]';
        }
        return obj;
      });

      return res.status(200).json(cleanedFilms);
    }

    // WAJIB TERINTEGRASI SECURITY KETAT UNTUK OPERASI UBAH / TAMBAH / HAPUS (KHUSUS ADMIN)
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      if (!verifyAdminToken(req)) {
        return res.status(401).json({ message: 'Akses Ditolak! Token Anda tidak sah atau telah kedaluwarsa.' });
      }
    }

    if (req.method === 'POST') {
      const { judul, gambar, trailer, deskripsi, tahun, rating, kategori, bintang } = req.body || {};
      if (!judul) return res.status(400).json({ message: 'Judul film wajib diisi' });

      const newFilm = new Film({ 
        judul, gambar, trailer, deskripsi, 
        tahun: tahun || '2026', 
        rating: rating || '13+', 
        kategori: kategori || 'Film',
        bintang: Number(bintang) || 5
      });

      await newFilm.save();
      return res.status(201).json(newFilm);
    }

    if (req.method === 'PUT') {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'ID tidak valid' });

      const { judul, gambar, trailer, deskripsi, tahun, rating, kategori, bintang } = req.body || {};
      const updateData = { judul, trailer, deskripsi, tahun, rating, kategori, bintang: Number(bintang) || 5 };
      if (gambar) updateData.gambar = gambar;

      const updatedFilm = await Film.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!updatedFilm) return res.status(404).json({ message: 'Film tidak ditemukan' });
      return res.status(200).json(updatedFilm);
    }

    if (req.method === 'DELETE') {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'ID tidak valid' });
      await Film.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Film berhasil dihapus' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
  }
}