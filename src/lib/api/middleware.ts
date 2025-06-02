/**
 * API Middleware functions
 * 
 * This module provides middleware functions for API request handling,
 * such as authentication, error handling, and request validation.
 */

import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../auth';
import { AuthService } from '../auth/auth';

/**
 * Middleware to check if a user is authenticated
 * using JSON Web Tokens
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  // For demo purposes, we'll allow a fallback to the demo user
  // In a real app, you would remove this fallback
  if (!authHeader) {
    // Demo user fallback
    const demoUser = auth.getCurrentUser();
    if (demoUser) {
      req.user = demoUser;
      return next();
    }
    
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication required'
    });
  }
  
  // Check if the header is in the correct format
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication format'
    });
  }
  
  // Extract the token
  const token = authHeader.substring(7);
  
  // Verify the token
  AuthService.verifyToken(token)
    .then(user => {
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }
      
      // Attach user to request object
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name
      };
      
      next();
    })
    .catch(error => {
      console.error('Token verification error:', error);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication failed'
      });
    });
}

/**
 * Middleware for validating request body against a Zod schema
 */
export function validateRequest<T>(schema: z.Schema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

/**
 * Middleware for handling errors
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', err);
  
  // Check if we've already started sending a response
  if (res.headersSent) {
    return next(err);
  }
  
  // Handle different types of errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'The request data is invalid'
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token has expired'
    });
  }
  
  // Default error response
  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message
  });
}

/**
 * Middleware for handling not found routes
 */
export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
}

/**
 * Rate limiting middleware
 */
const requestCounts: Record<string, { count: number, resetTime: number }> = {};

export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get IP address or user ID (preferably)
    const key = req.user?.id || req.ip || 'unknown';
    const now = Date.now();
    
    // Initialize or reset if window has passed
    if (!requestCounts[key] || now > requestCounts[key].resetTime) {
      requestCounts[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    
    // Check if limit is reached
    if (requestCounts[key].count >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, please try again later',
        retryAfter: Math.ceil((requestCounts[key].resetTime - now) / 1000)
      });
    }
    
    // Increment count and continue
    requestCounts[key].count++;
    next();
  };
}