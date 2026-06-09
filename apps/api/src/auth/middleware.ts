import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verifyAccessToken, type TokenPayload } from './tokens';

declare module 'hono' {
  interface ContextVariableMap {
    user: TokenPayload | null;
    requestId: string;
  }
}

export const attachUser: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      c.set('user', await verifyAccessToken(authHeader.slice(7)));
    } catch {
      c.set('user', null);
    }
  } else {
    c.set('user', null);
  }
  return next();
};

export const requireAuth: MiddlewareHandler = async (c, next) => {
  if (!c.get('user')) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  return next();
};
