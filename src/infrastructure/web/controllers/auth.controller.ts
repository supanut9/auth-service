// src/infrastructure/web/controllers/auth.controller.ts (Finalized)
import { Context, redirect } from 'elysia';
import { CreateSessionUseCase } from '../../../application/use-cases/create-session.use-case';
import { LoginSocialUseCase } from '../../../application/use-cases/login-social.use-case'; // Updated import
import { GoogleOAuthService } from '../../service/google.service';
// import { FacebookOAuthService } from '../../service/facebook.service'; // Assumed for the future
import { config } from '../../../config';
import { SocialProviderType } from '../../../application/enums/provider.enum';

// A standardized object shape for user info from any social provider
interface SocialUserInfo {
  id: string;
  email: string;
}

export class AuthController {
  constructor(
    private readonly googleOAuthService: GoogleOAuthService,
    // private readonly facebookOAuthService: FacebookOAuthService, // Inject when you create it
    private readonly loginSocialUseCase: LoginSocialUseCase, // Updated use case
    private readonly createSessionUseCase: CreateSessionUseCase
  ) {}

  login(context: Context) {}

  // ... socialLoginRedirect method remains the same ...
  socialLoginRedirect(context: Context) {
    const provider = context.params.provider as SocialProviderType;
    const { state } = context.query;

    let authorizationUrl = '';

    if (provider === SocialProviderType.GOOGLE) {
      authorizationUrl = this.googleOAuthService.getAuthorizationUrl(
        state as string
      );
    } else if (provider === SocialProviderType.FACEBOOK) {
      // authorizationUrl = this.facebookOAuthService.getAuthorizationUrl(state as string);
    } else {
      throw new Error('Unsupported provider');
    }

    return redirect(authorizationUrl, 302);
  }

  async socialCallback(context: Context) {
    const { params, query, cookie } = context;
    const { provider } = params as { provider: SocialProviderType };
    const { code, state } = query;

    if (!code || typeof code !== 'string') {
      return redirect(`/login?error=invalid_code&provider=${provider}`, 307);
    }

    try {
      let userInfo: SocialUserInfo;

      // Step 1: Get user info from the correct provider service
      if (provider === SocialProviderType.GOOGLE) {
        const googleUser = await this.googleOAuthService.getUserInfoFromCode(
          code
        );
        userInfo = { id: googleUser.googleId, email: googleUser.email };
      } else if (provider === SocialProviderType.FACEBOOK) {
        // const facebookUser = await this.facebookOAuthService.getUserInfoFromCode(code);
        // userInfo = { id: facebookUser.facebookId, email: facebookUser.email };
        throw new Error('Facebook login not yet implemented.'); // Placeholder
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Step 2: Use the generic social login use case
      const user = await this.loginSocialUseCase.execute({
        provider: provider,
        providerId: userInfo.id,
        email: userInfo.email,
      });

      // Step 3: Create a session (this part is already generic)
      const session = await this.createSessionUseCase.execute(user.id);

      cookie[config.session.cookieName].set({
        value: session.sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: config.session.expiresInDays * 86400,
      });

      // Step 4: Redirect back to the OAuth flow (already generic)
      let authorizeRedirect = '/oauth/authorize';
      if (state) {
        try {
          const originalParams = new URLSearchParams(
            JSON.parse(state as string)
          ).toString();
          authorizeRedirect = `/oauth/authorize?${originalParams}`;
        } catch (e) {
          console.error('Failed to parse state parameter', e);
        }
      }

      return redirect(authorizeRedirect, 307);
    } catch (error) {
      console.error(`An error occurred during ${provider} callback:`, error);
      // Make the error redirect more specific
      return redirect(`/login?error=${provider}_failed`, 307);
    }
  }
}
