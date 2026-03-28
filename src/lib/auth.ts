import { jwtVerify } from 'jose';

const key = new TextEncoder().encode(process.env.SECRET!);

export async function decrypt(session: string) {
  try {
    const verified = await jwtVerify(session, key);
    return verified.payload;
  } catch (err) {
    return null;
  }
}

export async function encrypt(payload: any) {
  // Implementation for encrypting session tokens
  // This would typically use jose.SignJWT
}
