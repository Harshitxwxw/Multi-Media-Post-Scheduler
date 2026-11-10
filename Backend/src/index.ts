import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import postRoutes from './routes/post.routes.js';
import mediaRoutes from './routes/media.routes.js';
import { schedulerService } from './services/scheduler.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media files statically
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Multi-Media Post Scheduler API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/posts', postRoutes);
app.use('/api/media', mediaRoutes);

// Start scheduler
schedulerService.start();

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend server is running at http://localhost:${PORT}`);
  console.log(`📦 Serving uploads from ${uploadsPath}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  schedulerService.stop();
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

