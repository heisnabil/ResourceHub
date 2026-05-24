# ResourceHub

Secure inventory and workspace resource manager — employees request items, managers approve, admins manage stock and users.

**Live:** https://infipark.vercel.app

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)

## Roles

| Role | Login | Access |
|------|--------|--------|
| Employee | `/login` (Google or email) | View inventory, submit requests |
| Manager | `/login` (role set by admin) | Approve/reject requests, reports |
| Admin | `/admin/login` (email + password) | Inventory CRUD, user roles |

Admins must use **Admin login**, not Google. Only emails in `ADMIN_EMAILS` can be admins.

## Quick start

```bash
git clone https://github.com/heisnabil/infipark.git
cd infipark
npm install
```

Copy `.env.example` → `.env.local` and fill in Supabase keys, `ADMIN_EMAILS`, and admin bootstrap vars.

Run migrations in **Supabase SQL Editor** (in order):

1. `supabase/migrations/001_production_schema.sql`
2. `supabase/migrations/002_profiles_insert_policy.sql`
3. `supabase/migrations/003_security_hardening.sql`
4. `supabase/migrations/004_activity_rls.sql`

If `inventory` already exists, skip `001` and run `002`–`004` only.

Create admin (once):

```bash
npm run admin:create
```

Run locally:

```bash
npm run dev
```

- App: http://localhost:3000  
- Admin: http://localhost:3000/admin/login  

## Production (Vercel)

1. Import repo — root folder: `infipark`
2. Set env vars (same as `.env.local`, use production URL for `NEXT_PUBLIC_SITE_URL`)
3. Deploy, then run `npm run admin:create` against production Supabase
4. **Supabase → Authentication → URL Configuration**
   - Site URL: `https://infipark.vercel.app`
   - Redirect URLs: `https://infipark.vercel.app/auth/callback`
5. **Google OAuth** redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run admin:create` | Create/reset admin user + password |
| `npm run db:setup` | Open Supabase SQL editor helper |

## License

Private — adjust for your team.
