import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user/user.entity';
import { ClientEntity } from './client/client.entity';
import { ClientRedirectUriEntity } from './client-redirect-uri/client-redirect-uri.entity';
import { AuthorizationCodeEntity } from './authorization-code/authorization-code.entity';
import { JwkEntity } from './jwk/jwk.entity';
import { OAuthConsentEntity } from './oauth-consent/oauth-consent.entity';
import { OAuthProviderEntity } from './oauth-provider/oauth-provider.entity';
import { RefreshTokenEntity } from './refresh-token/refresh-token.entity';
import { AuthorizationCodeDal } from './authorization-code/authorization-code.dal';
import { ClientDal } from './client/client.dal';
import { ClientRedirectUriDal } from './client-redirect-uri/client-redirect-uri.dal';
import { JwkDal } from './jwk/jwk.dal';
import { OAuthConsentDal } from './oauth-consent/oauth-consent.dal';
import { OAuthProviderDal } from './oauth-provider/oauth-provider.dal';
import { RefreshTokenDal } from './refresh-token/refresh-token.dal';
import { UserDal } from './user/user.dal';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthorizationCodeEntity,
      ClientEntity,
      ClientRedirectUriEntity,
      JwkEntity,
      OAuthConsentEntity,
      OAuthProviderEntity,
      RefreshTokenEntity,
      UserEntity,
    ]),
  ],
  providers: [
    AuthorizationCodeDal,
    ClientDal,
    ClientRedirectUriDal,
    JwkDal,
    OAuthConsentDal,
    OAuthProviderDal,
    RefreshTokenDal,
    UserDal,
  ],
  exports: [
    AuthorizationCodeDal,
    ClientDal,
    ClientRedirectUriDal,
    JwkDal,
    OAuthConsentDal,
    OAuthProviderDal,
    RefreshTokenDal,
    UserDal,
  ],
})
export class DataAccessLayerModule {}
