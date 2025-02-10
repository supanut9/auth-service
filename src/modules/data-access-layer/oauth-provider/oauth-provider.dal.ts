import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthProviderEntity } from './oauth-provider.entity';

@Injectable()
export class OAuthProviderDal {
  private readonly logger = new Logger(OAuthProviderDal.name);

  constructor(
    @InjectRepository(OAuthProviderEntity)
    private readonly OAuthProviderRepository: Repository<OAuthProviderEntity>,
  ) {}
}
