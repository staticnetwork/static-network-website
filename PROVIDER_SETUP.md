# STATIC Provider Setup

STATIC runs safely without external providers. Local preview systems remain available until the owner activates real services.

## Security rules

- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` may enter the browser bundle.
- Every other credential belongs in Netlify environment variables or a local `.env.local`.
- Never paste a secret into source code, GitHub, a browser URL, or a support message.
- Provider status functions perform non-generation checks. Paid generation requires an explicit confirmation flag.
- Set provider spending limits and alerts before enabling generation.

## Activation order

1. Supabase: create a project at <https://supabase.com/dashboard>, run `supabase/schema.sql`, and copy the project URL and publishable key.
2. Google AI: create a key at <https://aistudio.google.com/apikey>. Entity image generation uses `gemini-3.1-flash-image`.
3. OpenAI: create a project key at <https://platform.openai.com/api-keys> and set project budgets at <https://platform.openai.com/settings/organization/limits>.
4. ElevenLabs: create a key at <https://elevenlabs.io/app/settings/api-keys>, select approved voices, and copy their voice IDs.
5. Runway: create an API key at <https://dev.runwayml.com/>. Video launch remains intentionally locked until spend and duration are approved.
6. LiveKit: create a project at <https://cloud.livekit.io/> and copy its WebSocket URL, API key, and API secret.
7. Cloudflare R2: create a bucket and scoped object read/write token at <https://dash.cloudflare.com/>. Use a dedicated bucket for STATIC media.

## Netlify

In Netlify, open **Project configuration > Environment variables**, add the names from `.env.example`, and redeploy. Do not mark server-only variables with a `VITE_` prefix.

Visit `/provider-status` after deployment. A green **Validated** state means the safe account check succeeded. It does not trigger a generation charge.

## Local validation

```bash
npm run providers:validate
```

To safely write one provider already loaded into the shell:

```bash
node scripts/activate-providers.mjs --provider=openai --write-local
```

The script reports variable names only and creates `.env.local` with owner-only permissions. `.env.local` must remain ignored by Git.

