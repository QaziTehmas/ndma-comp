/**
 * Dynamic Environment Configurations
 * Centralized API endpoints that fallback gracefully in development and production
 */

// Python Backend URL (for prediction models, scraping, and chatbot)
export const PYTHON_BACKEND_URL = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8000';

// Node.js Backend API Base URL (for database storage and operations)
export const NODEJS_BACKEND_URL = import.meta.env.VITE_NODEJS_API_BASE || 'http://localhost:3001';
