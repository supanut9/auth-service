import { Context, redirect } from 'elysia';
import { CreateSessionUseCase } from '../../../application/use-cases/create-session.use-case';
import { LoginSocialUseCase } from '../../../application/use-cases/login-social.use-case';
import { config } from '../../../config';
import { SocialProviderType } from '../../../application/enums/provider.enum';
import { SocialOAuthServiceFactory } from '../../service/social.service.factory';

interface SocialUserInfo {
  id: string;
  email: string;
}

export class AuthController {
  constructor(
    private readonly socialOAuthServiceFactory: SocialOAuthServiceFactory,
    private readonly loginSocialUseCase: LoginSocialUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase
  ) {}

  login(context: Context) {}

  socialLoginRedirect(context: Context) {
    const provider = context.params.provider as SocialProviderType;
    const { state } = context.query;
    const socialLoginService =
      this.socialOAuthServiceFactory.getService(provider);
    const authorizationUrl = socialLoginService.getAuthorizationUrl(
      state as string
    );

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
      const socialLoginService =
        this.socialOAuthServiceFactory.getService(provider);

      // Step 1: Get user info from the correct provider service
      const userInfo = await socialLoginService.getUserInfoFromCode(code);

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
      return redirect(`/login?error=${provider}_failed`, 307);
    }
  }
}
