import { User } from './user.entity';

type RefreshTokenProps = {
  id?: number;
  token: string;
  userId: number;
  clientId: number;
  sessionId: number;
  expiresAt: Date;
  revokedAt?: Date | null;
  user?: Pick<User, 'id' | 'userId'>;
};

export class RefreshToken {
  public readonly id?: number;
  public readonly token: string;
  public readonly userId: number;
  public readonly clientId: number;
  public readonly sessionId: number;
  public readonly expiresAt: Date;
  public readonly revokedAt?: Date | null;
  public readonly user?: Pick<User, 'id' | 'userId'>;

  constructor(props: RefreshTokenProps) {
    this.id = props.id;
    this.token = props.token;
    this.userId = props.userId;
    this.clientId = props.clientId;
    this.sessionId = props.sessionId;
    this.expiresAt = props.expiresAt;
    this.revokedAt = props.revokedAt;
    this.user = props.user;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isRevoked(): boolean {
    return this.revokedAt !== null && this.revokedAt !== undefined;
  }
}
