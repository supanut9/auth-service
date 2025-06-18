import { CodeChallengeMethod } from '../enums/oauth.enum';
import { AuthorizationCode } from '../../domain/entities/authorization-code.entity';
import { AuthorizationCodeRepository } from '../../domain/repositories/authorization-code.repository';

export class GenerateAuthorizationCodeUseCase {
  constructor(
    private readonly authorizationCodeRepository: AuthorizationCodeRepository
  ) {}

  async execute(
    userId: number,
    clientId: number,
    sessionId: number,
    redirectUri: string,
    codeChallenge?: string,
    codeChallengeMethod?: CodeChallengeMethod
  ): Promise<string> {
    const authCode = AuthorizationCode.create({
      userId,
      clientId,
      sessionId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
    });

    await this.authorizationCodeRepository.save(authCode);

    return authCode.code;
  }
}
