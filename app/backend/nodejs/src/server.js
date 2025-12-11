import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import disasterRoutes from './routes/api/disasters.js';
import weatherRoutes from './routes/api/weather.js';
import predictionRoutes from './routes/api/predictions.js';
import emergencyRoutes from './routes/api/emergency.js';
import reliefRoutes from './routes/api/relief.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'PDME Node.js Backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/disasters', disasterRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/relief', reliefRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 PDME Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
  console.log(`🐍 Python Backend: ${config.pythonBackendUrl}`);
});

export default app;

