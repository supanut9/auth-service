import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthConsentEntity } from './oauth-consent.entity';

@Injectable()
export class OAuthConsentDal {
  private readonly logger = new Logger(OAuthConsentDal.name);

  constructor(
    @InjectRepository(OAuthConsentEntity)
    private readonly OAuthConsentRepository: Repository<OAuthConsentEntity>,
  ) {}
}
