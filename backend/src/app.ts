import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/product.routes';
import categoryRoutes from './modules/categories/category.routes';
import customerRoutes from './modules/customers/customer.routes';
import supplierRoutes from './modules/suppliers/supplier.routes';
import warehouseRoutes from './modules/warehouses/warehouse.routes';
import unitRoutes from './modules/units/unit.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import salesRoutes from './modules/sales/sales.routes';
import purchaseRoutes from './modules/purchases/purchase.routes';

const app = express();

// Global middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (
        origin.includes('localhost') ||
        origin.includes('vercel.app') ||
        origin.includes('onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import { db } from './config/database';

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Flower Shop Management API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Health check with database verification
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    const [rows] = await db.query('SELECT 1 as connected');
    if (rows) dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchases', purchaseRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint không tồn tại' });
});

// Global error handler
app.use(errorHandler);

export default app;
