import { eq } from 'drizzle-orm';
import { db } from '../db';
import { authorizationCodes } from '../schema';
import { AuthorizationCode } from '../../../domain/entities/authorization-code.entity';
import { AuthorizationCodeRepository } from '../../../domain/repositories/authorization-code.repository';
import { CodeChallengeMethod } from '../../../application/enums/oauth.enum';

export class MysqlAuthorizationCodeRepository
  implements AuthorizationCodeRepository
{
  async save(code: AuthorizationCode): Promise<void> {
    await db.insert(authorizationCodes).values({
      code: code.code,
      userId: code.userId,
      clientId: code.clientId,
      sessionId: code.sessionId,
      redirectUri: code.redirectUri,
      expiresAt: code.expiresAt,
      codeChallenge: code.codeChallenge,
      codeChallengeMethod: code.codeChallengeMethod,
    });
  }

  async findByCode(code: string): Promise<AuthorizationCode | null> {
    const result = await db.query.authorizationCodes.findFirst({
      where: eq(authorizationCodes.code, code),
      with: {
        user: {
          columns: { id: true, userId: true },
        },
      },
    });

    if (!result) {
      return null;
    }

    return new AuthorizationCode({
      ...result,
      codeChallenge: result.codeChallenge ?? undefined,
      codeChallengeMethod:
        (result.codeChallengeMethod as CodeChallengeMethod) ?? undefined,
    });
  }

  async markAsUsed(code: string): Promise<void> {
    await db
      .update(authorizationCodes)
      .set({ usedAt: new Date() })
      .where(eq(authorizationCodes.code, code));
  }
}
