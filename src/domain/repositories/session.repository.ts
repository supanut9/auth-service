import { Session } from '../entities/session.entity';

export interface SessionRepository {
  findBySessionToken(sessionToken: string): Promise<Session | null>;
  create(userId: number): Promise<Session>;
}
