import {
  OAuthGrantType,
  OAuthResponseType,
  TokenEndpointAuthMethod,
} from '../../../application/enums/oauth.enum';
import { config } from '../../../config';

/**
 * Controller for handling OIDC .well-known endpoints.
 */
export class WellKnownController {
  /**
   * Serves the OpenID Provider Configuration document.
   * This document informs clients about the provider's capabilities and endpoint locations.
   */
  getOpenIdConfiguration() {
    const issuer = config.url.baseUrl;

    return {
      issuer: issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      userinfo_endpoint: 'not_yet', // temporary
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      scopes_supported: ['openid', 'profile', 'email'], // temporary
      response_types_supported: [
        OAuthResponseType.CODE,
        OAuthResponseType.ID_TOKEN,
      ],
      grant_types_supported: [
        OAuthGrantType.AUTHORIZATION_CODE,
        OAuthGrantType.CLIENT_CREDENTIALS,
        OAuthGrantType.REFRESH_TOKEN,
      ],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS512'],
      token_endpoint_auth_methods_supported: [
        TokenEndpointAuthMethod.NONE,
        TokenEndpointAuthMethod.CLIENT_SECRET_BASIC,
        TokenEndpointAuthMethod.CLIENT_SECRET_POST,
      ],
    };
  }

  /**
   * Serves the JSON Web Key Set (JWKS).
   * This allows clients to retrieve the public keys needed to verify JWT signatures.
   */
  getJwks() {
    // The JWKS object is already prepared in our config file.
    return config.jwt.jwks;
  }
}
