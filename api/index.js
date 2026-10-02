import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

import filmsRoutes from './films.js';
import loginRoutes from './login.js';

const app = express();

app.use(cors());

// Perbesar batas payload JSON & URL Encoded agar bisa menerima gambar Base64 hingga 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Endpoint Tes
app.get('/', (req, res) => {
  res.send('🚀 Backend Berhasil Berjalan!');
});

// Mapping Route API
app.use('/api/films', filmsRoutes);
app.use('/api/login', loginRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

export default serverless(app);