# Subscription security deployment setup

The application fails closed when Turnstile or unsubscribe-token configuration is absent. Do not invent or commit real values.

## Required configuration

- `TURNSTILE_SITE_KEY`: public site key for a Turnstile widget restricted to the production hostname. This value is read at request time and rendered into the subscription form.
- `TURNSTILE_SECRET_KEY`: matching private Siteverify secret. Store it as a Worker secret.
- `UNSUBSCRIBE_TOKEN_SECRET`: independent high-entropy secret used to sign subscriber-specific unsubscribe links. Store it as a Worker secret and keep it stable; rotation invalidates links in previously sent mail.
- `RATE_LIMIT_SALT`: existing secret salt for IP and normalized-email limit keys.

Use Cloudflare's documented Turnstile test keys only in local/test environments. Production keys must be created in the Cloudflare dashboard with the production hostname allowlisted.

## Apply before deployment

1. Create the production Turnstile widget and restrict its allowed hostname.
2. Add `TURNSTILE_SECRET_KEY`, `UNSUBSCRIBE_TOKEN_SECRET`, and `RATE_LIMIT_SALT` with `wrangler secret put` (or the equivalent protected deployment-secret mechanism).
3. Add `TURNSTILE_SITE_KEY` as a Worker variable or secret. It is public, but it must still match the production widget.
4. Build with the deployment environment available, then run lint, typecheck, tests, and the Cloudflare build.
5. Deploy the Worker without changing D1. This change requires no database migration.
6. Verify a real Turnstile submission, a rejected/expired token, a signed unsubscribe confirmation, and a tampered token before resuming newsletter delivery.

## Deployment commands

- Cloudflare Git deployments run `npm run deploy:cloudflare`. This builds and deploys the Worker while preserving dashboard-managed variables and secrets; it does not apply D1 migrations.
- When a reviewed release includes a new D1 migration, apply it deliberately with `npm run deploy:cloudflare:full` instead of changing the automatic deployment command.

The legacy `/unsubscribe` URL remains an instruction page with an email contact. It no longer accepts an email address or changes subscription state. New individual newsletter deliveries contain a signed confirmation link; merely fetching that link does not unsubscribe anyone.
