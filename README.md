# SaaS RBAC Admin Starter

[![CI](https://github.com/hussainbangash/SaaS-RBAC-Admin-Starter/actions/workflows/ci.yml/badge.svg)](https://github.com/hussainbangash/SaaS-RBAC-Admin-Starter/actions/workflows/ci.yml)

A reusable Next.js SaaS template with credentials authentication, PostgreSQL,
Prisma, and server-side role-based access control.

Use it as a GitHub template when you want a project where auth, dashboard
routing, seeded users, and protected admin actions are already wired.

## Screenshots

| Login | Dashboard |
| --- | --- |
| ![Login page](public/screenshots/login.png) | ![Dashboard page](public/screenshots/dashboard.png) |

| Admin Users | Manager Reports |
| --- | --- |
| ![Admin users page](public/screenshots/admin-users.png) | ![Manager reports page](public/screenshots/manager-reports.png) |

| Unauthorized | Profile |
| --- | --- |
| ![Unauthorized page](public/screenshots/unauthorized.png) | ![Profile page](public/screenshots/profile.png) |

## Live Demo

Deployment pending. The intended demo credentials are:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@demo.com` | `password123` |
| Manager | `manager@demo.com` | `password123` |
| User | `user@demo.com` | `password123` |

## Stack

- Next.js 16 App Router
- React 19
- NextAuth v5 credentials provider
- Prisma 7 with PostgreSQL
- Tailwind CSS 4
- Zod validation

## What Is Included

- Login page with seeded demo accounts.
- JWT sessions with role data attached to the session.
- Admin, Manager, and User roles.
- Server-side route guards for protected pages.
- Admin-only user management.
- Login throttling for repeated credential attempts.
- Production env validation.
- Strong password policy for admin-created users.
- Admin/Manager reports page.
- Profile page for authenticated users.
- Prisma schema, migration, and seed data.
- RBAC documentation and template setup checklist.

## Quick Start

```bash
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Open `http://localhost:3000`.

Demo accounts after seeding:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@demo.com` | `password123` |
| Manager | `manager@demo.com` | `password123` |
| User | `user@demo.com` | `password123` |

## Environment

Required variables:

```text
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a local auth secret with:

```bash
npx auth secret
```

## Common Commands

```bash
npm run dev          # Start the local app
npm run build        # Production build
npm run lint         # ESLint
npm test             # RBAC unit tests
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run local migrations
npm run db:deploy    # Apply migrations in deploy environments
npm run seed         # Seed demo users and data
```

## RBAC Matrix

| Feature | Admin | Manager | User |
| --- | --- | --- | --- |
| View dashboard | Yes | Yes | Yes |
| Manage users | Yes | No | No |
| View reports | Yes | Yes | No |
| Edit own profile | Yes | Yes | Yes |
| Change roles | Yes | No | No |

The same matrix is rendered inside the dashboard so reviewers can inspect the
role model visually.

## RBAC Model

The core access map lives in `src/lib/permissions/access.ts`.

Authentication-aware guards live in `src/lib/permissions/roles.ts`:

- `requireUser()` redirects anonymous users to `/login`.
- `requireRole([...])` redirects authenticated users without the required role
  to `/unauthorized`.

Route access:

| Route | Roles |
| --- | --- |
| `/dashboard` | Admin, Manager, User |
| `/dashboard/users` | Admin |
| `/dashboard/reports` | Admin, Manager |
| `/dashboard/profile` | Admin, Manager, User |

See `docs/RBAC.md` for customization steps.

## Making This A GitHub Template

Push the repository to GitHub, then enable:

```text
Settings -> General -> Template repository
```

People copying the repo should create their own `.env`, run migrations, seed or
create users, and then build feature pages behind `requireUser()` or
`requireRole()`.

## Production Notes

This template includes production-oriented defaults: required env validation,
server-side route guards, login throttling, demo account UI hidden in production,
and a baseline password policy for admin-created users.

Before a real production launch, choose the pieces that depend on your product
and hosting environment:

- Replace the in-memory login throttle with Redis, Upstash, or another shared
  store if you deploy more than one server instance.
- Add password reset or invite-based onboarding.
- Decide whether credentials auth is enough or whether to add OAuth/SAML.
- Add email delivery for invites, resets, and account notifications.
- Add audit log search/export if your admins need traceability.
- Add E2E tests for login, logout, and role-restricted navigation.
