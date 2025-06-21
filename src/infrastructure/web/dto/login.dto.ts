import { t } from 'elysia';

export const LoginBodyDTO = t.Object({
  // Credentials from the form
  email: t.String({
    format: 'email',
    error: 'Invalid email format.',
  }),
  password: t.String({
    minLength: 1, // Basic check to ensure password is not empty
    error: 'Password is required.',
  }),

  // Hidden OAuth 2.0 parameters from the form
  client_id: t.String(),
  redirect_uri: t.String(),
  response_type: t.Literal('code'), // This is always 'code' for this flow
  scope: t.Optional(t.String()),
  state: t.Optional(t.String()),
});
