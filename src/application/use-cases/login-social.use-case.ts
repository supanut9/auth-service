import { UserRepository } from '../../domain/repositories/user.repository';
import { SocialIdentityRepository } from '../../domain/repositories/social-identity.repository';
import { User } from '../../domain/entities/user.entity';

interface LoginSocialRequest {
  provider: string;
  providerId: string;
  email: string;
}

export class LoginSocialUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly socialIdentityRepository: SocialIdentityRepository
  ) {}

  /**
   * This is the single method that encapsulates the entire business logic
   * for finding or creating a user based on their social profile.
   */
  async execute({
    provider,
    providerId,
    email,
  }: LoginSocialRequest): Promise<User> {
    // Step 1: Use the new, correct method from the SocialIdentityRepository
    // to find the user in a single, efficient query.
    const existingSocialIdentity =
      await this.socialIdentityRepository.findUserBySocialIdentity(
        provider,
        providerId
      );

    // Step 2: If the user already exists, the process is complete. Return them.
    if (existingSocialIdentity?.user) {
      console.log(
        `User #${existingSocialIdentity.user.userId} found via social identity. Login successful.`
      );
      return existingSocialIdentity.user;
    }

    // Step 3: If no user was found, orchestrate the creation process.
    console.log(`No existing user found. Starting new user creation process.`);

    // a. Create the user record, passing the email from the social provider.
    const newUser = await this.userRepository.create();

    // b. Create the social identity link to the new user.
    await this.socialIdentityRepository.create({
      userId: newUser.id,
      provider: provider,
      providerUserId: providerId,
    });

    console.log(
      `New user #${newUser.id} created and linked to ${provider} account.`
    );
    return newUser;
  }
}
