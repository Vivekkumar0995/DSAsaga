import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.SECRET;

if (!secret) {
  throw new Error(
    '[jose_auth] Missing required environment variable: SECRET. ' +
    'Add it to your .env.local file.',
  );
}

const key = new TextEncoder().encode(secret);

export async function decrypt(session: string) {
  try {
    const { payload } = await jwtVerify(session, key);
    return payload;
  } catch {

    return null;
  }
}

/**
 * Signs a new JWT with the given payload and expiration time.
 * @param payload     - Data to embed in the token.
 * @param expiresIn   - Expiry as a string (e.g. '7d', '2h') or Unix timestamp.
 */
export async function encrypt(
  payload: Record<string, unknown>,
  expiresIn: string | number | Date,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}
