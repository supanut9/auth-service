import { Context, redirect } from 'elysia';
import { CreateSessionUseCase } from '../../../application/use-cases/create-session.use-case';
import { LoginSocialUseCase } from '../../../application/use-cases/login-social.use-case';
import { config } from '../../../config';
import { SocialProviderType } from '../../../application/enums/provider.enum';
import { SocialOAuthServiceFactory } from '../../service/social.service.factory';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case';

export class AuthController {
  constructor(
    private readonly socialOAuthServiceFactory: SocialOAuthServiceFactory,
    private readonly loginSocialUseCase: LoginSocialUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  async login(context: Context) {
    const { body, cookie } = context;

    const {
      email, // from the form input with name="username"
      password,
      client_id,
      redirect_uri,
      response_type,
      scope,
      state,
    } = body as any;

    // 1. Authenticate the user
    const user = await this.loginUserUseCase.execute({
      email,
      password,
    });

    // 2. Create a session
    const session = await this.createSessionUseCase.execute(user.id);

    // 3. Set the session cookie
    cookie[config.session.cookieName].set({
      value: session.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: config.session.expiresInDays * 86400,
    });

    // 4. Redirect back to the OAuth authorization flow
    const authorizeParams = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type,
      scope: scope || '',
      state: state || '',
    });

    return redirect(`/oauth/authorize?${authorizeParams.toString()}`, 307);
  }

  socialLoginRedirect(context: Context) {
    const provider = context.params.provider as SocialProviderType;
    const query = context.query;
    const socialLoginService =
      this.socialOAuthServiceFactory.getService(provider);
    const authorizationUrl = socialLoginService.getAuthorizationUrl(
      JSON.stringify(query)
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
