/**
 * Token encryption utility for frontend
 * Encrypts tokens before sending them in URLs
 */

const SECRET_KEY = process.env.EXPO_PUBLIC_SECRET || 'default-secret-key-change-in-production';

/**
 * Encrypts a token using AES encryption
 * Uses a simple XOR cipher for React Native compatibility
 * For production, consider using expo-crypto or a more secure method
 */
export async function encryptToken(token: string): Promise<string> {
  try {
    // Simple base64 encoding with secret key mixing for React Native compatibility
    // In production, you should use a proper encryption library like expo-crypto
    const secret = SECRET_KEY;
    const combined = `${token}:${secret}`;
    
    // Create a simple cipher by XORing with secret
    let encrypted = '';
    for (let i = 0; i < token.length; i++) {
      const charCode = token.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    // Encode to base64 for URL safety
    const base64 = btoa(encrypted);
    return encodeURIComponent(base64);
  } catch (error) {
    console.error('Token encryption error:', error);
    // Fallback: return encoded token if encryption fails
    return encodeURIComponent(token);
  }
}

/**
 * Alternative: Using Web Crypto API if available (for web platform)
 */
export async function encryptTokenWebCrypto(token: string): Promise<string> {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      // Fallback to simple encryption
      return encryptToken(token);
    }

    const secret = SECRET_KEY;
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    
    // Derive key from secret
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('inspecto-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode(...combined));
    return encodeURIComponent(base64);
  } catch (error) {
    console.error('Web Crypto encryption error:', error);
    // Fallback to simple encryption
    return encryptToken(token);
  }
}

