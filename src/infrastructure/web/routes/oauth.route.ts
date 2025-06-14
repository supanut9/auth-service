import { Elysia, ERROR_CODE } from 'elysia';
import { OauthController } from '../controllers/oauth.controller';

export const oauthRoutes = (controller: OauthController) => {
  return new Elysia({ prefix: 'oauth' }).get(
    'authorize',
    (context) => controller.authorize(context)
    // {
    //   query: AuthorizeQueryDTO,
    // }
  );
};
