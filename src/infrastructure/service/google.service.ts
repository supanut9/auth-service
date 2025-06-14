import { OAuth2Client } from 'google-auth-library';
import { config } from '../../config';

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
}

export class GoogleOAuthService {
  private readonly client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      config.google.clientId,
      config.google.clientSecret,
      config.google.callbackUrl
    );
  }

  /**
   * Generates the URL to which the user should be redirected for Google login.
   */
  public getAuthorizationUrl(state: string): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'profile', 'email'],
      prompt: 'select_account',
      state: state, // Pass the state to Google
    });
  }

  /**
   * Exchanges an authorization code for tokens and verifies the user's identity.
   * @param code The authorization code from Google's callback.
   * @returns Verified user information from the ID token.
   */
  public async getUserInfoFromCode(code: string): Promise<GoogleUserInfo> {
    const { tokens } = await this.client.getToken(code);
    if (!tokens.id_token) {
      throw new Error('Google did not return an ID token.');
    }

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      throw new Error('Could not verify Google user from ID token.');
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }
}
