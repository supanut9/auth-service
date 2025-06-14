type SessionProps = {
  id: number;
  sessionToken: string;
  userId: number;
};

export class Session {
  public readonly id: number;
  public readonly sessionToken: string;
  public readonly userId: number;

  constructor({ id, sessionToken, userId }: SessionProps) {
    this.id = id;
    this.sessionToken = sessionToken;
    this.userId = userId;
  }
}
