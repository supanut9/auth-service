import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './src/infrastructure/persistence/schema.ts',
  dbCredentials: {
    host: '127.0.0.1',
    port: 3306,
    user: 'admin',
    password: 'admin',
    database: 'auth',
  },
});
