import crypto from 'node:crypto';

/**
 * Generate unique ID.
 */
export const generateUUID = (): string =>
  crypto.randomBytes(16).toString('hex');
