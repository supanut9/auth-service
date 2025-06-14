import { t } from 'elysia';

export const AuthorizeQueryDTO = t.Object({
  client_id: t.Required(t.String()),
  redirect_uri: t.Required(t.String()),
  response_type: t.Literal('code'),
  scope: t.Optional(t.String()),
  state: t.Optional(t.String()),
});
