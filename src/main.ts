import { Elysia } from 'elysia';
import { oauthRoutes } from './infrastructure/web/routes/oauth.route';
import { ValidateAuthorizeRequestUseCase } from './application/use-cases/authorize.use-case';
import { OauthController } from './infrastructure/web/controllers/oauth.controller';
import { HttpException } from './application/errors/http.error';
import { authRoutes } from './infrastructure/web/routes/auth.route';
import { AuthController } from './infrastructure/web/controllers/auth.controller';
import { ValidateSessionUseCase } from './application/use-cases/validate-session.use-case';
import { MysqlClientRepository } from './infrastructure/persistence/repository/client.repository';
import { MysqlSessionRepository } from './infrastructure/persistence/repository/session.repository';

const app = new Elysia();

// a. Create the repository (lowest level)
const mysqlClientRepository = new MysqlClientRepository();
const mysqlSessionRepository = new MysqlSessionRepository();

// b. Create the use case and inject the repository
const validateAuthorizeUseCase = new ValidateAuthorizeRequestUseCase(
  mysqlClientRepository
);
const validateSessionUseCase = new ValidateSessionUseCase(
  mysqlSessionRepository
);

// c. Create the controller and inject the use case
const oauthController = new OauthController(
  validateAuthorizeUseCase,
  validateSessionUseCase
);
const authController = new AuthController();

app.onError(({ error, code, set }) => {
  // Log the actual error for debugging
  console.error(error);

  // Handle our custom HTTP exceptions
  if (error instanceof HttpException) {
    set.status = error.status;

    return {
      status: error.status,
      error: error.error,
      message: error.message,
    };
  }

  // Handle Elysia's built-in validation errors consistently
  if (code === 'VALIDATION') {
    set.status = 400;
    return {
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Input validation failed',
    };
  }
});

app.group('/api', (app) => app.use(authRoutes(authController)));

app.use(oauthRoutes(oauthController));

const port = process.env.PORT || 3000;
app.listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
