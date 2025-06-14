type UserProps = {
  id: number;
  userId: string;
  email: string;
};

export class User {
  public readonly id: number;
  public readonly userId: string;
  public readonly email: string;

  constructor({ id, userId, email }: UserProps) {
    this.id = id;
    this.userId = userId;
    this.email = email;
  }
}
