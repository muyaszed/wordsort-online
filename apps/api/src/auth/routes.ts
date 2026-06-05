import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Google } from 'arctic';
import { createDb, users, refresh_tokens, eq, and, gt } from '@wordsort/db';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  refreshExpiresAt,
  verifyAccessToken,
} from './tokens';

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

function getGoogle() {
  const redirectURI =
    process.env.GOOGLE_REDIRECT_URI ?? 'http://localhost:3000/auth/callback';
  return new Google(
    process.env.GOOGLE_CLIENT_ID ?? '',
    process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirectURI,
  );
}

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
});

async function issueTokenPair(
  userId: string,
  isGuest: boolean,
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const db = getDb();
  const role = isGuest ? 'guest' : ('user' as const);

  const accessToken = await signAccessToken({ sub: userId, role });
  const rawRefresh = generateRefreshToken();
  const tokenHash = hashToken(rawRefresh);
  const expiresAt = refreshExpiresAt(isGuest);

  await db.insert(refresh_tokens).values({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt });

  return { access_token: accessToken, refresh_token: rawRefresh, expires_in: 900 };
}

export const authRouter = new Hono();

// POST /auth/register
authRouter.post('/register', async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body' });
  }

  const { email, username, password } = registerSchema.parse(raw);
  const db = getDb();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    throw new HTTPException(409, { message: 'Email already registered' });
  }

  const [existingUsername] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existingUsername) {
    throw new HTTPException(409, { message: 'Username already taken' });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({ email, username, password_hash, is_guest: false })
    .returning({ id: users.id, email: users.email, username: users.username });

  const tokens = await issueTokenPair(user.id, false);
  return c.json({ user: { id: user.id, email: user.email, username: user.username }, ...tokens }, 201);
});

// POST /auth/login
authRouter.post('/login', async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body' });
  }

  const { email, password } = loginSchema.parse(raw);
  const db = getDb();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.password_hash) {
    throw new HTTPException(401, { message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new HTTPException(401, { message: 'Invalid credentials' });
  }

  const tokenData = await issueTokenPair(user.id, false);
  return c.json({
    user: { id: user.id, email: user.email, username: user.username },
    ...tokenData,
  });
});

// POST /auth/guest
authRouter.post('/guest', async (c) => {
  const db = getDb();
  const suffix = randomBytes(4).toString('hex');
  const username = `guest_${suffix}`;

  const [user] = await db
    .insert(users)
    .values({ username, is_guest: true })
    .returning({ id: users.id, username: users.username });

  const tokenData = await issueTokenPair(user.id, true);
  return c.json({ user: { id: user.id, username: user.username }, ...tokenData }, 201);
});

// POST /auth/refresh
authRouter.post('/refresh', async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body' });
  }

  const { refresh_token: rawToken } = refreshSchema.parse(raw);
  const db = getDb();
  const tokenHash = hashToken(rawToken);
  const now = new Date();

  const [stored] = await db
    .select()
    .from(refresh_tokens)
    .where(and(eq(refresh_tokens.token_hash, tokenHash), gt(refresh_tokens.expires_at, now)))
    .limit(1);

  if (!stored) {
    throw new HTTPException(401, { message: 'Invalid or expired refresh token' });
  }

  const [user] = await db
    .select({ id: users.id, is_guest: users.is_guest })
    .from(users)
    .where(eq(users.id, stored.user_id))
    .limit(1);

  if (!user) {
    throw new HTTPException(401, { message: 'User not found' });
  }

  // Rotate: delete old token
  await db.delete(refresh_tokens).where(eq(refresh_tokens.token_hash, tokenHash));

  const role = user.is_guest ? 'guest' : ('user' as const);
  const accessToken = await signAccessToken({ sub: user.id, role });

  const rawRefresh = generateRefreshToken();
  const newHash = hashToken(rawRefresh);
  const expiresAt = refreshExpiresAt(user.is_guest);
  await db.insert(refresh_tokens).values({ user_id: user.id, token_hash: newHash, expires_at: expiresAt });

  return c.json({ access_token: accessToken, refresh_token: rawRefresh, expires_in: 900 });
});

// DELETE /auth/logout
authRouter.delete('/logout', async (c) => {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body' });
  }

  const { refresh_token: rawToken } = refreshSchema.parse(raw);
  const db = getDb();
  const tokenHash = hashToken(rawToken);

  await db.delete(refresh_tokens).where(eq(refresh_tokens.token_hash, tokenHash));

  return c.json({ ok: true });
});

// GET /auth/google — returns authorization URL + PKCE params for SPA to use
authRouter.get('/google', (c) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new HTTPException(501, { message: 'Google OAuth is not configured' });
  }

  const google = getGoogle();
  const state = randomBytes(20).toString('hex');
  const codeVerifier = randomBytes(32).toString('base64url');
  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

  return c.json({ url: url.toString(), state, code_verifier: codeVerifier });
});

// POST /auth/google/callback — exchange code for tokens
authRouter.post('/google/callback', async (c) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new HTTPException(501, { message: 'Google OAuth is not configured' });
  }

  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body' });
  }

  const { code, code_verifier } = z
    .object({ code: z.string(), code_verifier: z.string() })
    .parse(raw);

  const google = getGoogle();
  let oauthTokens: Awaited<ReturnType<typeof google.validateAuthorizationCode>>;
  try {
    oauthTokens = await google.validateAuthorizationCode(code, code_verifier);
  } catch {
    throw new HTTPException(401, { message: 'Invalid authorization code' });
  }

  const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${oauthTokens.accessToken()}` },
  });
  if (!infoRes.ok) {
    throw new HTTPException(502, { message: 'Failed to fetch Google user info' });
  }

  const googleUser = (await infoRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
  };

  const db = getDb();

  // Find existing user by google_id or email
  let user: { id: string; email: string | null; username: string; is_guest: boolean } | undefined;

  const [byGoogleId] = await db
    .select()
    .from(users)
    .where(eq(users.google_id, googleUser.sub))
    .limit(1);

  if (byGoogleId) {
    user = byGoogleId;
  } else if (googleUser.email) {
    const [byEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);
    if (byEmail) {
      // Link google_id to existing account
      await db.update(users).set({ google_id: googleUser.sub }).where(eq(users.id, byEmail.id));
      user = byEmail;
    }
  }

  if (!user) {
    // Create new user
    const baseUsername = (googleUser.name ?? 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 24);
    const username = `${baseUsername}_${randomBytes(3).toString('hex')}`;

    const [created] = await db
      .insert(users)
      .values({
        email: googleUser.email ?? null,
        username,
        google_id: googleUser.sub,
        is_guest: false,
      })
      .returning();
    user = created;
  }

  const tokenData = await issueTokenPair(user.id, false);
  return c.json({
    user: { id: user.id, email: user.email, username: user.username },
    ...tokenData,
  });
});
