/**
 * NexusAI API Server
 * 
 * This file creates an Express server to handle the NexusAI API endpoints.
 */

import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { routes } from './src/lib/api';
import { db } from './src/lib/db';

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://nexusai.app']  // Restrict in production
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure file upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max file size
  },
  abortOnLimit: true,
}));

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// API routes
app.use('/api', routes);

// Serve the React app in production
if (process.env.NODE_ENV === 'production') {
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
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();