type UserProps = {
  id: number;
  userId: string;
  email: string | null;
};

export class User {
  public readonly id: number;
  public readonly userId: string;
  public readonly email: string | null;

  constructor({ id, userId, email }: UserProps) {
    this.id = id;
    this.userId = userId;
    this.email = email;
  }
}
