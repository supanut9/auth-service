import { SocialIdentity } from '../entities/social-identity.entity';

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
}
