import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ClientEntity } from '../client/client.entity';

@Entity('authorization_codes')
export class AuthorizationCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  user: UserEntity;

  @ManyToOne(() => ClientEntity, { nullable: false })
  client: ClientEntity;

  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @Column({ name: 'redirect_uri', type: 'text', nullable: false })
  redirect_uri: string;

  @Column({ type: 'text', nullable: true })
  scope?: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  expires_at: Date;

  @Column({ name: 'used', type: 'boolean', default: false })
  used: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deleted_at: Date | null;
}
