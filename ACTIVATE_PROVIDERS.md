# Activate STATIC Providers

Complete one provider at a time. Stop after account creation if billing, identity verification, or a spending decision appears; the owner must review and approve it.

## Before each activation

1. Enable multi-factor authentication on the provider account.
2. Create a project or workspace named `STATIC Network`.
3. Add the lowest practical monthly spending cap and usage alert.
4. Create a scoped key for this website, not a personal all-purpose key.
5. Store the credential in Netlify environment variables.
6. Redeploy and verify `/provider-status`.

## What becomes live

| Provider | STATIC capability | Paid calls |
| --- | --- | --- |
| Supabase | Accounts and cloud records | Plan dependent |
| Google AI | Entity image generation | Confirmation required |
| OpenAI | S.A.G.E. reasoning and alternate images | Confirmation required |
| ElevenLabs | S.A.G.E. and Entity voice | Confirmation required |
| Runway | Entity video adapter | Locked pending owner approval |
| LiveKit | Secure room tokens | Plan dependent |
| Cloudflare R2 | Media storage | Upload only after user action |

The browser-speech S.A.G.E. voice, procedural hologram, Entity mock image renderer, local Entity DNA, feed, Channels, and Studio continue to work without these accounts.

