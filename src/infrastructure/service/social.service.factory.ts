import { SocialProviderType } from '../../application/enums/provider.enum';
import { FacebookOAuthService } from './facebook.service';
import { GoogleOAuthService } from './google.service';
import { LineOAuthService } from './line.service';

interface SocialUserInfo {
  id: string;
  email: string;
}

export interface ISocialOAuthService {
  getAuthorizationUrl(state: string): string;
  getUserInfoFromCode(code: string): Promise<SocialUserInfo>;
}

export class SocialOAuthServiceFactory {
  constructor(
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly facebookOAuthService: FacebookOAuthService,
    private readonly lineOAuthService: LineOAuthService
  ) {}

  public getService(provider: SocialProviderType): ISocialOAuthService {
    switch (provider) {
      case SocialProviderType.GOOGLE:
        return {
          getAuthorizationUrl: (state: string) =>
            this.googleOAuthService.getAuthorizationUrl(state),
          getUserInfoFromCode: async (code: string) => {
            const googleUser =
              await this.googleOAuthService.getUserInfoFromCode(code);
            return { id: googleUser.googleId, email: googleUser.email };
          },
        };
      case SocialProviderType.FACEBOOK:
        return {
          getAuthorizationUrl: (state: string) =>
            this.facebookOAuthService.getAuthorizationUrl(state),
          getUserInfoFromCode: async (code: string) => {
            const facebookUser =
              await this.facebookOAuthService.getUserInfoFromCode(code);
            return { id: facebookUser.id, email: facebookUser.email };
          },
        };
      case SocialProviderType.LINE:
        return {
          getAuthorizationUrl: (state: string) =>
            this.lineOAuthService.getAuthorizationUrl(state),
          getUserInfoFromCode: async (code: string) => {
            const lineUser = await this.lineOAuthService.getUserInfoFromCode(
              code
            );
            return { id: lineUser.id, email: lineUser.email };
          },
        };
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
