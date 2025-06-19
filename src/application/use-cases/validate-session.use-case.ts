import { Session } from '../../domain/entities/session.entity';
import { SessionRepository } from '../../domain/repositories/session.repository';

export class ValidateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sessionToken?: string): Promise<Session | null> {
    if (!sessionToken) {
      return null;
    }

    try {
      const session = this.sessionRepository.findBySessionToken(sessionToken);

      return session || null;
    } catch (error) {
      console.error('Session validation failed:');
      return null;
    }
  }
}
