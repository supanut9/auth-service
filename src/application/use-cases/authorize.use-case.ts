import { ClientRepository } from '../../domain/repositories/client.repository';
import { OAuthGrantType, OAuthResponseType } from '../enums/oauth.enum';
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
}

export class ValidateAuthorizeRequestUseCase {
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
    };
  }
}
