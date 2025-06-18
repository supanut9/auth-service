import { OAuthGrantType, TokenEndpointAuthMethod } from '../enums/oauth.enum';
import {
  InvalidClientError,
  InvalidRequestError,
  UnsupportedGrantTypeError,
  UnauthorizedClientError,
  InvalidGrantError,
} from '../errors/oauth.error';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { Client } from '../../domain/entities/client.entity';
import { AuthorizationCodeRepository } from '../../domain/repositories/authorization-code.repository';

export interface TokenRequest {
  headers: {
    authorization?: string;
  };
  body: {
    grant_type: OAuthGrantType;
    redirect_uri?: string;
    code?: string;
    client_id?: string;
    client_secret?: string;
    scope?: string;
    refresh_token?: string;
    code_verifier?: string;
  };
}

export class TokenUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly authorizationCodeRepository: AuthorizationCodeRepository
  ) {}

  async execute(request: TokenRequest): Promise<any> {
    const { headers, body } = request;

    if (!body.grant_type) {
      throw new InvalidRequestError(
        'The request body MUST include the grant_type parameter'
      );
    }

    const supportedGrantTypes = [
      OAuthGrantType.AUTHORIZATION_CODE,
      OAuthGrantType.CLIENT_CREDENTIALS,
      OAuthGrantType.REFRESH_TOKEN,
    ];

    if (!supportedGrantTypes.includes(body.grant_type)) {
      throw new UnsupportedGrantTypeError();
    }

    const client = await this.verifyClientCredentials(
      headers.authorization,
      body
    );

    if (!client.isGrantTypeAllowed(body.grant_type)) {
      throw new UnauthorizedClientError(
        'The client is not authorized to use this grant type.'
      );
    }

    switch (body.grant_type) {
      case OAuthGrantType.AUTHORIZATION_CODE:
        const { code, redirect_uri, code_verifier } = body;

        if (!code) {
          throw new InvalidRequestError(
            'The request body MUST include the code parameter.'
          );
        }

        if (!redirect_uri) {
          throw new InvalidRequestError(
            'The request body MUST include the redirect_uri.'
          );
        }

        const authCode = await this.authorizationCodeRepository.findByCode(
          code
        );

        if (!authCode) {
          throw new InvalidGrantError(
            'Authorization code is invalid or expired.'
          );
        }

        if (authCode.codeChallenge && !code_verifier) {
          throw new InvalidRequestError('code_verifier is required.');
        }

        if (code_verifier && !authCode.verifyCodeChallenge(code_verifier)) {
          throw new InvalidGrantError('Failed to verify code challenge.');
        }

        // TODO:
        // 1) Mark code as used
        // 2) Generate access_token & refresh_token & id_token
        return {
          message: 'PKCE verification successful. Token generation pending.',
        };

      case OAuthGrantType.CLIENT_CREDENTIALS:
        // TODO:
        // 1) generate access_token
        return {
          message: 'client_credentials grant type not implemented yet',
        };

      case OAuthGrantType.REFRESH_TOKEN:
        if (!body.refresh_token) {
          throw new InvalidRequestError(
            'The request body MUST include the refresh_token parameter.'
          );
        }
        // TODO:
        // 1) verify refresh token
        // 2) generate new access token (and maybe refresh token)
        return { message: 'refresh_token grant type not implemented yet' };

      default:
        throw new UnsupportedGrantTypeError();
    }
  }

  private async verifyClientCredentials(
    authorizationHeader: string | undefined,
    body: TokenRequest['body']
  ): Promise<Client> {
    let clientId: string | undefined;
    let clientSecret: string | undefined;
    let authMethod: TokenEndpointAuthMethod;

    if (authorizationHeader) {
      if (body.client_id || body.client_secret) {
        throw new InvalidRequestError(
          'Client must not use more than one authentication method.'
        );
      }

      if (!authorizationHeader.toLowerCase().startsWith('basic ')) {
        throw new InvalidRequestError('Invalid Authorization header format.');
      }

      authMethod = TokenEndpointAuthMethod.CLIENT_SECRET_BASIC;
      const base64Credentials = authorizationHeader.substring(6);
      const decodedCredentials = Buffer.from(
        base64Credentials,
        'base64'
      ).toString('utf-8');
      [clientId, clientSecret] = decodedCredentials.split(':');
    } else if (body.client_id && body.client_secret) {
      authMethod = TokenEndpointAuthMethod.CLIENT_SECRET_POST;
      clientId = body.client_id;
      clientSecret = body.client_secret;
    } else if (body.client_id) {
      authMethod = TokenEndpointAuthMethod.NONE;
      clientId = body.client_id;
    } else {
      throw new InvalidClientError(
        'Client authentication failed: No client credentials provided.'
      );
    }

    if (!clientId) {
      throw new InvalidClientError('Client ID is missing.');
    }

    const client = await this.clientRepository.findByClientId(clientId);

    if (!client) {
      throw new InvalidClientError('Client not found.');
    }

    // In a real application, you would use a library like bcrypt to compare a hashed secret.
    if (
      (authMethod === TokenEndpointAuthMethod.CLIENT_SECRET_BASIC ||
        authMethod === TokenEndpointAuthMethod.CLIENT_SECRET_POST) &&
      client.clientSecret !== clientSecret
    ) {
      throw new InvalidClientError('Invalid client secret.');
    }

    return client;
  }
}
