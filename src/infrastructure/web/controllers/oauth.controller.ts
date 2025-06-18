import { Context, redirect } from 'elysia';
import { ValidateAuthorizeRequestUseCase } from '../../../application/use-cases/authorize.use-case';
import { ValidateSessionUseCase } from '../../../application/use-cases/validate-session.use-case';
import LoginPage from '../../../presentation/components/Login';
import { GenerateAuthorizationCodeUseCase } from '../../../application/use-cases/generate-authorization-code.use-case';
import {
  OAuthGrantType,
  TokenEndpointAuthMethod,
} from '../../../application/enums/oauth.enum';
import { BadRequestError } from '../../../application/errors/http.error';
import {
  InvalidClientError,
  InvalidRequestError,
  UnsupportedGrantTypeError,
} from '../../../application/errors/oauth.error';

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

  async token(context: Context) {
    const { headers, body } = context;

    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      throw new InvalidRequestError('Request body is missing or malformed.');
    }

    const { authorization } = headers;

    const { grant_type, redirect_uri, code, client_id, client_secret } =
      body as {
        grant_type: OAuthGrantType;
        redirect_uri?: string;
        code?: string;
        client_id?: string;
        client_secret?: string;
        scope?: string;
      };

    if (!grant_type) {
      throw new BadRequestError(
        'The request body MUST include the grant_type parameter'
      );
    }

    const supportedGrantTypes = [
      OAuthGrantType.AUTHORIZATION_CODE,
      OAuthGrantType.CLIENT_CREDENTIALS,
      OAuthGrantType.REFRESH_TOKEN,
    ];

    if (!supportedGrantTypes.includes(grant_type)) {
      throw new UnsupportedGrantTypeError();
    }

    if (grant_type === OAuthGrantType.AUTHORIZATION_CODE) {
      if (!code) {
        throw new BadRequestError(
          'The request body MUST include the code parameter.'
        );
      }

      if (!redirect_uri) {
        throw new BadRequestError(
          'The request body MUST include the redirect_uri.'
        );
      }
    }

    if (authorization && client_secret) {
      throw new InvalidRequestError(
        'Client must not use more than one authentication method.'
      );
    }

    let clientId: string | undefined;
    let clientSecret: string | undefined;
    let authMethodUsed: TokenEndpointAuthMethod | undefined;
    if (authorization) {
      // Method 1: HTTP Basic Authentication ('client_secret_basic')
      if (!authorization.toLowerCase().startsWith('basic ')) {
        throw new InvalidRequestError('Invalid Authorization header format.');
      }

      authMethodUsed = TokenEndpointAuthMethod.CLIENT_SECRET_BASIC;
      const base64Credentials = authorization.substring(6); // Remove "Basic "
      const decodedCredentials = Buffer.from(
        base64Credentials,
        'base64'
      ).toString('utf-8');
      [clientId, clientSecret] = decodedCredentials.split(':');
    } else if (client_id && client_secret) {
      // Method 2: Request Body Credentials ('client_secret_post')
      authMethodUsed = TokenEndpointAuthMethod.CLIENT_SECRET_POST;
      clientId = client_id;
      clientSecret = client_secret;
    } else if (clientId) {
      // Method 3: Ppublic clients

      authMethodUsed = TokenEndpointAuthMethod.NONE;
      clientId = client_id;
    }

    if (!clientId) {
      throw new InvalidClientError(
        'Client authentication failed: No client credentials provided.'
      );
    }

    // verify client_id & client_secret

    // grant_type === 'authorization_code'

    /*
        1) verify code
        2) verify redirect_uri
        3) verify PKCE
        4) generate access_token & refresh_token & id_token
    */

    // grant_type === 'client_credentials'

    // grant_type === 'refresh_token'

    return {
      message: 'Token endpoint hit successfully. Implementation pending.',
      received_body: body,
    };
  }
}
