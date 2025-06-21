import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { InvalidCredentialsError } from '../errors/auth.error';

interface LoginUserRequest {
  email?: string;
  password?: string;
}

export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ email, password }: LoginUserRequest): Promise<User> {
    if (!email || !password) {
      throw new InvalidCredentialsError();
    }

    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.hashedPassword) {
      // Run a dummy verification to prevent timing attacks
      await Bun.password.verify(
        password,
        'dummy_hash_for_timing_attack_prevention'
      );
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await Bun.password.verify(
      password,
      user.hashedPassword
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}
