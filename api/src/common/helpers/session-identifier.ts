import type { Request } from 'express';

export function getSessionIdentifier(req: Request): string {
  return (req.cookies?.sid as string) || req.ip || '';
}
