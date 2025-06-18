import { AuthorizationCode } from '../entities/authorization-code.entity';

export interface AuthorizationCodeRepository {
  save(code: AuthorizationCode): Promise<void>;
  findByCode(code: string): Promise<AuthorizationCode | null>;
}
