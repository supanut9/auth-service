import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ClientEntity } from '../client/client.entity';

@Entity('oauth_consents')
export class OAuthConsentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => ClientEntity, { nullable: false, onDelete: 'CASCADE' })
  client: ClientEntity;

  @Column({ type: 'text', name: 'scopes', nullable: false })
  scopes: string; // Comma-separated list of scopes (e.g., "openid,profile,email")

  @Column({ type: 'boolean', name: 'remember', default: false })
  remember: boolean; // Whether the user chose "Remember this decision"

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expires_at: Date | null; // Optional: Consent expiration time

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}
