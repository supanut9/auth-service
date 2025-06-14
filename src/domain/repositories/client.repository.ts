import { Client } from '../entities/client.entity';

export interface ClientRepository {
  findByClientId(clientId: string): Promise<Client | null>;
}
