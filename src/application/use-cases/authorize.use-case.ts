import { ClientRepository } from '../../domain/repositories/client.repository';
import {
  CodeChallengeMethod,
  OAuthGrantType,
  OAuthResponseType,
} from '../enums/oauth.enum';
import {
  InvalidClientError,
  InvalidRedirectUriError,
  InvalidRequestError,
  InvalidScopeError,
  UnauthorizedClientError,
  UnsupportedResponseTypeError,
} from '../errors/oauth.error';

export interface AuthorizeRequest {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: CodeChallengeMethod;
}

export class ValidateAuthorizeRequestUseCase {
  private readonly supportedCodeChallengeMethods = [
    CodeChallengeMethod.S256,
    CodeChallengeMethod.PLAIN,
  ];

  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(request: AuthorizeRequest) {
    const client = await this.clientRepository.findByClientId(request.clientId);

    if (!request.clientId || !client) {
      throw new InvalidClientError();
    }

    if (
      !request.redirectUri ||
      !client.isRedirectUriValid(request.redirectUri)
    ) {
      throw new InvalidRedirectUriError();
    }

    if (!request.responseType) {
      throw new InvalidRequestError('response_type is missing');
    }

    if (request.code_challenge && !request.code_challenge_method) {
      throw new InvalidRequestError(
        'code_challenge_method is required when code_challenge is provided.'
      );
    }

    if (request.code_challenge_method && !request.code_challenge) {
      throw new InvalidRequestError(
        'code_challenge is required when code_challenge_method is provided.'
      );
    }

    if (
      request.code_challenge_method &&
      !this.supportedCodeChallengeMethods.includes(
        request.code_challenge_method
      )
    ) {
      throw new InvalidRequestError(
        `Unsupported code_challenge_method. Supported methods are ${this.supportedCodeChallengeMethods.join(
          ', '
        )}.`
      );
    }

    if (!client.grantTypes.includes(OAuthGrantType.AUTHORIZATION_CODE)) {
      throw new UnauthorizedClientError();
    }

    if (
      ![OAuthResponseType.CODE, OAuthResponseType.ID_TOKEN].includes(
        request.responseType as OAuthResponseType
      )
    ) {
      throw new UnsupportedResponseTypeError();
    }

    if (request.scope) {
      const requestedScopes = request.scope.split(' ');
      if (!client.areScopesValid(requestedScopes)) {
        throw new InvalidScopeError();
      }
    }

    return {
      client,
      redirectUri: request.redirectUri,
      scope: request.scope,
      state: request.state,
      code_challenge: request.code_challenge,
      code_challenge_method: request.code_challenge_method,
    };
  }
}
