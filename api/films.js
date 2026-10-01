import mongoose from 'mongoose';
import connectDB from './db.js';
import Film from './models/Film.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  const { id, full } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(404).json({ message: 'ID tidak valid atau merupakan film dummy' });
        }

        const film = await Film.findById(id);
        if (!film) return res.status(404).json({ message: 'Film tidak ditemukan' });
        return res.status(200).json(film);
      }

      const films = await Film.find().sort({ createdAt: -1 });

      if (full === 'true') {
        return res.status(200).json(films);
      }

      const cleanedFilms = films.map((f) => {
        const obj = f.toObject();

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

    if (req.method === 'POST') {
      const { judul, gambar, trailer, deskripsi, tahun, rating, kategori } = req.body;
      const newFilm = new Film({ 
        judul, 
        gambar, 
        trailer, 
        deskripsi, 
        tahun, 
        rating, 
        kategori 
      });
      await newFilm.save();
      return res.status(201).json(newFilm);
    }

    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ message: 'ID diperlukan' });

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID MongoDB tidak valid' });
      }

      const { judul, gambar, trailer, deskripsi, tahun, rating, kategori } = req.body;
      const updatedFilm = await Film.findByIdAndUpdate(
        id,
        { judul, gambar, trailer, deskripsi, tahun, rating, kategori },
        { new: true }
      );
      if (!updatedFilm) return res.status(404).json({ message: 'Film tidak ditemukan' });
      return res.status(200).json(updatedFilm);
    }

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
    return res.status(500).json({ message: err.message });
  }
}