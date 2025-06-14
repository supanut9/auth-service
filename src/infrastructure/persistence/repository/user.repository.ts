// ...

import { db } from '../db';
import { users } from '../schema';

export class MysqlUserRepository {
  async findByEmail(email: string): Promise<any> {
    const result = await db.select().from(users);

    console.log(result);
  }
}
