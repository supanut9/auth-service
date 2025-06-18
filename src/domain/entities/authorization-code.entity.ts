import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { CodeChallengeMethod } from '../../application/enums/oauth.enum';

type AuthorizationCodeProps = {
  id?: number;
  code: string;
  userId: number;
  clientId: number;
  sessionId: number;
  redirectUri: string;
  expiresAt: Date;
  codeChallenge?: string;
  codeChallengeMethod?: CodeChallengeMethod;
};

export class AuthorizationCode {
  public readonly id?: number;
  public readonly code: string;
  public readonly userId: number;
  public readonly clientId: number;
  public readonly sessionId: number;
  public readonly redirectUri: string;
  public readonly expiresAt: Date;
  public readonly codeChallenge?: string;
  public readonly codeChallengeMethod?: CodeChallengeMethod;

  constructor(props: AuthorizationCodeProps) {
    this.id = props.id;
    this.code = props.code;
    this.userId = props.userId;
    this.clientId = props.clientId;
    this.sessionId = props.sessionId;
    this.redirectUri = props.redirectUri;
    this.expiresAt = props.expiresAt;
    this.codeChallenge = props.codeChallenge;
    this.codeChallengeMethod = props.codeChallengeMethod;
  }

  public static create(
    props: Omit<AuthorizationCodeProps, 'code' | 'expiresAt'>
  ): AuthorizationCode {
    return new AuthorizationCode({
      ...props,
      code: uuidv4(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
  }

  public verifyCodeChallenge(codeVerifier: string): boolean {
    if (!this.codeChallenge || !this.codeChallengeMethod) {
      return true;
    }

    if (this.codeChallengeMethod === CodeChallengeMethod.PLAIN) {
      return this.codeChallenge === codeVerifier;
    }

    if (this.codeChallengeMethod === CodeChallengeMethod.S256) {
      const hashedVerifier = createHash('sha256')
        .update(codeVerifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, ''); // Base64URL encoding

      return this.codeChallenge === hashedVerifier;
    }

    // This case should ideally not be reached if validation is correct upstream.
    return false;
  }
}
