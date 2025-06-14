import { config } from '../../config';

// Standardized user info shape
export interface FacebookUserInfo {
  id: string; // Facebook's user ID is a string
  email: string;
  name?: string;
}

/**
 * Encapsulates all interactions with the Facebook Graph API for OAuth.
 */
export class FacebookOAuthService {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;
  private readonly graphApiVersion = 'v23.0';

  constructor() {
    this.appId = config.facebook.appId;
    this.appSecret = config.facebook.appSecret;
    this.redirectUri = config.facebook.callbackUrl;
  }

  /**
   * Generates the URL to which the user should be redirected for Facebook login.
   * @param state A unique string to prevent CSRF attacks.
   */
  public getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: 'email public_profile', // The permissions we are requesting
      response_type: 'code',
      state: state,
    });

    return `https://www.facebook.com/${
      this.graphApiVersion
    }/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchanges an authorization code for an access token, then fetches user profile info.
   * @param code The authorization code from Facebook's callback.
   * @returns Verified user information.
   */
  public async getUserInfoFromCode(code: string): Promise<FacebookUserInfo> {
    // 1. Exchange the code for an access token
    const tokenUrl = `https://graph.facebook.com/${this.graphApiVersion}/oauth/access_token`;
    const tokenParams = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      client_secret: this.appSecret,
      code: code,
    });

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams.toString()}`);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(`Facebook token error: ${tokenData.error.message}`);
    }
    const accessToken = tokenData.access_token;

    // 2. Use the access token to get the user's profile
    const profileUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    const profileResponse = await fetch(profileUrl);
    const profileData = await profileResponse.json();

    if (profileData.error) {
      throw new Error(`Facebook profile error: ${profileData.error.message}`);
    }

    if (!profileData.id || !profileData.email) {
      throw new Error('Facebook profile did not return an ID or email.');
    }

    return {
      id: profileData.id,
      email: profileData.email,
      name: profileData.name,
    };
  }
}
