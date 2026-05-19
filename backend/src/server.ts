import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db';
import { initSocket } from './socket';
import sessionRoutes from './routes/sessions';
import consentRoutes from './routes/consent';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Parsing ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TrustLens AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/consent', consentRoutes);

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── HTTP + Socket.io Server ─────────────────────────────────────────────────
const httpServer = http.createServer(app);
initSocket(httpServer);

// ─── Start Server ────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║          TrustLens AI — Backend              ║');
      console.log(`║  Server running on http://localhost:${PORT}    ║`);
      console.log('║  Environment: ' + (process.env.NODE_ENV || 'development').padEnd(29) + '║');
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
