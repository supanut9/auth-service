import { Elysia } from 'elysia';
import { WellKnownController } from '../controllers/well-known.controller';

export const wellKnownRoutes = (controller: WellKnownController) => {
  return new Elysia({ prefix: '.well-known' })
    .get('/openid-configuration', () => controller.getOpenIdConfiguration())
    .get('/jwks.json', () => controller.getJwks());
};
