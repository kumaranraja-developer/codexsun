// =================================== helpers/password.ts ===================================
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(_scrypt) as (pass: string, salt: string, keylen: number) => Promise<Buffer>;


export async function hashPassword(plain: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = await scrypt(plain, salt, 64);
    return `s2$${salt}$${buf.toString('hex')}`;
}


export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    const [prefix, salt, hex] = hashed.split('$');
    if (prefix !== 's2' || !salt || !hex) return false;
    const buf = await scrypt(plain, salt, 64);
    const h = Buffer.from(hex, 'hex');
    return timingSafeEqual(buf, h);
}