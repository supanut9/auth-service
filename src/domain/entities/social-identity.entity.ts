type SocialIdentityProps = {
  id: number;
  userId: number;
  provider: string;
  providerUserId: string;
};

export class SocialIdentity {
  public readonly id: number;
  public readonly userId: number;
  public readonly provider: string;
  public readonly providerUserId: string;

  constructor(props: SocialIdentityProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.provider = props.provider;
    this.providerUserId = props.providerUserId;
  }
}
