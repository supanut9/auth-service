import { HttpException } from './http.error';

export class InvalidCredentialsError extends HttpException {
  constructor(message = 'Invalid email or password.') {
    super(401, message, 'invalid_credentials');
  }
}
