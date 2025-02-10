import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ClientEntity } from '../client/client.entity';

@Entity('client_redirect_uris')
export class ClientRedirectUriEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'redirect_uri', type: 'varchar', length: 255, unique: false })
  redirectUri: string; // Redirect URI for OAuth2 Authorization

  @ManyToOne(() => ClientEntity, (client) => client.redirectUris, {
    onDelete: 'CASCADE',
  })
  client: ClientEntity;
}
