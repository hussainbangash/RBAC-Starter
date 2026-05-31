# Template Checklist

Use this checklist when turning a copied repository into a real SaaS app.

## Required Setup

- Copy `.env.example` to `.env`.
- Set `DATABASE_URL` to a PostgreSQL database.
- Set `AUTH_SECRET` to a long random value.
- Run `npm install`.
- Run `npx prisma generate`.
- Run `npx prisma migrate deploy` for an existing migration history, or
  `npx prisma migrate dev` while developing locally.
- Run `npm run seed` if you want the demo accounts.
- Run `npm run dev`.

## Before Production

- Replace demo users and passwords.
- Decide whether credentials auth is enough or whether to add OAuth/SAML.
- Add rate limiting to login and sensitive server actions.
- Add audit log views if your admins need traceability.
- Add tests for any new roles or protected routes.
- Rotate `AUTH_SECRET` and database credentials outside source control.

## GitHub Template Repo

After pushing to GitHub, open repository settings and enable:

```text
Settings -> General -> Template repository
```

Users can then click "Use this template", add their own `.env`, run migrations,
seed or create users, and start building feature pages behind the existing RBAC
guards.
