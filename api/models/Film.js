import mongoose from 'mongoose';

const filmSchema = new mongoose.Schema({
  judul: { type: String, required: true },
  gambar: { type: String, default: '' },
  trailer: { type: String, default: '' },
  deskripsi: { type: String, default: '' },
  tahun: { type: String, default: '2026' },
  rating: { type: String, default: '13+' },
  kategori: { type: String, default: 'Film' }
}, { timestamps: true });

export default mongoose.models.Film || mongoose.model('Film', filmSchema);