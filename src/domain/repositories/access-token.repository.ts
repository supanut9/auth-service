import { AccessToken } from '../entities/access-token.entity';

export interface AccessTokenRepository {
  create(accessToken: AccessToken): Promise<void>;
}
