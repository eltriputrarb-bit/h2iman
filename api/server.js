const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cache koneksi MongoDB untuk Serverless (Vercel) & Local
async function connectDB() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI belum dikonfigurasi di Environment Variables!');
    }
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
    });
}

// Middleware koneksi database per-request (aman untuk Vercel Serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection error:', err.message);
        return res.status(500).json({
            error: 'Koneksi database gagal. Pastikan MONGODB_URI telah diset di Vercel Environment Variables.',
            details: err.message
        });
    }
});

// Model Schema Produk dengan 3 Foto, Bahan, Ukuran, dan Berat
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },       // Foto utama (thumbnail)
    images: { type: [String], default: [] },    // Array menampung 3 foto
    material: { type: String, default: '' },   // Bahan
    sizes: { type: String, default: '' },      // Ukuran
    weight: { type: String, default: '' }      // Berat
}, { timestamps: true });

// Hindari OverwriteModelError pada Vercel hot reloads / serverless invocations
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Model Schema Pesanan
const orderSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Diproses' }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Router API
const router = express.Router();

// Health Check Endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Helper untuk menyembunyikan Base64 panjang menjadi URL gambar penyimpanan bersih (/st/images/) mirip CDN
function sanitizeProduct(product) {
    if (!product) return null;
    const p = product.toObject ? product.toObject() : { ...product };

    if (p.image && p.image.startsWith('data:image')) {
        p.image = `/st/images/${p._id}-0.jpg`;
    }
    if (Array.isArray(p.images)) {
        p.images = p.images.map((img, idx) => {
            if (img && img.startsWith('data:image')) {
                return `/st/images/${p._id}-${idx}.jpg`;
            }
            return img;
        });
    }
    return p;
}

// Endpoint Khusus Stream Gambar Biner (Menyamarkan data base64 menjadi URL file .jpg seperti YouTube)
router.get('/images/:file', async (req, res) => {
    try {
        const fileParam = req.params.file.replace(/\.jpg$|\.jpeg$|\.png$|\.webp$/i, '');
        const parts = fileParam.split('-');
        const productId = parts[0];
        const imgIndex = parts[1] !== undefined ? parseInt(parts[1], 10) : 0;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Gambar tidak ditemukan' });
        }

        let rawBase64 = '';
        if (Array.isArray(product.images) && product.images[imgIndex]) {
            rawBase64 = product.images[imgIndex];
        } else if (imgIndex === 0 && product.image) {
            rawBase64 = product.image;
        }

        if (!rawBase64 || !rawBase64.startsWith('data:image')) {
            return res.status(404).json({ message: 'Data gambar kosong' });
        }

        const mimeMatch = rawBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const cleanBase64 = rawBase64.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(cleanBase64, 'base64');

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
        return res.send(imgBuffer);
    } catch (err) {
        return res.status(400).json({ message: 'Gagal memuat gambar', error: err.message });
    }
});

// Endpoint API Produk (Data Base64 disembunyikan dan diubah menjadi URL gambar rapi)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        const sanitized = products.map(sanitizeProduct);
        res.json(sanitized);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
        res.json(sanitizeProduct(product));
    } catch (err) {
        res.status(400).json({ message: 'ID tidak valid' });
    }
});

router.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(sanitizeProduct(newProduct));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/products/:id', async (req, res) => {
    try {
        const existing = await Product.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Produk tidak ditemukan' });

        const updateData = { ...req.body };

        // Jika foto dikirim kembali sebagai URL /st/images atau /api/images, pertahankan base64 lama
        if (updateData.image && (updateData.image.startsWith('/st/images') || updateData.image.startsWith('/api/images'))) {
            updateData.image = existing.image;
        }
        if (Array.isArray(updateData.images)) {
            updateData.images = updateData.images.map((img, idx) => {
                if (img && (img.startsWith('/st/images') || img.startsWith('/api/images'))) {
                    return (existing.images && existing.images[idx]) ? existing.images[idx] : existing.image;
                }
                return img;
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(sanitizeProduct(updatedProduct));
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Endpoint API Pesanan
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pesanan berhasil dihapus' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Dukung route dengan prefix /st (storage assets), /api, maupun root
app.use('/st', router);
app.use('/api', router);
app.use('/', router);

// Jalankan listener jika file dijalankan langsung (lokal)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server jalan di http://localhost:${PORT}`);
    });
}

// Export app untuk Vercel Serverless Function
module.exports = app;