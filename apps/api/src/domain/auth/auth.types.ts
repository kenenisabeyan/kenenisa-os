import type { Request } from 'express';
import type { User, Session } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user: User;
  session: Session;
}
