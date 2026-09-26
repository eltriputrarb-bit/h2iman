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

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        const film = await Film.findById(id);
        if (!film) return res.status(404).json({ message: 'Film tidak ditemukan' });
        return res.status(200).json(film);
      }

      const films = await Film.find().sort({ createdAt: -1 });

      const acceptHeader = req.headers['accept'] || '';
      const isDirectBrowser = acceptHeader.includes('text/html');

      // Jika dibuka langsung di browser, ubah Base64 jadi preview gambar kecil
      if (isDirectBrowser) {
        const cleanedFilms = films.map((f) => {
          const obj = f.toObject();
          if (obj.gambar && obj.gambar.startsWith('data:image')) {
            obj.gambar = `<img src="${obj.gambar}" style="max-height:80px; border-radius:4px;" alt="preview" />`;
          }
          return obj;
        });
        return res.status(200).json(cleanedFilms);
      }

      // Untuk frontend (React fetch/axios), tetap kirim data Base64 asli
      return res.status(200).json(films);
    }

    if (req.method === 'POST') {
      const { judul, gambar, trailer, deskripsi } = req.body;
      const newFilm = new Film({ judul, gambar, trailer, deskripsi });
      await newFilm.save();
      return res.status(201).json(newFilm);
    }

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