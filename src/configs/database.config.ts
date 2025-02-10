import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthorizationCodeEntity } from 'src/modules/data-access-layer/authorization-code/authorization-code.entity';
import { ClientRedirectUriEntity } from 'src/modules/data-access-layer/client-redirect-uri/client-redirect-uri.entity';
import { ClientEntity } from 'src/modules/data-access-layer/client/client.entity';
import { JwkEntity } from 'src/modules/data-access-layer/jwk/jwk.entity';
import { OAuthConsentEntity } from 'src/modules/data-access-layer/oauth-consent/oauth-consent.entity';
import { OAuthProviderEntity } from 'src/modules/data-access-layer/oauth-provider/oauth-provider.entity';
import { RefreshTokenEntity } from 'src/modules/data-access-layer/refresh-token/refresh-token.entity';
import { UserEntity } from 'src/modules/data-access-layer/user/user.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      bigNumberStrings: false,
      host: this.configService.get<string>('DB_URL'),
      port: this.configService.get<number>('DB_PORT'),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
      synchronize: true,
      extra: {
        connectionLimit: this.configService.get<number>('DB_CON_LIMIT', 20),
      },
      entities: [
        AuthorizationCodeEntity,
        ClientEntity,
        ClientRedirectUriEntity,
        JwkEntity,
        OAuthConsentEntity,
        OAuthProviderEntity,
        RefreshTokenEntity,
        UserEntity,
      ],
      timezone: 'Z',
    } as TypeOrmModuleOptions;
  }
}
