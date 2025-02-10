import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('jwks')
export class JwkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'private_key', nullable: false })
  private_key: string;

  @Column({ type: 'text', name: 'public_key', nullable: false })
  public_key: string;

  @Column({ type: 'varchar', length: 50, name: 'key_use', nullable: false })
  key_use: 'access_token' | 'refresh_token' | 'id_token';

  @Column({ type: 'boolean', name: 'is_active', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}
