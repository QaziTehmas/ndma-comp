import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/pdme_db',
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Python Backend
  pythonBackendUrl: process.env.PYTHON_BACKEND_URL || 'http://localhost:8000',
  
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

// Validate required environment variables
if (!config.databaseUrl) {
  console.warn('⚠️  DATABASE_URL not set. Using default.');
}

export default config;

