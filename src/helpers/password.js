import bcrypt from 'bcryptjs';

export async function verifyPassword(input, stored) {
  if (!stored) return false;
  const looksHashed = /^\$2[aby]\$/.test(stored);
  if (looksHashed) {
    try { return await bcrypt.compare(input, stored); }
    catch { return false; }
  }
  // fallback to plain-text compare if the DB password isn’t hashed
  return input === stored;
}
