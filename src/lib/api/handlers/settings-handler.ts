/**
 * Settings API handlers
 * 
 * This module handles requests related to user settings.
 */

import { Request, Response } from 'express';
import { SettingsRepository } from '../../db';
import { UpdateSettingsSchema } from '../types';

/**
 * Get user settings
 */
export async function getSettings(req: Request, res: Response) {
  try {
    const userId = req.user?.id || 'demo-user';
    
    const settings = await SettingsRepository.getSettings(userId);
    
    if (!settings) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Settings not found'
      });
    }
    
    // Remove sensitive data
    if (settings.ai) {
      settings.ai.apiKey = undefined;
    }
    
    return res.json({ settings });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to retrieve settings'
    });
  }
}

/**
 * Update user settings
 */
export async function updateSettings(req: Request, res: Response) {
  try {
    // Validate request
    const updates = UpdateSettingsSchema.parse(req.body);
    
    const userId = req.user?.id || 'demo-user';
    
    // Get current settings
    let settings = await SettingsRepository.getSettings(userId);
    
    if (!settings) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Settings not found'
      });
    }
    
    // Apply updates
    const updatedSettings = {
      ...settings,
      ...updates,
      profile: { ...settings.profile, ...updates.profile },
      appearance: { ...settings.appearance, ...updates.appearance },
      ai: { ...settings.ai, ...updates.ai },
      // Add other settings as needed
    };
    
    // Save settings
    await SettingsRepository.saveSettings(userId, updatedSettings);
    
    // Remove sensitive data from response
    if (updatedSettings.ai) {
      updatedSettings.ai.apiKey = undefined;
    }
    
    return res.json({ settings: updatedSettings });
  } catch (error) {
    console.error('Failed to update settings:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors
      });
    }
    
    return res.status(500).json({
      error: 'Database Error',
      message: 'Failed to update settings'
    });
  }
}