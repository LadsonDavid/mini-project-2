import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/config.js';
import websocketService from './services/websocketService.js';
import deviceRoutes from './routes/deviceRoutes.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Headband Backend is Running',
    endpoints: {
      health: '/health',
      api: '/api',
      ws: 'ws://' + req.headers.host + '/frontend'
    }
  });
});

app.use('/api', deviceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    esp32Connected: websocketService.isESP32Connected(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Initialize WebSocket service
websocketService.initialize(server);

const PORT = config.wsPort || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

