import { relations } from 'drizzle-orm';
import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  text,
  mysqlEnum,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

// --- Enums ---

export const authMethodEnum = mysqlEnum('token_endpoint_auth_method', [
  'client_secret_basic',
  'client_secret_post',
  'none',
]);

export const providerEnum = mysqlEnum('provider', [
  'google',
  'facebook',
  'line',
]);

export const codeChallengeMethodEnum = mysqlEnum('code_challenge_method', [
  'plain',
  's256',
]);

// --- Table Definitions ---

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().unique(),
  email: varchar('email', { length: 255 }).unique(),
  hashedPassword: varchar('hashed_password', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const clients = mysqlTable('clients', {
  id: int('id').autoincrement().primaryKey(),
  clientId: varchar('client_id', { length: 36 }).notNull().unique(),
  clientSecret: varchar('client_secret', { length: 255 }).notNull(),
  clientName: varchar('client_name', { length: 255 }).notNull().unique(),
  grantType: text('grant_type').notNull(),
  scope: text('scope').notNull(),
  tokenEndpointAuthMethod: authMethodEnum.notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const redirectUris = mysqlTable('redirect_uris', {
  id: int('id').autoincrement().primaryKey(),
  uri: varchar('uri', { length: 2048 }).notNull(),
  clientId: int('client_id')
    .notNull()
    .references(() => clients.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const consents = mysqlTable(
  'consents',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id),
    clientId: int('client_id')
      .notNull()
      .references(() => clients.id),
    scope: text('scope').notNull(),
  },
  (table) => ({
    userClientConsentIdx: uniqueIndex('idx_user_client_consent').on(
      table.userId,
      table.clientId
    ),
  })
);

export const sessions = mysqlTable('sessions', {
  id: int('id').autoincrement().primaryKey(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const authorizationCodes = mysqlTable('authorization_codes', {
  id: int('id').autoincrement().primaryKey(),
  code: varchar('code', { length: 255 }).notNull().unique(),
  codeChallenge: varchar('code_challenge', { length: 255 }),
  codeChallengeMethod: codeChallengeMethodEnum,
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  clientId: int('client_id')
    .notNull()
    .references(() => clients.id),
  sessionId: int('session_id')
    .notNull()
    .references(() => sessions.id),
  redirectUri: varchar('redirect_uri', { length: 2048 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const refreshTokens = mysqlTable('refresh_tokens', {
  id: int('id').autoincrement().primaryKey(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  clientId: int('client_id')
    .notNull()
    .references(() => clients.id),
  sessionId: int('session_id')
    .notNull()
    .references(() => sessions.id),
  revokedAt: timestamp('revoked_at'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const accessTokens = mysqlTable('access_tokens', {
  id: int('id').autoincrement().primaryKey(),
  token: text('token').notNull(),
  authorizationCodeId: int('authorization_code_id')
    .unique()
    .references(() => authorizationCodes.id),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  clientId: int('client_id')
    .notNull()
    .references(() => clients.id),
  sessionId: int('session_id')
    .notNull()
    .references(() => sessions.id),
  scope: text('scope'),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  sourceRefreshTokenId: int('source_refresh_token_id').references(
    () => refreshTokens.id
  ),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const socialIdentities = mysqlTable(
  'social_identities',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('user_id')
      .notNull()
      .references(() => users.id),
    provider: providerEnum.notNull(),
    providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
    encryptedRefreshToken: text('encrypted_refresh_token'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    userProviderIdx: uniqueIndex('idx_user_provider').on(
      table.userId,
      table.provider
    ),
    providerUserIdx: uniqueIndex('idx_provider_user').on(
      table.provider,
      table.providerUserId
    ),
  })
);

// --- Relationship Definitions ---

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  consents: many(consents),
  authorizationCodes: many(authorizationCodes),
  accessTokens: many(accessTokens),
  refreshTokens: many(refreshTokens),
  socialIdentities: many(socialIdentities),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  redirectUris: many(redirectUris),
  consents: many(consents),
  authorizationCodes: many(authorizationCodes),
  accessTokens: many(accessTokens),
  refreshTokens: many(refreshTokens),
}));

export const redirectUrisRelations = relations(redirectUris, ({ one }) => ({
  client: one(clients, {
    fields: [redirectUris.clientId],
    references: [clients.id],
  }),
}));

export const consentsRelations = relations(consents, ({ one }) => ({
  user: one(users, {
    fields: [consents.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [consents.clientId],
    references: [clients.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  authorizationCodes: many(authorizationCodes),
  accessTokens: many(accessTokens),
  refreshTokens: many(refreshTokens),
}));

export const authorizationCodesRelations = relations(
  authorizationCodes,
  ({ one }) => ({
    client: one(clients, {
      fields: [authorizationCodes.clientId],
      references: [clients.id],
    }),
    user: one(users, {
      fields: [authorizationCodes.userId],
      references: [users.id],
    }),
    session: one(sessions, {
      fields: [authorizationCodes.sessionId],
      references: [sessions.id],
    }),
    accessToken: one(accessTokens, {
      fields: [authorizationCodes.id],
      references: [accessTokens.authorizationCodeId],
    }),
  })
);

export const accessTokensRelations = relations(accessTokens, ({ one }) => ({
  authorizationCode: one(authorizationCodes, {
    fields: [accessTokens.authorizationCodeId],
    references: [authorizationCodes.id],
  }),
  user: one(users, {
    fields: [accessTokens.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [accessTokens.clientId],
    references: [clients.id],
  }),
  session: one(sessions, {
    fields: [accessTokens.sessionId],
    references: [sessions.id],
  }),
  sourceRefreshToken: one(refreshTokens, {
    fields: [accessTokens.sourceRefreshTokenId],
    references: [refreshTokens.id],
  }),
}));

export const refreshTokensRelations = relations(
  refreshTokens,
  ({ one, many }) => ({
    user: one(users, {
      fields: [refreshTokens.userId],
      references: [users.id],
    }),
    client: one(clients, {
      fields: [refreshTokens.clientId],
      references: [clients.id],
    }),
    session: one(sessions, {
      fields: [refreshTokens.sessionId],
      references: [sessions.id],
    }),
    generatedAccessTokens: many(accessTokens),
  })
);

export const socialIdentitiesRelations = relations(
  socialIdentities,
  ({ one }) => ({
    user: one(users, {
      fields: [socialIdentities.userId],
      references: [users.id],
    }),
  })
);
