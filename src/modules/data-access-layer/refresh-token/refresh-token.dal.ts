import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './refresh-token.entity';

@Injectable()
export class RefreshTokenDal {
  private readonly logger = new Logger(RefreshTokenDal.name);

  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly RefreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}
}
