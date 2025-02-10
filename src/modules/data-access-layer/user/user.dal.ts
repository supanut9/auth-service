import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  EntityManager,
  FindOptionsWhere,
  UpdateResult,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { UserDL } from './user.dl';

@Injectable()
export class UserDal {
  private readonly logger = new Logger(UserDal.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async find(condition: FindManyOptions<UserEntity>): Promise<UserDL[]> {
    this.logger.log(
      `Finding users with condition: ${JSON.stringify(condition)}`,
    );
    const result = await this.userRepository.find(condition);
    return result.map(this.toData);
  }

  async findOne(options: FindOneOptions<UserEntity>): Promise<UserDL | null> {
    this.logger.log(
      `Finding one user with options: ${JSON.stringify(options)}`,
    );
    const result = await this.userRepository.findOne(options);
    return result ? this.toData(result) : null;
  }

  async create(
    data: Partial<UserDL>,
    entityManager?: EntityManager,
  ): Promise<UserDL> {
    this.logger.log(`Creating user: ${JSON.stringify(data)}`);

    let result: UserEntity;
    if (entityManager) {
      result = await entityManager.save(UserEntity, data);
    } else {
      result = await this.userRepository.save(data);
    }
    return this.toData(result);
  }

  async update(
    condition: FindOptionsWhere<UserEntity>,
    data: Partial<UserDL>,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    this.logger.log(
      `Updating user with condition: ${JSON.stringify(condition)} and data: ${JSON.stringify(data)}`,
    );

    let result: UpdateResult;
    if (entityManager) {
      result = await entityManager.update(UserEntity, condition, data);
    } else {
      result = await this.userRepository.update(condition, data);
    }
    return result.affected !== undefined && result.affected > 0;
  }

  private toData(entity: UserEntity): UserDL {
    return {
      id: entity.id,
      userId: entity.userId,
      username: entity.username || null,
      password: entity.password || null,
      email: entity.email || null,
      mobileNumber: entity.mobileNumber || null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt || null,
    };
  }
}
