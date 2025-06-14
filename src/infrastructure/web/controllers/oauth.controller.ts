import { Context, redirect } from 'elysia';
import { ValidateAuthorizeRequestUseCase } from '../../../application/use-cases/authorize.use-case';
import { FatalOAuthError } from '../../../application/errors/oauth.error';
import { HttpException } from '../../../application/errors/http.error';
import { ValidateSessionUseCase } from '../../../application/use-cases/validate-session.use-case';
import LoginPage from '../../../presentation/components/Login';
import { GenerateAuthorizationCodeUseCase } from '../../../application/use-cases/generate-authorization-code.use-case';

// src/infrastructure/web/controllers/oauth.controller.ts (Refactored)
export class OauthController {
  constructor(
    private readonly validateAuthorizeUseCase: ValidateAuthorizeRequestUseCase,
    private readonly validateSessionUseCase: ValidateSessionUseCase,
    private readonly generateCodeUseCase: GenerateAuthorizationCodeUseCase
  ) {}

  async authorize(context: Context) {
    const { client_id, redirect_uri, response_type, scope, state } =
      context.query;
    const { cookie } = context;

    const { client } = await this.validateAuthorizeUseCase.execute({
      clientId: client_id as string,
      redirectUri: redirect_uri as string,
      responseType: response_type as string,
      scope: scope as string,
      state: state as string | undefined,
    });

    const sessionToken = cookie.session_token.value;
    const session = sessionToken
      ? await this.validateSessionUseCase.execute(sessionToken)
      : null;

    if (!session) {
      context.set.headers['Content-Type'] = 'text/html; charset=utf-8';
      return LoginPage({ ...(context.query as any) });
    }

    const code = await this.generateCodeUseCase.execute(
      session.userId,
      client.id,
      session.id,
      redirect_uri as string
    );

    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.set('code', code);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    return redirect(redirectUrl.toString(), 307);
  }
}
