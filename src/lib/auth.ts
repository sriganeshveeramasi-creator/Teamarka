import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'arka_sih_2026_super_secure_jwt_token_secret_key_848129712';
export const AUTH_COOKIE_NAME = 'arka_session';

export type UserRole = 'user' | 'officer' | 'admin';

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Sign a secure JWT session token valid for 7 days
 */
export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode the JWT session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    if (decoded && decoded.userId && decoded.email) {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract and verify session from request cookies
 */
export function getSessionFromCookie(cookieHeader: string | null): SessionPayload | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const authCookie = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!authCookie) return null;

  const token = authCookie.substring(`${AUTH_COOKIE_NAME}=`.length);
  return verifySessionToken(token);
}
