import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { config } from '../../config';

const connectionPool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  connectionLimit: 10,
  waitForConnections: true,
});

export const db = drizzle({
  client: connectionPool,
  schema,
  mode: 'planetscale',
});
