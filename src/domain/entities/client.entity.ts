import { OAuthGrantType } from '../../application/enums/oauth.enum';

type ClientProps = {
  id: number;
  clientId: string;
  clientName: string;
  grantType: OAuthGrantType;
  allowedScopes?: string[];
  redirectUris?: string[];
};

export class Client {
  public readonly id: number;
  public readonly clientId: string;
  public readonly clientName: string;
  public readonly grantType: OAuthGrantType;
  public readonly allowedScopes?: string[];
  public readonly redirectUris?: string[];

  constructor({
    id,
    clientId,
    clientName,
    grantType,
    allowedScopes,
    redirectUris,
  }: ClientProps) {
    this.id = id;
    this.clientId = clientId;
    this.clientName = clientName;
    this.grantType = grantType;
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
}
