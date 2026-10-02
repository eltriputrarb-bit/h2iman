import mongoose from 'mongoose';
import connectDB from './db.js';
import Film from './models/Film.js';

const ADMIN_SECRET_TOKEN = process.env.ADMIN_TOKEN_SECRET || 'SECRET_ADMIN_TOKEN_2026_SECURE';

// Helper verifikasi token keamanan
const verifyAdmin = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  return token === ADMIN_SECRET_TOKEN;
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
  const isFull = query.full === 'true' || query.full === true;

  try {
    // 1. GET: Bebas diakses publik (atau terproteksi jika full=true)
    if (req.method === 'GET') {
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(404).json({ message: 'ID tidak valid' });
        }
        const film = await Film.findById(id).lean();
        if (!film) return res.status(404).json({ message: 'Film tidak ditemukan' });
        return res.status(200).json(film);
      }

      const films = await Film.find().sort({ createdAt: -1 }).lean();

      if (isFull) {
        // Cek token saat meminta full data
        if (!verifyAdmin(req)) {
          return res.status(401).json({ message: 'Akses ditolak. Token tidak valid.' });
        }
        return res.status(200).json(films);
      }

      const cleanedFilms = films.map((f) => {
        const obj = { ...f };
        if (obj.gambar && obj.gambar.startsWith('data:image')) {
          obj.gambar = '[Base64 Gambar Disembunyikan]';
        }
        obj.judul = '[Disembunyikan]';
        obj.deskripsi = '[Disembunyikan]';
        delete obj.createdAt;
        delete obj.updatedAt;
        delete obj.__v;
        return obj;
      });

      return res.status(200).json(cleanedFilms);
    }

    // Protection Check untuk aksi Mutasi Data (POST, PUT, DELETE)
    if (!verifyAdmin(req)) {
      return res.status(401).json({ message: 'Sesi tidak valid atau token salah. Silakan relog.' });
    }

    // 2. POST: Tambah Film
    if (req.method === 'POST') {
      const { judul, gambar, trailer, deskripsi, tahun, rating, kategori, bintang } = req.body || {};
      
      if (!judul) {
        return res.status(400).json({ message: 'Judul film wajib diisi' });
      }

      const starValue = (bintang !== undefined && bintang !== null && !isNaN(Number(bintang))) 
        ? Number(bintang) 
        : 5;

      const newFilm = new Film({ 
        judul, 
        gambar, 
        trailer, 
        deskripsi, 
        tahun: tahun || '2026', 
        rating: rating || '13+', 
        kategori: kategori || 'Film',
        bintang: starValue
      });

      await newFilm.save();
      return res.status(201).json(newFilm);
    }

    // 3. PUT: Edit Film
    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ message: 'ID diperlukan' });

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID MongoDB tidak valid' });
      }

      const { judul, gambar, trailer, deskripsi, tahun, rating, kategori, bintang } = req.body || {};
      
      const starValue = (bintang !== undefined && bintang !== null && !isNaN(Number(bintang))) 
        ? Number(bintang) 
        : 5;

      const updateData = { 
        judul, 
        trailer, 
        deskripsi, 
        tahun, 
        rating, 
        kategori, 
        bintang: starValue 
      };

      if (gambar) {
        updateData.gambar = gambar;
      }

      const updatedFilm = await Film.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (!updatedFilm) return res.status(404).json({ message: 'Film tidak ditemukan' });
      return res.status(200).json(updatedFilm);
    }

    // 4. DELETE: Hapus Film
    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ message: 'ID diperlukan' });

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID MongoDB tidak valid' });
      }

      await Film.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Film berhasil dihapus' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
  }
}