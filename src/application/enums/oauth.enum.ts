export enum OAuthAuthorizationError {
  INVALID_REQUEST = 'invalid_request',
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  ACCESS_DENIED = 'access_denied',
  UNSUPPORTED_RESPONSE_TYPE = 'unsupported_response_type',
  INVALID_SCOPE = 'invalid_scope',
  SERVER_ERROR = 'server_error',
  TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable',
}

export enum OAuthGrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  CLIENT_CREDENTIALS = 'client_credentials',
  REFRESH_TOKEN = 'refresh_token',
}

export enum OAuthResponseType {
  CODE = 'code',
  ID_TOKEN = 'id_token',
}

export enum TokenEndpointAuthMethod {
  /**
   * The client uses HTTP Basic authentication.
   */
  CLIENT_SECRET_BASIC = 'client_secret_basic',

  /**
   * The client includes its credentials in the request body.
   */
  CLIENT_SECRET_POST = 'client_secret_post',

  /**
   * The client is a public client and does not have a secret.
   */
  NONE = 'none',
}
