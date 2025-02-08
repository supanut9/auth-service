import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

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
      extra: {
        connectionLimit: this.configService.get<number>('DB_CON_LIMIT', 20),
      },
      entities: [],
      timezone: 'Z',
    } as TypeOrmModuleOptions;
  }
}
