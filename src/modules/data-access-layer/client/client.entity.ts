import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ClientRedirectUriEntity } from '../client-redirect-uri/client-redirect-uri.entity';
import { BadRequestException } from '@nestjs/common';

export enum GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  CLIENT_CREDENTIALS = 'client_credentials',
}

export enum ClientType {
  PUBLIC = 'public',
  CONFIDENTIAL = 'confidential',
}

@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'client_name', type: 'varchar', length: 100, unique: true })
  clientName: string;

  @Column({ name: 'client_id', type: 'varchar', length: 100, unique: true })
  clientId: string;

  @Column({
    name: 'client_secret',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  clientSecret: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'grant_type',
    type: 'enum',
    enum: GrantType,
  })
  grantType: GrantType;

  @Column({
    name: 'client_type',
    type: 'enum',
    enum: ClientType,
    default: ClientType.CONFIDENTIAL,
  })
  clientType: ClientType;

  @Column({ name: 'require_pkce', type: 'boolean', default: false })
  requirePkce: boolean;

  @Column({ name: 'access_token_lifetime', type: 'int', default: 3600 })
  accessTokenLifetime: number;

  @Column({ name: 'refresh_token_lifetime', type: 'int', default: 1209600 })
  refreshTokenLifetime: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  /**
   * One-to-Many Relationship: A client can have multiple redirect URIs.
   */
  @OneToMany(
    () => ClientRedirectUriEntity,
    (redirectUri) => redirectUri.client,
    {
      cascade: true,
    },
  )
  redirectUris: ClientRedirectUriEntity[];

  /**
   * Validate clientType and grantType before inserting or updating the entity.
   */
  @BeforeInsert()
  @BeforeUpdate()
  validateGrantType() {
    if (
      this.clientType === ClientType.PUBLIC &&
      this.grantType !== GrantType.AUTHORIZATION_CODE
    ) {
      throw new BadRequestException(
        "Public clients can only use 'authorization_code' grant type.",
      );
    }
    if (
      this.clientType === ClientType.CONFIDENTIAL &&
      ![GrantType.AUTHORIZATION_CODE, GrantType.CLIENT_CREDENTIALS].includes(
        this.grantType,
      )
    ) {
      throw new BadRequestException(
        "Confidential clients can only use 'authorization_code' or 'client_credentials' grant types.",
      );
    }
  }
}
