import { SignJWT, jwtVerify } from 'jose';

const key = new TextEncoder().encode(process.env.SECRET!);

export async function decrypt(session: string) {
  try {
    const verified = await jwtVerify(session, key);
    return verified.payload;
  } catch (err) {
    return null;
  }
}

export async function encrypt(payload: any, expirationTime: string | number | Date) {
  // Implementation for encrypting session tokens
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' }) // You must explicitly set the algorithm
      .setIssuedAt()
      .setExpirationTime(expirationTime)
      .sign(key);
    return token;
}
