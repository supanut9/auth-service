import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from './client.entity';

@Injectable()
export class ClientDal {
  private readonly logger = new Logger(ClientDal.name);

  constructor(
    @InjectRepository(ClientEntity)
    private readonly ClientRepository: Repository<ClientEntity>,
  ) {}
}
