import { HttpException } from './http.error';

export class FatalOAuthError extends HttpException {}

export class InvalidClientError extends FatalOAuthError {
  constructor(message = 'client_id is missing or invalid.') {
    super(400, message, 'invalid_request');
  }
}

export class InvalidRedirectUriError extends FatalOAuthError {
  constructor(message = 'redirect_uri is missing or invalid.') {
    super(400, message, 'invalid_request');
  }
}

export class InvalidGrantError extends HttpException {
  constructor(
    message = 'The provided authorization grant or refresh token is invalid, expired, revoked, or was issued to another client.'
  ) {
    super(400, message, 'invalid_grant');
  }
}

export class InvalidRequestError extends HttpException {
  constructor(
    message = 'The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed.'
  ) {
    super(400, message, 'invalid_request');
  }
}

export class UnauthorizedClientError extends HttpException {
  constructor(
    message = 'The client is not authorized to request an authorization code using this method.'
  ) {
    super(400, message, 'unauthorized_client');
  }
}

export class UnsupportedGrantTypeError extends HttpException {
  constructor(
    message = 'The authorization grant type is not supported by the authorization server.'
  ) {
    super(400, message, 'unsupported_grant_type');
  }
}

export class UnsupportedResponseTypeError extends HttpException {
  constructor(
    message = 'The authorization server does not support obtaining an authorization code using this method.'
  ) {
    super(400, message, 'unsupported_response_type');
  }
}

export class InvalidScopeError extends HttpException {
  constructor(
    message = 'The requested scope is invalid, unknown, or malformed.'
  ) {
    super(400, message, 'invalid_scope');
  }
}

export class AccessDeniedError extends HttpException {
  constructor(
    message = 'The resource owner or authorization server denied the request.'
  ) {
    super(400, message, 'access_denied');
  }
}
