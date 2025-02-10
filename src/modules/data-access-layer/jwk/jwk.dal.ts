import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwkEntity } from './jwk.entity';

@Injectable()
export class JwkDal {
  private readonly logger = new Logger(JwkDal.name);

  constructor(
    @InjectRepository(JwkEntity)
    private readonly JwkRepository: Repository<JwkEntity>,
  ) {}
}
