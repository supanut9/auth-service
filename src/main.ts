import { Elysia } from 'elysia';
import { oauthRoutes } from './infrastructure/web/routes/oauth.route';
import { ValidateAuthorizeRequestUseCase } from './application/use-cases/authorize.use-case';
import { OauthController } from './infrastructure/web/controllers/oauth.controller';
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
import { FacebookOAuthService } from './infrastructure/service/facebook.service';
import { staticPlugin } from '@elysiajs/static';
import { LineOAuthService } from './infrastructure/service/line.service';
import { TokenUseCase } from './application/use-cases/token.use-case';
import { MysqlAuthorizationCodeRepository } from './infrastructure/persistence/repository/authorization-code.repository';
import { MysqlAccessTokenRepository } from './infrastructure/persistence/repository/access-token.repository';
import { MysqlRefreshTokenRepository } from './infrastructure/persistence/repository/refresh-token.repository';
import { WellKnownController } from './infrastructure/web/controllers/well-known.controller';
import { wellKnownRoutes } from './infrastructure/web/routes/well-known.route';

const app = new Elysia();

// a. Create the repository (lowest level)
const mysqlClientRepository = new MysqlClientRepository();
const mysqlSessionRepository = new MysqlSessionRepository();
const mysqlUserRepository = new MysqlUserRepository();
const mysqlSocialIdentityRepository = new MysqlSocialIdentityRepository();
const mysqlAuthorizationCodeRepository = new MysqlAuthorizationCodeRepository();
const mysqlAccessTokenRepository = new MysqlAccessTokenRepository();
const mysqlRefreshTokenRepository = new MysqlRefreshTokenRepository();

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
  mysqlAuthorizationCodeRepository,
  mysqlAccessTokenRepository,
  mysqlRefreshTokenRepository
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
const wellKnownController = new WellKnownController();

app.use(staticPlugin());

app.use(wellKnownRoutes(wellKnownController));
app.use(oauthRoutes(oauthController));

app.group('/api', (app) => app.use(authRoutes(authController)));

const port = process.env.PORT || 3000;
app.listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
