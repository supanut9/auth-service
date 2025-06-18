import {
  OAuthGrantType,
  TokenEndpointAuthMethod,
} from '../../application/enums/oauth.enum';

type ClientProps = {
  id: number;
  clientId: string;
  clientSecret: string;
  clientName: string;
  grantTypes: OAuthGrantType[];
  tokenEndpointAuthMethod: TokenEndpointAuthMethod;
  allowedScopes?: string[];
  redirectUris?: string[];
};

export class Client {
  public readonly id: number;
  public readonly clientId: string;
  public readonly clientSecret: string;
  public readonly clientName: string;
  public readonly grantTypes: OAuthGrantType[];
  public readonly tokenEndpointAuthMethod: TokenEndpointAuthMethod;
  public readonly allowedScopes?: string[];
  public readonly redirectUris?: string[];

  constructor({
    id,
    clientId,
    clientSecret,
    clientName,
    grantTypes,
    tokenEndpointAuthMethod,
    allowedScopes,
    redirectUris,
  }: ClientProps) {
    this.id = id;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.clientName = clientName;
    this.grantTypes = grantTypes;
    this.tokenEndpointAuthMethod = tokenEndpointAuthMethod;
    this.allowedScopes = allowedScopes;
    this.redirectUris = redirectUris;
  }

  isRedirectUriValid(uriToTest: string): boolean {
    if (!this.redirectUris) {
      return false;
    }

    return this.redirectUris.includes(uriToTest);
  }

  areScopesValid(scopesToTest: string[]): boolean {
    if (!this.allowedScopes) {
      return false;
    }

    return scopesToTest.every((scope) => this.allowedScopes?.includes(scope));
  }

  isGrantTypeAllowed(grantType: OAuthGrantType): boolean {
    return this.grantTypes.includes(grantType);
  }
}
