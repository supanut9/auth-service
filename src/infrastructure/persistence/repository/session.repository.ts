import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { SessionRepository } from '../../../domain/repositories/session.repository';
import { db } from '../db';
import { sessions } from '../schema';
import { Session } from '../../../domain/entities/session.entity';

export class MysqlSessionRepository implements SessionRepository {
  async findBySessionToken(sessionToken: string): Promise<Session | null> {
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

  /**
   * Creates a new session for a given user.
   * @param userId The ID of the user to create the session for.
   * @returns The newly created Session object.
   */
  async create(userId: number): Promise<Session> {
    const sessionToken = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 1. Insert the new session record.
    // For mysql2, the result contains metadata like the insertId.
    const insertResult = await db.insert(sessions).values({
      userId: userId,
      sessionToken: sessionToken,
      expiresAt: expiresAt,
    });

    // 2. Get the ID of the row we just inserted.
    const newSessionId = insertResult[0].insertId;

    // 3. Fetch the newly created record from the database using its ID.
    const newSession = await db.query.sessions.findFirst({
      where: eq(sessions.id, newSessionId),
    });

    if (!newSession) {
      // This would be an unexpected error, but it's good practice to handle it.
      throw new Error('Failed to create and retrieve session.');
    }

    // 4. Return a new Session entity instance.
    return new Session({
      id: newSession.id,
      sessionToken: newSession.sessionToken,
      userId: newSession.userId,
    });
  }
}
