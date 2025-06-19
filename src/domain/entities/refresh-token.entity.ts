type RefreshTokenProps = {
  id?: number;
  token: string;
  userId: number;
  clientId: number;
  sessionId: number;
  expiresAt: Date;
};

export class RefreshToken {
  public readonly id?: number;
  public readonly token: string;
  public readonly userId: number;
  public readonly clientId: number;
  public readonly sessionId: number;
  public readonly expiresAt: Date;

  constructor(props: RefreshTokenProps) {
    this.id = props.id;
    this.token = props.token;
    this.userId = props.userId;
    this.clientId = props.clientId;
    this.sessionId = props.sessionId;
    this.expiresAt = props.expiresAt;
  }
}
