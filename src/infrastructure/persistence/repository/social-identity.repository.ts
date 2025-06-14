import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { socialIdentities } from '../schema';
import { SocialIdentity } from '../../../domain/entities/social-identity.entity';
import { SocialIdentityRepository } from '../../../domain/repositories/social-identity.repository';
import { User } from '../../../domain/entities/user.entity';
import { SocialProviderType } from '../../../application/enums/provider.enum';

export class MysqlSocialIdentityRepository implements SocialIdentityRepository {
  /**
   * This is the new, correct method. It finds a user directly by their
   * linked social provider information using a single, efficient database query.
   * @param provider The name of the social provider (e.g., 'google').
   * @param providerUserId The user's unique ID from that provider.
   * @returns A User entity if found, otherwise null.
   */
  async findUserBySocialIdentity(
    provider: SocialProviderType,
    providerUserId: string
  ): Promise<SocialIdentity | null> {
    const socialIdentity = await db.query.socialIdentities.findFirst({
      // The 'where' clause correctly filters the 'social_identities' table
      where: and(
        eq(socialIdentities.provider, provider),
        eq(socialIdentities.providerUserId, providerUserId)
      ),
      // The 'with' clause fetches the related user in the same query
      with: {
        user: true,
      },
    });

    if (!socialIdentity || !socialIdentity.user) {
      return null;
    }

    return new SocialIdentity(socialIdentity);
  }

  /**
   * Finds a social identity record based on the provider and the user's ID from that provider.
   */
  async findByProviderUserId(
    provider: SocialProviderType,
    providerUserId: string
  ): Promise<SocialIdentity | null> {
    const identity = await db.query.socialIdentities.findFirst({
      where: and(
        eq(socialIdentities.provider, provider),
        eq(socialIdentities.providerUserId, providerUserId)
      ),
    });

    if (!identity) {
      return null;
    }

    return new SocialIdentity(identity);
  }

  /**
   * Creates a new social identity record to link a user account with a social provider.
   */
  async create(data: {
    userId: number;
    provider: SocialProviderType;
    providerUserId: string;
  }): Promise<SocialIdentity> {
    const insertResult = await db.insert(socialIdentities).values(data);
    const newIdentityId = insertResult[0].insertId;
    const newIdentity = await db.query.socialIdentities.findFirst({
      where: eq(socialIdentities.id, newIdentityId),
    });

    if (!newIdentity) {
      throw new Error('Failed to create and retrieve social identity.');
    }

    return new SocialIdentity(newIdentity);
  }
}
