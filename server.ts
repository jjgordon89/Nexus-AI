/**
 * NexusAI API Server
 * 
 * This file creates an Express server to handle the NexusAI API endpoints.
 */

import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import helmet from 'helmet';
import { routes } from './src/lib/api';
import { db } from './src/lib/db';

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure security middleware
app.use(helmet({
  contentSecurityPolicy: false, // We'll use our custom CSP in the HTML
}));

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
  });
}

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://nexusai.app']  // Restrict in production
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON body parsing with limits
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch(e) {
      res.status(400).send({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure file upload middleware with restrictions and validation
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max file size
  },
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: true,
  createParentPath: true,
  parseNested: true,
}));

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Serve the React app for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Initialize database and start server
async function startServer() {
  try {
    // Initialize the database
    await db.initialize();
    console.log('Database initialized successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`NexusAI API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await db.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();