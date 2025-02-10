import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorizationCodeEntity } from './authorization-code.entity';

@Injectable()
export class AuthorizationCodeDal {
  private readonly logger = new Logger(AuthorizationCodeDal.name);

  constructor(
    @InjectRepository(AuthorizationCodeEntity)
    private readonly authorizationCodeRepository: Repository<AuthorizationCodeEntity>,
  ) {}
}
