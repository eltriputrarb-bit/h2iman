import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI / MONGODB_URI tidak ditemukan di Environment Variables!');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Terhubung ke MongoDB Atlas!');
  } catch (error) {
    console.error('❌ Gagal koneksi ke MongoDB:', error.message);
    throw error;
  }
};

export default connectDB;