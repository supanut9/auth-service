import { SessionRepository } from '../../domain/repositories/session.repository';
import { Session } from '../../domain/entities/session.entity';

export class CreateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(userId: number): Promise<Session> {
    const session = await this.sessionRepository.create(userId);
    return session;
  }
}
