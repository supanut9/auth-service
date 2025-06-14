import { eq } from 'drizzle-orm';
import { db } from '../db';
import { clients } from '../schema';
import { Client } from '../../../domain/entities/client.entity';
import { ClientRepository } from '../../../domain/repositories/client.repository';
import { OAuthGrantType } from '../../../application/enums/oauth.enum';

export class MysqlClientRepository implements ClientRepository {
  async findByClientId(clientId: string): Promise<Client | null> {
    const oauthClientResult = await db.query.clients.findFirst({
      columns: {
        id: true,
        clientId: true,
        clientName: true,
        grantType: true,
        scope: true,
      },
      where: eq(clients.clientId, clientId),
      with: {
        redirectUris: {
          columns: {
            uri: true,
          },
        },
      },
    });

    if (!oauthClientResult) return null;

    const redirectUris = oauthClientResult.redirectUris.map((row) => row.uri);

    const allowedScopes = oauthClientResult.scope.split(' ');

    return new Client({
      id: oauthClientResult.id,
      clientId: oauthClientResult.clientId,
      clientName: oauthClientResult.clientName,
      grantType: oauthClientResult.grantType as OAuthGrantType,
      allowedScopes: allowedScopes,
      redirectUris: redirectUris,
    });
  }
}
