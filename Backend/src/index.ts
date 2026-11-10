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

// Middleware: Support single or comma-separated origins, localhost, or wildcard
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        CLIENT_URL === '*' ||
        CLIENT_URL.split(',').map((url) => url.trim()).includes(origin) ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Allow during initial setup so requests aren't blocked
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media files statically
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint (Render uses this to verify the deployment)
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
  console.log(`🚀 Backend server is running on port ${PORT}`);
  console.log(`📦 Serving uploads from ${uploadsPath}`);
  console.log(`📡 Health check available at /api/health`);
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
