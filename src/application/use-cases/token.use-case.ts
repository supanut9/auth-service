import { OAuthGrantType, TokenEndpointAuthMethod } from '../enums/oauth.enum';
import {
  InvalidClientError,
  InvalidRequestError,
  UnsupportedGrantTypeError,
  UnauthorizedClientError,
  InvalidGrantError,
  InvalidScopeError,
} from '../errors/oauth.error';
import { v4 as uuidv4 } from 'uuid';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { Client } from '../../domain/entities/client.entity';
import { AuthorizationCodeRepository } from '../../domain/repositories/authorization-code.repository';
import { AccessTokenRepository } from '../../domain/repositories/access-token.repository';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { AccessToken } from '../../domain/entities/access-token.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import * as jwt from 'jsonwebtoken';
import { config } from '../../config';

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
    private readonly authorizationCodeRepository: AuthorizationCodeRepository,
    private readonly accessTokenRepository: AccessTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository
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
      case OAuthGrantType.AUTHORIZATION_CODE: {
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

        if (authCode.isExpired()) {
          throw new InvalidGrantError('Authorization code is expired.');
        }

        if (authCode.usedAt) {
          throw new InvalidGrantError(
            'Authorization code has already been used.'
          );
        }

        await this.authorizationCodeRepository.markAsUsed(code);

        const { kid, privateKey } = config.jwt.currentSigningKey;
        const accessTokenJti = uuidv4();

        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + config.tokenExpiresIn.accessToken;

        const accessTokenPayload = {
          iss: config.url.baseUrl,
          sub: authCode.user?.userId,
          aud: client.clientId,
          iat: iat,
          exp: exp,
          jti: accessTokenJti,
          scope: body.scope,
        };

        const signedAccessToken = jwt.sign(accessTokenPayload, privateKey, {
          algorithm: config.jwt.signOptions.algorithm,
          keyid: kid,
        });

        const accessTokenEntity = new AccessToken({
          token: accessTokenJti,
          userId: authCode.userId,
          clientId: client.id,
          sessionId: authCode.sessionId,
          scope: body.scope,
          expiresAt: new Date(exp * 1000),
          authorizationCodeId: authCode.id,
        });

        await this.accessTokenRepository.create(accessTokenEntity);

        const refreshToken = new RefreshToken({
          token: uuidv4(),
          userId: authCode.userId,
          clientId: client.id,
          sessionId: authCode.sessionId,
          expiresAt: new Date(
            Date.now() + config.tokenExpiresIn.refreshToken * 1000
          ),
        });
        await this.refreshTokenRepository.create(refreshToken);

        const idTokenPayload = {
          iss: config.url.baseUrl,
          sub: authCode.userId,
          aud: client.clientId,
          iat: iat,
          exp: iat + config.tokenExpiresIn.idToken,
        };

        const idToken = jwt.sign(idTokenPayload, privateKey, {
          algorithm: config.jwt.signOptions.algorithm,
          keyid: kid,
        });

        return {
          access_token: signedAccessToken,
          token_type: 'Bearer',
          expires_in: config.tokenExpiresIn.accessToken,
          refresh_token: refreshToken.token,
          id_token: idToken,
        };
      }

      case OAuthGrantType.CLIENT_CREDENTIALS: {
        if (body.scope) {
          const requestedScopes = body.scope.split(' ');
          if (!client.areScopesValid(requestedScopes)) {
            throw new InvalidScopeError();
          }
        }

        const { kid, privateKey } = config.jwt.currentSigningKey;
        const accessTokenJti = uuidv4();

        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + config.tokenExpiresIn.accessToken;

        const accessTokenPayload = {
          iss: config.url.baseUrl,
          sub: client.clientId,
          aud: client.clientId,
          iat: iat,
          exp: exp,
          jti: accessTokenJti,
          scope: body.scope || client.allowedScopes?.join(' '),
        };

        const signedAccessToken = jwt.sign(accessTokenPayload, privateKey, {
          algorithm: config.jwt.signOptions.algorithm,
          keyid: kid,
        });

        const accessTokenEntity = new AccessToken({
          token: accessTokenJti,
          clientId: client.id,
          scope: body.scope,
          expiresAt: new Date(exp * 1000),
        });

        await this.accessTokenRepository.create(accessTokenEntity);

        return {
          access_token: signedAccessToken,
          token_type: 'Bearer',
          expires_in: config.tokenExpiresIn.accessToken,
          scope: accessTokenPayload.scope,
        };
      }

      case OAuthGrantType.REFRESH_TOKEN: {
        if (!body.refresh_token) {
          throw new InvalidRequestError(
            'The request body MUST include the refresh_token parameter.'
          );
        }

        const oldRefreshToken = await this.refreshTokenRepository.findByToken(
          body.refresh_token
        );

        if (
          !oldRefreshToken ||
          oldRefreshToken.isRevoked() ||
          oldRefreshToken.isExpired()
        ) {
          throw new InvalidGrantError(
            'Refresh token is invalid, revoked, or expired.'
          );
        }

        await this.refreshTokenRepository.revoke(oldRefreshToken.token);

        const { kid, privateKey } = config.jwt.currentSigningKey;
        const accessTokenJti = uuidv4();

        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + config.tokenExpiresIn.accessToken;

        const accessTokenPayload = {
          iss: config.url.baseUrl,
          sub: oldRefreshToken.user?.userId, // Use user ID from refresh token
          aud: client.clientId,
          iat: iat,
          exp: exp,
          jti: accessTokenJti,
          scope: body.scope, // Can optionally allow scope reduction
        };

        const signedAccessToken = jwt.sign(accessTokenPayload, privateKey, {
          algorithm: config.jwt.signOptions.algorithm,
          keyid: kid,
        });

        const accessTokenEntity = new AccessToken({
          token: accessTokenJti,
          userId: oldRefreshToken.userId,
          clientId: client.id,
          sessionId: oldRefreshToken.sessionId,
          scope: body.scope,
          expiresAt: new Date(exp * 1000),
          sourceRefreshTokenId: oldRefreshToken.id,
        });

        await this.accessTokenRepository.create(accessTokenEntity);

        // Issue a new refresh token (rotation)
        const newRefreshToken = new RefreshToken({
          token: uuidv4(),
          userId: oldRefreshToken.userId,
          clientId: client.id,
          sessionId: oldRefreshToken.sessionId,
          expiresAt: new Date(
            Date.now() + config.tokenExpiresIn.refreshToken * 1000
          ),
        });
        await this.refreshTokenRepository.create(newRefreshToken);

        return {
          access_token: signedAccessToken,
          token_type: 'Bearer',
          expires_in: config.tokenExpiresIn.accessToken,
          refresh_token: newRefreshToken.token,
        };
      }
      default: {
        throw new UnsupportedGrantTypeError();
      }
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
