import { AccessTokenRepository } from '../../../domain/repositories/access-token.repository';
import { AccessToken } from '../../../domain/entities/access-token.entity';
import { db } from '../db';
import { accessTokens } from '../schema';

export class MysqlAccessTokenRepository implements AccessTokenRepository {
  async create(accessToken: AccessToken): Promise<void> {
    await db.insert(accessTokens).values({
      token: accessToken.token,
      userId: accessToken.userId,
      clientId: accessToken.clientId,
      sessionId: accessToken.sessionId,
      scope: accessToken.scope,
      expiresAt: accessToken.expiresAt,
    });
  }
}
