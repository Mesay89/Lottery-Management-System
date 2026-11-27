'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middleware/error.middleware');

// --- Route imports ---
const authRoutes          = require('./src/routes/auth.routes');
const userRoutes          = require('./src/routes/user.routes');
const lotteryEventRoutes  = require('./src/routes/lotteryEvent.routes');
const ticketRoutes        = require('./src/routes/ticket.routes');
const drawRoutes          = require('./src/routes/draw.routes');
const resultRoutes        = require('./src/routes/result.routes');
const winnerRoutes        = require('./src/routes/winner.routes');
const prizeRoutes         = require('./src/routes/prize.routes');
const prizeClaimRoutes    = require('./src/routes/prizeClaim.routes');
const transactionRoutes   = require('./src/routes/transaction.routes');
const notificationRoutes  = require('./src/routes/notification.routes');
const reportRoutes        = require('./src/routes/report.routes');
const auditLogRoutes      = require('./src/routes/auditLog.routes');

const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ─── General Middleware ───────────────────────────────────────────────────────
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OLMS API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Static Uploads (Payment Proofs) ─────────────────────────────────────────
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/events',        lotteryEventRoutes);
app.use('/api/lottery-events', lotteryEventRoutes);
app.use('/api/tickets',       ticketRoutes);
app.use('/api/draws',         drawRoutes);
app.use('/api/results',       resultRoutes);
app.use('/api/winners',       winnerRoutes);
app.use('/api/prizes',        prizeRoutes);
app.use('/api/prize-claims',  prizeClaimRoutes);
app.use('/api/transactions',  transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/audit-logs',    auditLogRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 OLMS Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully…`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  shutdown('uncaughtException');
});

module.exports = app;
