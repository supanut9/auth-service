import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('oauth_providers')
export class OAuthProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  user: UserEntity; // Links to the main user account

  @Column({ type: 'varchar', length: 50, name: 'provider', nullable: false })
  provider: 'google' | 'github' | 'instagram' | 'line'; // OAuth provider name

  @Column({
    type: 'varchar',
    length: 255,
    name: 'provider_user_id',
    nullable: false,
  })
  provider_user_id: string; // Unique ID from the OAuth provider (e.g., Google `sub` claim)

  @Column({ type: 'text', name: 'access_token', nullable: true })
  access_token?: string; // OAuth access token (optional)

  @Column({ type: 'text', name: 'refresh_token', nullable: true })
  refresh_token?: string; // OAuth refresh token (optional)

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expires_at?: Date; // Token expiration time (if available)

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}
