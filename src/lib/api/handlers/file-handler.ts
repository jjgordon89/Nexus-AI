/**
 * File API handlers
 * 
 * This module handles requests related to file uploads and management.
 */

import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { FileHandler as FileUtility } from '../../file-handler';
import path from 'path';
import fs from 'fs';
import { getMaxFileSize } from '../../../config';

// Directory for file uploads
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Handle file upload
 */
export async function uploadFile(req: Request, res: Response) {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No files were uploaded'
      });
    }
    
    // Get the file from the request
    const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
    
    // Validate file
    const validation = FileUtility.validateFile({
      name: file.name,
      size: file.size,
      type: file.mimetype,
      lastModified: Date.now(),
    } as File);
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid File',
        message: validation.message
      });
    }
    
    // Generate a unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${nanoid()}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    // Save the file
    await new Promise<void>((resolve, reject) => {
      file.mv(filePath, (err: Error) => {
        if (err) return reject(err);
        resolve();
      });
    });
    
    // Calculate file URL
    const fileUrl = `/api/files/${fileName}`;
    
    return res.status(201).json({
      id: nanoid(),
      name: file.name,
      type: file.mimetype,
      size: file.size,
      path: filePath,
      url: fileUrl,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      error: 'Upload Failed',
      message: error.message || 'Failed to upload file'
    });
  }
}

/**
 * Get a file
 */
export async function getFile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const filePath = path.join(UPLOADS_DIR, id);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'File not found'
      });
    }
    
    return res.sendFile(filePath);
  } catch (error) {
    console.error('File retrieval error:', error);
    return res.status(500).json({
      error: 'File Retrieval Failed',
      message: error.message || 'Failed to retrieve file'
    });
  }
}

/**
 * Delete a file
 */
export async function deleteFile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const filePath = path.join(UPLOADS_DIR, id);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'File not found'
      });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('File deletion error:', error);
    return res.status(500).json({
      error: 'File Deletion Failed',
      message: error.message || 'Failed to delete file'
    });
  }
}