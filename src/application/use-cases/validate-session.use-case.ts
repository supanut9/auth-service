import { SessionRepository } from '../../domain/repositories/session.repository';

export class ValidateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sessionToken?: string): Promise<any> {
    if (!sessionToken) {
      return null;
    }

    try {
      const user = this.sessionRepository.findBySessionToken(sessionToken);

      return user || null;
    } catch (error) {
      console.error('Session validation failed:');
      return null;
    }
  }
}
