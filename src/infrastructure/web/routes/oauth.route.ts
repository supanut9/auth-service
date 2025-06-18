import { Elysia } from 'elysia';
import { OauthController } from '../controllers/oauth.controller';
import { FatalOAuthError } from '../../../application/errors/oauth.error';
import { HttpException } from '../../../application/errors/http.error';

export const oauthRoutes = (controller: OauthController) => {
  return new Elysia({ prefix: 'oauth' })
    .get('authorize', (context) => controller.authorize(context), {
      error({ error, set }) {
        // For /authorize, we might want to return an HTML error page
        if (error instanceof FatalOAuthError) {
          set.status = error.status;
          return `
              <div style="font-family: sans-serif; text-align: center; padding: 40px;">
                <h1 style="color: #d32f2f;">Authorization Error</h1>
                <p>${error.message}</p>
              </div>
            `;
        }

        // Fallback for other errors on this route
        if (error instanceof HttpException) {
          set.status = error.status;
          return {
            error: error.error,
            error_description: error.message,
          };
        }
      },
    })
    .post(
      'token',
      (context) => controller.token(context),
      // --- Error handling specific to the /token route ---
      {
        error({ error, set }) {
          // For the /token endpoint, we always want to return JSON errors
          if (error instanceof HttpException) {
            set.status = error.status;
            return {
              error: error.error,
              error_description: error.message,
            };
          }
        },
      }
    );
};
