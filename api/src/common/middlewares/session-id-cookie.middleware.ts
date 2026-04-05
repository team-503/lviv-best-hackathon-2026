import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import ms from 'ms';

export function sessionIdCookieMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.cookies.sid) {
    const sid = randomUUID();
    res.cookie('sid', sid, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: ms('1 year'),
    });
    req.cookies.sid = sid;
  }
  next();
}
