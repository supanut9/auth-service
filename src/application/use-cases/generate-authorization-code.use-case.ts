import { db } from '../../infrastructure/persistence/db';
import { authorizationCodes } from '../../infrastructure/persistence/schema';
import { v4 as uuidv4 } from 'uuid';

export class GenerateAuthorizationCodeUseCase {
  async execute(
    userId: number,
    clientId: number,
    sessionId: number,
    redirectUri: string
  ): Promise<string> {
    const code = uuidv4();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(authorizationCodes).values({
      code: code,
      userId: userId,
      clientId: clientId,
      sessionId: sessionId,
      redirectUri: redirectUri,
      expiresAt: expiresAt,
    });

    return code;
  }
}
