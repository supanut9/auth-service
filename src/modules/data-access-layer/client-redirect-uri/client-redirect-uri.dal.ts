import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRedirectUriEntity } from './client-redirect-uri.entity';

@Injectable()
export class ClientRedirectUriDal {
  private readonly logger = new Logger(ClientRedirectUriDal.name);

  constructor(
    @InjectRepository(ClientRedirectUriEntity)
    private readonly ClientRedirectUriRepository: Repository<ClientRedirectUriEntity>,
  ) {}
}
