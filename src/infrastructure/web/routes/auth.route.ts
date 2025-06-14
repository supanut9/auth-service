import { Elysia } from 'elysia';
import { AuthController } from '../controllers/auth.controller';

export const authRoutes = (controller: AuthController) => {
  return new Elysia({ prefix: 'auth' })
    .post('login', (context) => controller.login(context))
    .get('google/callback', (context) => controller.googleCallback(context));
};
