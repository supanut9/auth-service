import { eq } from 'drizzle-orm';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { db } from '../db';
import { refreshTokens } from '../schema';

export class MysqlRefreshTokenRepository implements RefreshTokenRepository {
  async create(refreshToken: RefreshToken): Promise<void> {
    await db.insert(refreshTokens).values({
      token: refreshToken.token,
      userId: refreshToken.userId,
      clientId: refreshToken.clientId,
      sessionId: refreshToken.sessionId,
      expiresAt: refreshToken.expiresAt,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, token),
      with: {
        user: {
          columns: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return new RefreshToken({ ...result });
  }

  async revoke(token: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, token));
  }
}
