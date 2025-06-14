import { Session } from '../entities/session.entity';

export interface SessionRepository {
  findBySessionToken(sessionToken: string): Promise<Session | null>;
}
