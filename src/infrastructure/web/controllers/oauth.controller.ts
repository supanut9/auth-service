import { Context, redirect } from 'elysia';
import { ValidateAuthorizeRequestUseCase } from '../../../application/use-cases/authorize.use-case';
import { FatalOAuthError } from '../../../application/errors/oauth.error';
import { HttpException } from '../../../application/errors/http.error';
import { ValidateSessionUseCase } from '../../../application/use-cases/validate-session.use-case';
import LoginPage from '../../../presentation/components/Login';
import { GenerateAuthorizationCodeUseCase } from '../../../application/use-cases/generate-authorization-code.use-case';

export class OauthController {
  constructor(
    private readonly validateAuthorizeUseCase: ValidateAuthorizeRequestUseCase,
    private readonly validateSessionUseCase: ValidateSessionUseCase,
    private readonly generateCodeUseCase: GenerateAuthorizationCodeUseCase
  ) {}

  async authorize(context: Context) {
    const { client_id, redirect_uri, response_type, scope, state } =
      context.query;
    const { set, cookie } = context;

    try {
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
        console.log('No valid session found, rendering Login Page.');
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
    } catch (error) {
      if (error instanceof FatalOAuthError) {
        context.set.status = error.status;
        context.set.headers['Content-Type'] = 'text/html; charset=utf-8';
        return `
          <div style="font-family: sans-serif; text-align: center; padding: 40px;">
            <h1 style="color: #d32f2f;">Configuration Error</h1>
            <p>${error.message}</p>
            <p><small>Please contact the developer of the application you were trying to use.</small></p>
          </div>
        `;
      }

      if (error instanceof HttpException) {
        console.log(error);
        const errorUrl = new URL(redirect_uri);
        errorUrl.searchParams.set('error', error.error);
        errorUrl.searchParams.set('error_description', error.message);

        if (state) {
          errorUrl.searchParams.set('state', state);
        }

        return redirect(errorUrl.toString(), 307);
      }
    }
  }
}
