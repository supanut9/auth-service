function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const config = {
  url: {
    baseUrl: getEnv('BASE_URL'),
  },
  database: {
    host: getEnv('DB_HOST'),
    port: parseInt(getEnv('DB_PORT')),
    user: getEnv('DB_USER'),
    password: getEnv('DB_PASSWORD'),
    name: getEnv('DB_NAME'),
  },
  google: {
    clientId: getEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
    callbackUrl: getEnv('GOOGLE_CALLBACK_URL'),
  },
  facebook: {
    appId: getEnv('FACEBOOK_APP_ID'),
    appSecret: getEnv('FACEBOOK_APP_SECRET'),
    callbackUrl: getEnv('FACEBOOK_CALLBACK_URL'),
  },
  line: {
    clientId: getEnv('LINE_CHANNEL_ID'),
    clientSecret: getEnv('LINE_CHANNEL_SECRET'),
    callbackUrl: getEnv('LINE_CALLBACK_URL'),
  },
  session: {
    cookieName: 'session_token',
    expiresInDays: 30,
  },
  authCode: {
    expiresInMinutes: 5,
  },
};
