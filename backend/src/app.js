import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import retailerRoutes from './routes/retailerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import roleRoutes from './routes/roleRoutes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter disabled for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: { message: 'Too many requests, please try again later' }
// });
// app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api', companyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

export default app;
