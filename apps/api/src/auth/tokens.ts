import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'node:crypto';

const getSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me-in-production');

export type TokenRole = 'user' | 'guest';

export type TokenPayload = {
  sub: string;
  role: TokenRole;
};

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (!payload.sub || !payload['role']) {
    throw new Error('Invalid token payload');
  }
  return {
    sub: payload.sub,
    role: payload['role'] as TokenRole,
  };
}

export function generateRefreshToken(): string {
  return randomBytes(40).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshExpiresAt(isGuest: boolean): Date {
  const ms = isGuest ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}
