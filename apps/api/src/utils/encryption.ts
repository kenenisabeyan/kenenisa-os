import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM

// Use configured secret or derive a consistent 32-byte key
function getMasterKey(): Buffer {
  const secret = (config as any).INTEGRATION_ENCRYPTION_KEY || config.SESSION_SECRET || 'kenenisa-os-master-encryption-key-32b';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts plaintext string using AES-256-GCM authenticated encryption.
 * Returns formatted string: `${ivHex}:${ciphertextHex}:${authTagHex}`
 */
export function encryptCredential(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${ciphertext}:${tag.toString('hex')}`;
}

/**
 * Decrypts AES-256-GCM formatted ciphertext.
 */
export function decryptCredential(encryptedPayload: string): string {
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const ciphertext = parts[1];
  const tag = Buffer.from(parts[2], 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), iv);
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}
