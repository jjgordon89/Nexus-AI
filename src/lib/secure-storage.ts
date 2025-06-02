import { nanoid } from 'nanoid';

/**
 * A utility for securely storing sensitive information like API keys
 * Uses a combination of localStorage and sessionStorage with simple encryption
 */
export class SecureStorage {
  private readonly storagePrefix: string;
  private readonly encryptionKey: string;

  constructor(namespace: string = 'nexus') {
    this.storagePrefix = `${namespace}_secure_`;
    // Create or retrieve an encryption key stored in sessionStorage
    // This isn't perfect security, but it's better than plaintext
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  /**
   * Stores a value securely
   * @param key The key to store the value under
   * @param value The value to store
   */
  setItem(key: string, value: string): void {
    if (!value) return;
    
    try {
      // Generate a random ID for this value
      const itemId = nanoid();
      
      // Encrypt the value
      const encryptedValue = this.encrypt(value);
      
      // Store the encrypted value in localStorage
      localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify({
        id: itemId,
        value: encryptedValue,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to securely store item:', error);
      // Fallback to regular storage in case of error
      localStorage.setItem(`${this.storagePrefix}${key}_fallback`, value);
    }
  }

  /**
   * Retrieves a securely stored value
   * @param key The key to retrieve
   * @returns The decrypted value or null if not found
   */
  getItem(key: string): string | null {
    try {
      const item = localStorage.getItem(`${this.storagePrefix}${key}`);
      if (!item) {
        // Check fallback
        const fallback = localStorage.getItem(`${this.storagePrefix}${key}_fallback`);
        return fallback;
      }
      
      const { value } = JSON.parse(item);
      return this.decrypt(value);
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      // Try fallback
      return localStorage.getItem(`${this.storagePrefix}${key}_fallback`);
    }
  }

  /**
   * Removes a securely stored value
   * @param key The key to remove
   */
  removeItem(key: string): void {
    localStorage.removeItem(`${this.storagePrefix}${key}`);
    localStorage.removeItem(`${this.storagePrefix}${key}_fallback`);
  }

  /**
   * Clears all securely stored values for this namespace
   */
  clear(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  private getOrCreateEncryptionKey(): string {
    const sessionKey = 'nexus_encryption_key';
    let key = sessionStorage.getItem(sessionKey);
    
    if (!key) {
      // Generate a random key
      key = nanoid(32);
      sessionStorage.setItem(sessionKey, key);
    }
    
    return key;
  }

  private encrypt(text: string): string {
    // Simple XOR encryption - not cryptographically secure but better than plaintext
    // For production, use a proper encryption library
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Base64 encode the result
  }

  private decrypt(encryptedText: string): string {
    try {
      const text = atob(encryptedText); // Base64 decode
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }
}

// Export a singleton instance
export const secureStorage = new SecureStorage();