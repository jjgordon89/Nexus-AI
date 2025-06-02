/**
 * Settings repository for database operations
 * 
 * This module provides functions for managing user settings records in the database.
 */

import { db } from '../client';
import { UserSettingsRecord, UserSettingsSchema } from '../schema';
import { UserSettings } from '../../../types/settings';

export class SettingsRepository {
  /**
   * Create or update user settings
   */
  static async saveSettings(userId: string, settings: UserSettings): Promise<void> {
    const settingsJson = JSON.stringify(settings);
    
    // Check if settings already exist
    const existingSettings = await this.findByUserId(userId);
    
    const settingsRecord: UserSettingsRecord = {
      user_id: userId,
      settings_json: settingsJson,
    };
    
    // Validate the settings data
    UserSettingsSchema.parse(settingsRecord);
    
    if (existingSettings) {
      // Update existing settings
      await db.update('user_settings', userId, {
        settings_json: settingsJson,
      });
    } else {
      // Create new settings
      await db.insert('user_settings', settingsRecord);
    }
  }

  /**
   * Find settings by user ID
   */
  static async findByUserId(userId: string): Promise<UserSettingsRecord | null> {
    const settings = await db.findById('user_settings', userId);
    return settings ? UserSettingsSchema.parse(settings) : null;
  }

  /**
   * Get settings in application format
   */
  static async getSettings(userId: string): Promise<UserSettings | null> {
    const settingsRecord = await this.findByUserId(userId);
    
    if (!settingsRecord) {
      return null;
    }
    
    try {
      return JSON.parse(settingsRecord.settings_json) as UserSettings;
    } catch (error) {
      console.error('Error parsing settings JSON:', error);
      return null;
    }
  }

  /**
   * Delete user settings
   */
  static async deleteSettings(userId: string): Promise<void> {
    await db.delete('user_settings', userId);
  }
}