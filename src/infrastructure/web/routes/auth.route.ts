import { Elysia } from 'elysia';
import { AuthController } from '../controllers/auth.controller';

export const authRoutes = (controller: AuthController) => {
  return (
    new Elysia({ prefix: 'auth' })
      // --- Standard Authentication ---
      .post('/login', (context) => controller.login(context))
      // .post('/register', (context) => controller.register(context))

      // --- Dynamic Social Provider Routes ---
      // This single group handles Google, Facebook, and any future provider
      .group('/:provider', (app) =>
        app
          // Matches GET /api/auth/google/login, /api/auth/facebook/login, etc.
          .get('/login', (context) => controller.socialLoginRedirect(context))

          // Matches GET /api/auth/google/callback, /api/auth/facebook/callback, etc.
          .get('/callback', (context) => controller.socialCallback(context))
      )
  );
};
