import type { Request } from 'express';

export interface RequestUser {
  id: string;
  email?: string;
  role: string;
  permissions?: {
    resource_type: string;
    resource_id: number;
    permissions: string[];
  }[];
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

declare module 'express' {
  interface Request {
    user?: RequestUser;
  }
}
