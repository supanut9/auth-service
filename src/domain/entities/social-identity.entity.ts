import { User } from './user.entity';

type SocialIdentityProps = {
  id: number;
  provider: string;
  providerUserId: string;
  user?: User;
};

export class SocialIdentity {
  public readonly id: number;
  public readonly provider: string;
  public readonly providerUserId: string;
  public readonly user?: User;

  constructor(props: SocialIdentityProps) {
    this.id = props.id;
    this.provider = props.provider;
    this.providerUserId = props.providerUserId;
    this.user = props.user;
  }
}
