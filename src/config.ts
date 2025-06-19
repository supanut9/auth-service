import { SignOptions } from 'jsonwebtoken';
import * as jose from 'jose'; // The library for JWK generation
import * as path from 'path'; // For handling file paths correctly
import { createHash, createPublicKey } from 'crypto';

// Define a type for our key objects
interface IKey {
  kid: string;
  privateKey: string; // PEM string for signing JWTs
  publicKeyJwk: jose.JWK; // The public key data for the JWKS endpoint
}

function getEnv(key: string): string {
  // Using Bun's native environment variable access
  const value = Bun.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// 1. Get the JSON configuration string from the environment
const keysConfigJson = getEnv('PRIVATE_KEYS');
const keysInfo = JSON.parse(keysConfigJson);

// 2. Read the private keys and generate the public JWKs in memory
const keys: IKey[] = await Promise.all(
  keysInfo.map(async (keyInfo: any) => {
    const privateKeyPath = path.resolve(process.cwd(), keyInfo.privateKeyPath);
    const privateKeyPem = await Bun.file(privateKeyPath).text();

    const publicKeyObject = createPublicKey(privateKeyPem);
    // Export the public part of the key into the JWK format
    const publicKeyJwk = await jose.exportJWK(publicKeyObject);

    const kid = createHash('sha256').update(privateKeyPath).digest('hex');

    // Add the required metadata for the JWKS endpoint
    publicKeyJwk.kid = kid;
    publicKeyJwk.alg = 'RS512';
    publicKeyJwk.use = 'sig';

    return {
      kid: kid,
      privateKey: privateKeyPem,
      publicKeyJwk: publicKeyJwk,
    };
  })
);

if (!keys || keys.length === 0) {
  throw new Error(
    'JWT keys configuration is invalid or files could not be read.'
  );
}

const currentSigningKey = keys[0];

const jwks = {
  keys: keys.map((key) => key.publicKeyJwk),
};

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
  tokenExpiresIn: {
    accessToken: 60 * 60, // 1 hour
    refreshToken: 60 * 60 * 24 * 30, // 30 days
    idToken: 60 * 60, // 1 hour
  },
  jwt: {
    currentSigningKey,
    jwks, // The JWKS object for your well-known endpoint
    signOptions: {
      algorithm: 'RS512',
      expiresIn: '1h',
    } as SignOptions,
  },
};
