import connectDB from './db.js';
import Film from './models/Film.js';

export default async function handler(req, res) {
  // Set CORS Header untuk Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  const { id } = req.query;

  try {
    // GET: Ambil semua film ATAU ambil 1 film berdasarkan ID
    if (req.method === 'GET') {
      // 1. Ambil 1 Film Lengkap (Termasuk Gambar Utuh untuk Detail Page)
      if (id) {
        const film = await Film.findById(id);
        if (!film) return res.status(404).json({ message: 'Film tidak ditemukan' });
        return res.status(200).json(film);
      }

      // 2. Ambil Semua Film (Teks Base64 Gambar Disingkat Agar API Rapi)
      const films = await Film.find().sort({ createdAt: -1 });

      const cleanedFilms = films.map((f) => {
        const obj = f.toObject();
        // Jika gambar berupa teks Base64 panjang, sembunyikan di tampilan API
        if (obj.gambar && obj.gambar.startsWith('data:image')) {
          obj.gambar = '[Base64 Gambar Disembunyikan]';
        }
        return obj;
      });

      return res.status(200).json(cleanedFilms);
    }

    // POST: Tambah Film Baru
    if (req.method === 'POST') {
      const { judul, gambar, trailer, deskripsi } = req.body;
      const newFilm = new Film({ judul, gambar, trailer, deskripsi });
      await newFilm.save();
      return res.status(201).json(newFilm);
    }

    // PUT: Update Film berdasarkan ID
    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ message: 'ID diperlukan' });
      const { judul, gambar, trailer, deskripsi } = req.body;
      const updatedFilm = await Film.findByIdAndUpdate(
        id,
        { judul, gambar, trailer, deskripsi },
        { new: true }
      );
      if (!updatedFilm) return res.status(404).json({ message: 'Film tidak ditemukan' });
      return res.status(200).json(updatedFilm);
    }

    // DELETE: Hapus Film berdasarkan ID
    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ message: 'ID diperlukan' });
      await Film.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Film berhasil dihapus' });
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}