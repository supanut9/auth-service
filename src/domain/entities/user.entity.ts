type UserProps = {
  id: number;
  userId: string;
  email: string | null;
  hashedPassword?: string | null;
};

export class User {
  public readonly id: number;
  public readonly userId: string;
  public readonly email: string | null;
  public readonly hashedPassword?: string | null;

  constructor({ id, userId, email, hashedPassword }: UserProps) {
    this.id = id;
    this.userId = userId;
    this.email = email;
    this.hashedPassword = hashedPassword;
  }
}
