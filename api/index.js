import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

import filmsRoutes from './films.js';
import loginRoutes from './login.js';
import authRoutes from './auth.js'; // Import file auth baru

const app = express();

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send('🚀 Backend Berhasil Berjalan!');
});

// Mapping Route API
app.use('/api/films', filmsRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/auth', authRoutes); // Register endpoint verifikasi & auth

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

export default serverless(app);