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
import { GenerateAuthorizationCodeUseCase } from './application/use-cases/generate-authorization-code.use-case';
import { LoginSocialUseCase } from './application/use-cases/login-social.use-case';
import { MysqlUserRepository } from './infrastructure/persistence/repository/user.repository';
import { MysqlSocialIdentityRepository } from './infrastructure/persistence/repository/social-identity.repository';
import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { GoogleOAuthService } from './infrastructure/service/google.service';
import { FatalOAuthError } from './application/errors/oauth.error';
import { FacebookOAuthService } from './infrastructure/service/facebook.service';
import { staticPlugin } from '@elysiajs/static';
import { LineOAuthService } from './infrastructure/service/line.service';
import { TokenUseCase } from './application/use-cases/token.use-case';
import { MysqlAuthorizationCodeRepository } from './infrastructure/persistence/repository/authorization-code.repository';

const app = new Elysia();

// a. Create the repository (lowest level)
const mysqlClientRepository = new MysqlClientRepository();
const mysqlSessionRepository = new MysqlSessionRepository();
const mysqlUserRepository = new MysqlUserRepository();
const mysqlSocialIdentityRepository = new MysqlSocialIdentityRepository();
const mysqlAuthorizationCodeRepository = new MysqlAuthorizationCodeRepository();

// b. Create the use case and inject the repository
const validateAuthorizeUseCase = new ValidateAuthorizeRequestUseCase(
  mysqlClientRepository
);
const validateSessionUseCase = new ValidateSessionUseCase(
  mysqlSessionRepository
);
const generateAuthorizationCodeUseCase = new GenerateAuthorizationCodeUseCase(
  mysqlAuthorizationCodeRepository
);
const loginSocialUseCase = new LoginSocialUseCase(
  mysqlUserRepository,
  mysqlSocialIdentityRepository
);
const createSessionUseCase = new CreateSessionUseCase(mysqlSessionRepository);
const tokenUseCase = new TokenUseCase(
  mysqlClientRepository,
  mysqlAuthorizationCodeRepository
);

// External Services
const googleOAuthService = new GoogleOAuthService();
const facebookOAuthService = new FacebookOAuthService();
const lineOAuthService = new LineOAuthService();

// d. Create the controller and inject the use case
const oauthController = new OauthController(
  validateAuthorizeUseCase,
  validateSessionUseCase,
  generateAuthorizationCodeUseCase,
  tokenUseCase
);
const authController = new AuthController(
  googleOAuthService,
  facebookOAuthService,
  lineOAuthService,
  loginSocialUseCase,
  createSessionUseCase
);

app.use(staticPlugin());

app.group('/api', (app) => app.use(authRoutes(authController)));

app.use(oauthRoutes(oauthController));

const port = process.env.PORT || 3000;
app.listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
