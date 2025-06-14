import { SocialIdentity } from '../entities/social-identity.entity';
import { User } from '../entities/user.entity';

export interface SocialIdentityRepository {
  findByProviderUserId(
    provider: string,
    providerUserId: string
  ): Promise<SocialIdentity | null>;

  create(data: {
    userId: number;
    provider: string;
    providerUserId: string;
  }): Promise<SocialIdentity>;

  findUserBySocialIdentity(
    provider: string,
    providerUserId: string
  ): Promise<SocialIdentity | null>;
}
