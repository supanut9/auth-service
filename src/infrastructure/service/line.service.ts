import { config } from '../../config';
import { decode } from 'jsonwebtoken';

// Standardized user info shape
export interface LineUserInfo {
  id: string; // LINE's user ID is a string
  email: string;
  name?: string;
  picture?: string;
}

/**
 * Encapsulates all interactions with the LINE Login API for OAuth.
 */
export class LineOAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = config.line.clientId;
    this.clientSecret = config.line.clientSecret;
    this.redirectUri = config.line.callbackUrl;
  }

  /**
   * Generates the URL to which the user should be redirected for LINE login.
   * @param state A unique string to prevent CSRF attacks.
   */
  public getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'openid profile email',
      state: state,
    });

    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }

  /**
   * Exchanges an authorization code for an access token, then fetches user profile info.
   * @param code The authorization code from LINE's callback.
   * @returns Verified user information.
   */
  public async getUserInfoFromCode(code: string): Promise<LineUserInfo> {
    // 1. Exchange the code for an access token
    const tokenUrl = 'https://api.line.me/oauth2/v2.1/token';
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`LINE token error: ${tokenData.error_description}`);
    }

    const idToken = tokenData.id_token;
    const decodedToken: any = decode(idToken);

    if (!decodedToken || !decodedToken.sub) {
      throw new Error('Could not verify LINE user from ID token.');
    }

    return {
      id: decodedToken.sub,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
  }
}
