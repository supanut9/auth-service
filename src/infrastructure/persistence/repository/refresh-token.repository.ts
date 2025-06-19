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
}
