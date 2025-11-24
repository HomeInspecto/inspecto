/**
 * Token decryption utility for Astro (Node.js)
 * Decrypts tokens received from the frontend
 */

import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET || import.meta.env.SECRET || 'default-secret-key-change-in-production';

/**
 * Decrypts a token that was encrypted on the frontend
 */
export function decryptToken(encryptedToken: string): string {
  try {
    // Decode from URL encoding
    const base64 = decodeURIComponent(encryptedToken);
    
    // Decode from base64
    const encrypted = Buffer.from(base64, 'base64').toString('binary');
    
    // Decrypt using XOR (matching frontend encryption)
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Token decryption error:', error);
    // Fallback: return decoded token if decryption fails
    return decodeURIComponent(encryptedToken);
  }
}

/**
 * Alternative: Using Node.js crypto for Web Crypto API encrypted tokens
 */
export function decryptTokenWebCrypto(encryptedToken: string): string {
  try {
    // Decode from URL encoding
    const base64 = decodeURIComponent(encryptedToken);
    
    // Decode from base64
    const combined = Buffer.from(base64, 'base64');
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Derive key from secret using PBKDF2
    const key = crypto.pbkdf2Sync(
      SECRET_KEY,
      'inspecto-salt',
      100000,
      32,
      'sha256'
    );
    
    // Decrypt using AES-GCM
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    
    // Extract auth tag (last 16 bytes of encrypted data)
    const authTag = encrypted.slice(-16);
    const ciphertext = encrypted.slice(0, -16);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Web Crypto decryption error:', error);
    // Fallback to simple decryption
    return decryptToken(encryptedToken);
  }
}

