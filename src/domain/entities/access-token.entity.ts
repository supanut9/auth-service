type AccessTokenProps = {
  id?: number;
  token: string;
  userId?: number;
  clientId: number;
  sessionId?: number;
  scope?: string;
  expiresAt: Date;
  authorizationCodeId?: number;
  sourceRefreshTokenId?: number;
};

export class AccessToken {
  public readonly id?: number;
  public readonly token: string;
  public readonly userId?: number;
  public readonly clientId: number;
  public readonly sessionId?: number;
  public readonly scope?: string;
  public readonly expiresAt: Date;
  public readonly authorizationCodeId?: number;
  public readonly sourceRefreshTokenId?: number;

  constructor(props: AccessTokenProps) {
    this.id = props.id;
    this.token = props.token;
    this.userId = props.userId;
    this.clientId = props.clientId;
    this.sessionId = props.sessionId;
    this.scope = props.scope;
    this.expiresAt = props.expiresAt;
    this.authorizationCodeId = props.authorizationCodeId;
    this.sourceRefreshTokenId = props.sourceRefreshTokenId;
  }
}
