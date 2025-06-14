import { UserRepository } from '../../domain/repositories/user.repository';
import { SocialIdentityRepository } from '../../domain/repositories/social-identity.repository';
import { User } from '../../domain/entities/user.entity';

interface LoginGoogleRequest {
  googleId: string;
  email: string;
}

export class LoginGoogleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly socialIdentityRepository: SocialIdentityRepository
  ) {}

  async execute({ googleId, email }: LoginGoogleRequest): Promise<User> {
    // Check if a social identity with this googleId already exists
    const existingIdentity =
      await this.socialIdentityRepository.findByProviderUserId(
        'google',
        googleId
      );

    if (existingIdentity) {
      // If it exists, find and return the associated user
      const user = await this.userRepository.findById(existingIdentity.userId);
      if (!user) {
        // This case indicates a data inconsistency
        throw new Error('User not found for existing social identity.');
      }
      return user;
    }

    // If no social identity exists, check if a user with this email already exists
    // (e.g., they signed up with a password before)
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      // If the user doesn't exist at all, create them
      user = await this.userRepository.create({ email });
    }

    // Create the new social identity and link it to the user
    await this.socialIdentityRepository.create({
      userId: user.id,
      provider: 'google',
      providerUserId: googleId,
    });

    return user;
  }
}
