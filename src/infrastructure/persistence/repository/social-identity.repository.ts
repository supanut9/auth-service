import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { socialIdentities } from '../schema';
import { SocialIdentity } from '../../../domain/entities/social-identity.entity';
import { SocialIdentityRepository } from '../../../domain/repositories/social-identity.repository';
import { SocialProviderType } from '../../../application/enums/provider.enum';

export class MysqlSocialIdentityRepository implements SocialIdentityRepository {
  /**
   * Finds a social identity record based on the provider and the user's ID from that provider.
   * @param provider The name of the social provider (e.g., 'google').
   * @param providerUserId The user's unique ID from that provider.
   * @returns A SocialIdentity entity or null if not found.
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
   * @param data An object containing userId, provider, and providerUserId.
   * @returns The newly created SocialIdentity entity.
   */
  async create(data: {
    userId: number;
    provider: SocialProviderType;
    providerUserId: string;
  }): Promise<SocialIdentity> {
    // Insert the new record into the database
    const insertResult = await db.insert(socialIdentities).values(data);

    // Get the ID of the row we just inserted
    const newIdentityId = insertResult[0].insertId;

    // Fetch the newly created record from the database using its ID
    const newIdentity = await db.query.socialIdentities.findFirst({
      where: eq(socialIdentities.id, newIdentityId),
    });

    if (!newIdentity) {
      throw new Error('Failed to create and retrieve social identity.');
    }

    return new SocialIdentity(newIdentity);
  }
}
