// src/errors/http.errors.ts

// The base class does not need to change.
export class HttpException extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly error: string
  ) {
    super(message);
  }
}

type ErrorOptions = { message?: string; error?: string; status?: number };

export class BadRequestError extends HttpException {
  constructor(optionsOrMessage?: string | ErrorOptions) {
    const defaults = {
      status: 400,
      error: 'BAD_REQUEST',
      message: 'Bad Request',
    };

    if (typeof optionsOrMessage === 'string') {
      super(defaults.status, optionsOrMessage, defaults.error);
    } else {
      const options = { ...defaults, ...optionsOrMessage };
      super(options.status, options.message, options.error);
    }
  }
}

export class NotFoundError extends HttpException {
  constructor(optionsOrMessage?: string | ErrorOptions) {
    const defaults = {
      status: 404,
      error: 'NOT_FOUND',
      message: 'Not Found',
    };

    if (typeof optionsOrMessage === 'string') {
      super(defaults.status, optionsOrMessage, defaults.error);
    } else {
      const options = { ...defaults, ...optionsOrMessage };
      super(options.status, options.message, options.error);
    }
  }
}
