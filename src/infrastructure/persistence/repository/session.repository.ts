import { eq } from 'drizzle-orm';
import { SessionRepository } from '../../../domain/repositories/session.repository';
import { db } from '../db';
import { sessions } from '../schema';
import { Session } from '../../../domain/entities/session.entity';

export class MysqlSessionRepository implements SessionRepository {
  async findBySessionToken(sessionToken: string): Promise<any> {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.sessionToken, sessionToken),
    });

    if (!session) return null;

    return new Session({
      id: session.id,
      sessionToken: session.sessionToken,
      userId: session.userId,
    });
  }
}
