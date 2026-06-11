import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import { clerkMiddleware } from '@clerk/express';

import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';
import { upload } from './middleware/upload.js';
import { requireClerkAuth, requireAdmin } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(clerkMiddleware());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use('/uploads', express.static('uploads'));

app.post(
  '/api/upload',
  requireClerkAuth,
  requireAdmin,
  (req, res, next) => {
    upload.array('images', 4)(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${error.message}` });
      }

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return next();
    });
  },
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const protocol = req.protocol;
      const host = req.get('host');
      const urls = req.files.map((file) => `${protocol}://${host}/uploads/${file.filename}`);

      return res.json({ success: true, urls });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to process uploaded images' });
    }
  },
);

app.get('/api/config', (req, res) => {
  res.json({
    businessName: 'MS SUMA TRADERS',
    district: 'Brahmanbaria',
    deliveryArea: 'All 9 upazilas of Brahmanbaria district',
    wholesaleMinimumBags: 10,
    supportHours: '9:00 AM - 9:00 PM',
    bkashNumber: process.env.BKASH_NUMBER || '01XXXXXXXXX',
    nagadNumber: process.env.NAGAD_NUMBER || '01XXXXXXXXX',
    whatsapp: process.env.BUSINESS_WHATSAPP || '01XXXXXXXXX',
    phone: process.env.BUSINESS_PHONE || '01XXXXXXXXX',
    upazilas: [
      'Brahmanbaria Sadar',
      'Ashuganj',
      'Sarail',
      'Bancharampur',
      'Kasba',
      'Nabinagar',
      'Nasirnagar',
      'Bijoynagar',
      'Akhaura',
    ],
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MS SUMA TRADERS API is running',
    time: new Date().toISOString(),
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`MS SUMA TRADERS API running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
