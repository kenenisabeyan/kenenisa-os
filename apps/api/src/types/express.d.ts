import type { User, Session } from '@prisma/client';

export interface AuthContext {
  userId: string;
  user: User;
  session: Session;
}

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: User;
      session?: Session;
      auth?: AuthContext;
    }
  }
}
