/**
 * API Middleware functions
 * 
 * This module provides middleware functions for API request handling,
 * such as authentication, error handling, and request validation.
 */

import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../auth';

/**
 * Middleware to check if a user is authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // For demo purposes, we'll assume the user is always authenticated
  // In a real application, this would check the session or JWT token
  const user = auth.getCurrentUser();
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'You must be logged in to access this resource' 
    });
  }
  
  // Attach user to request object for later use
  req.user = user;
  next();
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