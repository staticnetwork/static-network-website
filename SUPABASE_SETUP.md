# STATIC Network Supabase Setup

STATIC runs in local creator mode until the public Supabase variables are
provided. Never place a service role key, secret key, database password, or JWT
secret in this frontend project.

## 1. Create The Project

1. Create a Supabase account at https://supabase.com.
2. Create a project named **STATIC Network**.
3. Keep the database password in a private password manager.

## 2. Add Client Environment Variables

From the project Connect dialog, copy the Project URL and publishable key.
Create a local `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Legacy projects may use:

```bash
VITE_SUPABASE_ANON_KEY=your_legacy_anon_key
```

Do not use `service_role`, `sb_secret`, the database password, or JWT secret.

Add the same public variables in Netlify:

1. Open the STATIC Network project in Netlify.
2. Go to **Project configuration > Environment variables**.
3. Add `VITE_SUPABASE_URL`.
4. Add `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`.
5. Trigger a new production deploy.

## 3. Create The Database

1. Open Supabase **SQL Editor**.
2. Review [`supabase/schema.sql`](supabase/schema.sql).
3. Run it once in the new project.
4. Confirm Row Level Security is enabled on every created table.
5. Confirm authenticated users can only write rows where `owner_id` is their
   own user ID.

The schema creates:

- `profiles`
- `entities`
- `channels`
- `signals`
- `media_assets`
- `worlds`
- `drops`
- `comments`

It also creates a profile row when a new Auth user is created.

## 4. Configure Authentication

1. Open **Authentication > Providers**.
2. Enable Email.
3. Keep password authentication enabled.
4. In **URL Configuration**, set the production Site URL to:
   `https://thestaticnetwork.com`
5. Add redirect URLs:
   - `https://thestaticnetwork.com/account`
   - `http://localhost:5173/account`

Email confirmation can remain enabled. Signup will then show a polished
confirmation state until the user confirms their email.

## 5. Create Storage Buckets

Create these public buckets:

- `avatars`
- `banners`
- `media`
- `thumbnails`

The included Storage policies require paths shaped like:

```text
<user-id>/<entity-id>/<generated-file-name>
```

Confirm the ownership policies from `schema.sql` exist under Storage policies.
Before a public launch, define file-size limits, allowed MIME types,
transcoding, moderation, retention, and abuse reporting.

## 6. Test Cross-Device Access

1. Deploy after setting the Netlify variables.
2. Open `https://thestaticnetwork.com/signup` on a computer.
3. Create an account and confirm the email if required.
4. Sign in and use **Import Local Entity To Account** from `/account`.
5. Open `https://thestaticnetwork.com/login` on the phone.
6. Sign in with the same account.
7. Confirm the account session and imported Entity automatically appear in the
   local device cache.

The current import migrates Entity, Channel, Signal, World, and Drop records.
New account/profile media can use the configured Storage bucket. Legacy
IndexedDB media remains on the original device until the media migration,
validation, and conflict-handling pass is enabled.

## Production Checklist

- RLS enabled and tested with two separate user accounts
- No private key in source, Netlify build output, or browser requests
- Storage ownership policies verified
- Email sender and templates branded
- Password reset and account deletion flows reviewed
- Media validation and moderation added
- Privacy notice and terms updated for account/cloud data

Official references:

- https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control
