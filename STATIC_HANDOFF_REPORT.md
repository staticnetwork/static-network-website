# STATIC Network Current-State Handoff Report

Generated: 2026-06-17  
Scope: factual handoff for Sage/ChatGPT and owner review  
Rule for this report: do not treat a placeholder, inactive route, mock UI, or unconfigured provider as complete.

## Verification Performed

- Read the current request attachment.
- Inspected the local project in `/Users/macbook/Documents/Codex/2026-06-12/hey-sage`.
- Inspected current route definitions in `src/App.jsx`.
- Inspected beta gate, auth, waitlist, S.A.G.E., Entity Generator, provider, activation, and Netlify function code.
- Checked the rendered public website at `https://thestaticnetwork.com/` in the in-app browser.
- Checked live provider status endpoints for ElevenLabs, Google AI, OpenAI, Supabase, Runway, talking avatar, and Cloudflare R2.
- Checked latest GitHub main commit through GitHub CLI.
- Checked latest Netlify deploy metadata through Netlify CLI read-only API.
- Ran local lint and production build with the bundled Node runtime.
- Ran local provider configuration validation.

Secrets note: `.env.local` contains real provider credentials. This report names which services are present but does not expose secret values. If any key was ever pasted into a visible chat, screenshot, terminal recording, or public log, rotate that key.

## Part 1 - Current Live Status

### What is live right now

`https://thestaticnetwork.com/` is live and serving a private beta gate, not the newer local S.A.G.E. arrival experience.

Rendered live root page facts:

- Title: `STATIC Network | Private Beta`
- Meta description: `Request private beta access to the future of AI entertainment.`
- Main visible copy includes:
  - `ACCESS//CONTROLLED · BUILD IN PROGRESS`
  - `The Home of AI Entertainment`
  - `Watch it. Hear it. Play it. Create it. Own it.`
  - `STATIC is currently in private beta.`
  - `Request Beta Access`
- Public links/buttons include:
  - `STATIC`
  - `Operator Login`
  - `Request Beta Access`
  - `Join The Private Beta`
  - `Contact`
  - `Terms`
  - `Privacy`

### What public visitors can currently see

Public visitors see the beta gate on most routes. They can also reach utility pages:

- `/login`
- `/signup`
- `/contact`
- `/terms`
- `/privacy`

They cannot publicly explore the full app routes without internal/beta access.

### Beta gate / request access

Beta gate is active.

The request access form exists and submits locally. Because live Supabase is not configured, the form does not save to a real cloud waitlist right now. It stores the request in the visitor browser local storage and tells them cloud intake activates later.

This is not a production waitlist.

### Are unfinished tools hidden from public users?

Mostly yes. Routes like `/discover`, `/provider-status`, and `/sage-identity` render the beta gate for public visitors.

Exception: `/login`, `/signup`, and `/contact` are public utility pages. `/login` is visible but cloud login is not functional because Supabase is not configured.

### Owner/dev-only areas

Owner-only route wrappers exist for:

- `/sage-identity`
- `/sage-lab`

The owner gate currently depends on local dev access or an authenticated user with role `owner`. Because Supabase is not configured on live, real owner login/role access is not active in production.

### Login/signup

Not production-functional right now.

Auth code exists and is wired for Supabase, but live Supabase status is configured false / validated false. `/login` visibly says cloud login activates after the owner connects the Supabase project.

### Waitlist/request access

Partial only.

- Local browser save works.
- Cloud intake does not work live because Supabase is not configured.
- This should not be described as a working production waitlist.

### Design direction

The current live site still feels like a beta-gated website/landing shell. It has a darker STATIC style and some broadcast language, but it is not yet reframed as an immersive arrival portal.

The newer S.A.G.E. landing/arrival work exists locally only and is not live.

### What should remain hidden immediately

- Old D-ID talking avatar test output.
- Old boxed/attached-looking S.A.G.E. video composition.
- `/sage-lab` until its action mismatch is fixed.
- Procedural Avatar Builder as a public-facing Entity creator.
- Any "Go Live" UI if it implies real streaming.
- Marketplace/payment/subscription claims that imply real commerce.
- Provider status and internal lab pages.
- Anything presenting local-preview SVG images as real AI-generated Entity output.

### Current visual issue

Rendered live pages still showed horizontal overflow at the tested browser viewport. Do not mark mobile/overflow cleanup as complete. The skip-to-content link exists and was visually hidden until focus on the tested route.

## Part 2 - Routes / Pages Audit

Public/gated status assumes current production beta mode with no authenticated user.

| Route | Purpose | Public status | Working status | Honest notes |
| --- | --- | --- | --- | --- |
| `/` | Main landing page | Beta gate public | Working beta shell | Live root is private beta gate, not full app or S.A.G.E. arrival. |
| `/feed` | Main feed | Gated | Partially working internally | Local/static feed system exists. Not a real backend social feed. |
| `/signals` | Signals feed mode | Gated | Partially working internally | Same local/static feed foundation. No real public network data. |
| `/channels` | Platform info page for Channels | Gated | Working static page internally | Informational/page shell, not live creator-owned channel network. |
| `/channel` | Current Entity channel | Gated | Partially working locally | Reads local current Entity/channel data. Not cloud-backed. |
| `/channels/:handle` | Dynamic Entity channel | Gated | Partially working locally | Route exists. Depends on local data; no public creator directory backend. |
| `/radio` | STATIC Radio page | Gated | Working static/app preview | UI preview, not real 24/7 AI station backend. |
| `/play` | STATIC PLAY page | Gated | Working static/app preview | Prompt/play concept UI, not real game generation. |
| `/live` | STATIC LIVE platform route | Gated | Working static page | Live concept page. No actual streaming infrastructure active. |
| `/originals` | Originals platform route | Gated | Working static page | Informational shell. No real catalog backend. |
| `/marketplace` | Marketplace preview | Gated | Working static/app preview | No payments, transactions, inventory, or ownership logic. |
| `/labs` | STATIC LABS platform route | Gated | Working static page | Conceptual page. No production API lab. |
| `/creators` | Creator directory | Gated | Static/demo only | Directory page shell. No real creator database. |
| `/studios` | Studio directory | Gated | Static/demo only | Directory page shell. No real studio database. |
| `/entities` | Entity hub | Gated | Partially working locally | Links into generator/manual tools. Should stay internal. |
| `/entities/create` | Manual Entity builder | Gated | Works locally | Demoted/beta quality. Procedural and primitive compared to North Star. |
| `/entities/generate` | Entity visual generator | Gated | Partially working locally | Local preview works. Real provider path requires configured provider and paid confirmation. |
| `/entities/profile` | Current Entity profile | Gated | Partially working locally | Uses local current Entity data. Not cloud/public profile system. |
| `/entities/avatar` | Avatar page | Gated | Low quality / local only | Procedural avatar system, not production-quality Entity visuals. |
| `/channel/customize` | Channel customization | Gated | Works locally | Local channel styling/data only. |
| `/login` | Account login | Public utility | UI works, auth blocked | Supabase missing live, so real cloud login/signup is not active. |
| `/signup` | Account signup | Public utility | UI works, auth blocked | Same Supabase blocker. |
| `/account` | Account page | Gated | Partial | Requires auth/current profile. No production auth live. |
| `/studio` | Studio preview | Gated | App-shell only | No real uploads/storage/publishing pipeline active. |
| `/static-plus` | Membership page | Gated | Static preview | No subscription/payment backend. |
| `/creator-pro` | Creator Pro page | Gated | Static preview | No subscription/payment backend. |
| `/discover` | Discovery page | Gated | Working static preview internally | Public sees beta gate. |
| `/waitlist` | Waitlist page | Gated | Local-only form if internal | Not a production cloud waitlist. |
| `/contact` | Contact page | Public utility | Partially working | Shows email. Contact form does not send; it prepares a message/status only. |
| `/terms` | Legal page | Public utility | Working static page | Needs legal review before public confidence. |
| `/privacy` | Legal page | Public utility | Working static page | Needs legal review before public confidence. |
| `/provider-status` | Provider status page | Gated | Working status UI internally | Public sees beta gate. Good. |
| `/sage` | S.A.G.E. page | Gated | Static/assistant page internally | Not a full agent. |
| `/sage-identity` | Owner S.A.G.E. identity workspace | Owner-only | Partially working locally | Upload/approve slots exist. Owner-only access not production-real without Supabase roles. |
| `/sage-lab` | Owner S.A.G.E. voice/video lab | Owner-only | Broken/mismatched for talking avatar | UI posts stale action names. Needs fix before use. |
| `/tour` | Requested/mentioned tour route | Not a route | Not implemented as route | There is a S.A.G.E. tour overlay flow, but `/tour` falls to 404/beta gate. |
| Any unknown path | 404 view inside app | Gated or NotFound | Hosting fallback works | Netlify redirect serves SPA; actual app route unknowns show NotFound when internal access exists. |

## Part 3 - Providers / API Status

Live status means Netlify production environment as checked from `https://thestaticnetwork.com/.netlify/functions/*`.

| Provider | Account created | Credentials exist locally | Local env set | Netlify env set / live validation | Actually used now | Powers now | Blocker | Owner action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Supabase | Unknown | No local values found | No | No / validated false | No | Nothing production-critical | Missing Supabase URL/key and likely schema/auth setup | Create/configure project, apply schema, set Netlify env, test login/signup. |
| Cloudflare R2 | Yes, based on created bucket and successful local upload | Yes | Yes | No / validated false live | Locally yes | Stores approved S.A.G.E. arrival video at public R2 URL | Netlify env not set | Add R2 env vars to Netlify only when ready. |
| ElevenLabs | Yes | Yes | Yes | Yes / validated true | Yes | S.A.G.E. voice generation/status | Entity voice ID missing locally | Keep SAGE voice; add Entity voice only when needed. |
| OpenAI API | Unknown | No | No | No / validated false | No | S.A.G.E. agent path and OpenAI image path are inactive | Missing key/billing/env | Decide if needed; add key only after budget policy. |
| Google AI / Gemini image | Yes or likely, because local key exists | Yes | Yes | No / validated false live | Locally yes | Local S.A.G.E. image candidates and possible Entity image provider path | Netlify env not set | Add to Netlify only when ready for live paid image calls. |
| Runway | No/unknown | No | No | No / validated false | No | No real video generation | Missing key/provider decision | Do not connect until video roadmap is chosen. |
| LiveKit | No/unknown | No | No | Not configured | No | `create-livekit-token` function scaffold only | Missing URL/key/secret and live architecture | Configure only after real live-avatar/live-stream plan. |
| D-ID | Yes/key exists locally | Yes | Yes | Talking-avatar live provider empty/unconfigured | No for production | Rejected test only | 512x512 crop, watermark/trial quality rejected | Do not use for public S.A.G.E. |
| Tavus | No/unknown | No | No | Not configured | No | Nothing | No key and no adapter validation | Evaluate only for phase 3/realtime avatar needs. |
| HeyGen | Yes, wallet funded locally | Yes | Yes | No / talking-avatar live configured false | Locally yes | Approved local S.A.G.E. v1 arrival MP4 generation | Netlify env not set; `/sage-lab` UI action mismatch | Keep local asset; fix adapter/UI before more paid tests. |
| OpenArt | Unknown | No API key in project | No | No | No direct integration | Manual external asset source only | Public/API access not confirmed | Use manual workflow and ask OpenArt support about API/private access. |
| Netlify | Yes | CLI authenticated locally | N/A | Site live | Yes | Hosting/functions/domain | Credits consumed by production deploys | Avoid deploys until owner review. |
| GitHub | Yes | GH CLI authenticated locally | N/A | Repo exists | Yes for publishing script | Source publication via API script | Local folder is not a git repo | Continue using publish script or convert to proper git clone. |

### Local provider validation

`node scripts/validate-providers.mjs` reported:

- Supabase: configured false
- Google AI: configured true
- OpenAI: configured false
- ElevenLabs: configured true, optional `ELEVENLABS_ENTITY_VOICE_ID` missing
- Runway: configured false
- LiveKit: configured false
- Cloudflare R2: configured true

The validator exits nonzero because some providers are missing. That is correct and should not be hidden.

### Live provider validation

Live production status endpoints reported:

- ElevenLabs: configured true, validated true, voice IDs configured true
- Google AI: configured false, validated false
- OpenAI: configured false, validated false
- Supabase: configured false, validated false
- Runway: configured false, validated false
- Talking avatar: configured false, validated false, generation supported false
- Cloudflare R2 upload: configured false, validated false

## Part 4 - Activation Workflows

### `npm run activate-providers`

This exact npm script does not exist in `package.json`.

There is a script file:

```bash
node scripts/activate-providers.mjs --provider=<supabase|google|openai|elevenlabs|runway|livekit|r2> --write-local
```

Honest behavior:

- Does not open provider pages.
- Does not ask interactive key questions.
- Does not validate against remote provider APIs.
- Reads provider variables already loaded into the shell environment.
- Writes `.env.local` only with `--write-local`.
- Does not set Netlify env.

### `npm run activate-elevenlabs`

Exact command:

```bash
npm run activate-elevenlabs
```

Behavior:

- Opens ElevenLabs API key page.
- Waits for owner confirmation.
- Asks for key only after confirmation.
- Hides pasted key input.
- Validates by calling ElevenLabs voices endpoint.
- Lists available voices.
- Requires approved S.A.G.E. voice ID.
- Saves local `.env.local`.
- Does not generate audio unless owner approves the paid test line.
- Offers Netlify import afterward; does not silently set Netlify without owner flow.

This workflow is mostly honest and useful.

### `npm run activate-image-provider`

Exact command:

```bash
npm run activate-image-provider
```

Behavior:

- Lets owner choose Google, OpenAI, or manual uploads only.
- Opens provider API key page for Google/OpenAI.
- Waits for confirmation.
- Asks for key only after confirmation.
- Validates by provider model endpoint.
- Saves local `.env.local`.
- Does not generate image unless owner approves a paid test image.
- Offers Netlify import afterward.

This workflow is mostly honest and useful.

### `npm run activate-talking-avatar`

Exact command:

```bash
npm run activate-talking-avatar
```

Behavior:

- Opens provider page for HeyGen, Tavus, or D-ID.
- Waits for owner confirmation.
- Asks for key only after confirmation.
- Validates the key.
- Saves local `.env.local`.
- Does not generate video.
- Offers Netlify import afterward.

Problem: the script copy is stale. It still describes the older HeyGen 1080p Cinematic Avatar plus Precision Lipsync flow, including the $7 motion cost. The successful approved v1 S.A.G.E. asset used the cheaper HeyGen native photo-avatar talking-video workflow. The script should be rewritten so it does not steer the owner back into the rejected/expensive path.

### `npm run activate-core-providers`

Exact command:

```bash
npm run activate-core-providers
```

Behavior:

- Guided sequence for ElevenLabs, image provider, and talking avatar provider.
- Each provider step asks whether to continue.
- Runs the specific activation scripts above.
- Does not generate content by itself unless the nested script asks and owner approves.

### `npm run activate-heygen-clipboard`

Exact command:

```bash
npm run activate-heygen-clipboard
```

Behavior:

- Reads HeyGen API key from macOS clipboard.
- Validates against HeyGen user endpoint.
- Saves HeyGen key locally.
- Does not generate video.

Risk: because it reads the clipboard directly, it should only be used when the owner has just copied the intended HeyGen API key.

### `npm run providers:validate`

Exact command:

```bash
npm run providers:validate
```

Behavior:

- Prints a no-generation provider configuration report.
- Does not print secrets.
- Does not validate all providers remotely.
- Does not include HeyGen/D-ID/Tavus in its current provider list.

### `npm run generate-sage-heygen`

Exact command:

```bash
npm run generate-sage-heygen
```

Behavior:

- Points to `scripts/generate-sage-heygen-talking-avatar.mjs`.
- If final local output already exists, exits without creating a new HeyGen job.
- If no output/job exists, requires `--confirm-paid` before submitting a paid HeyGen job.
- Uploads approved voice audio to R2 and creates/polls a HeyGen native talking-avatar video.

This is the safer current S.A.G.E. v1 generation route, but it is still a paid provider workflow.

### `npm run publish-sage-arrival`

Exact command:

```bash
npm run publish-sage-arrival
```

Behavior:

- Uploads the approved local S.A.G.E. arrival MP4 to R2.
- Does not generate provider media.
- Requires R2 credentials.

### Other important scripts

- `scripts/generate-sage-locked-voice.mjs`: generates paid ElevenLabs S.A.G.E. voice audio. It has pronunciation/length guards but does not ask an interactive confirmation inside the script. Only run after explicit owner approval.
- `scripts/generate-sage-heygen-motion.mjs`: old experimental $7 motion path. Should be archived or clearly marked retired.
- `scripts/generate-sage-heygen-lipsync.mjs`: old Precision Lipsync path. Previous job failed because HeyGen detected no speaking person. Should be archived or clearly marked retired.
- `scripts/create-sage-heygen-avatar.mjs`: creates/records HeyGen avatar ID. Paid or provider-dependent; use only deliberately.

## Part 5 - Files / Code Changes

This list focuses on meaningful project files, not every generated dependency or build artifact.

### A. Files created

- `STATIC_MASTER_CONTEXT.md`
- `SAGE_AGENTIC_ROADMAP.md`
- `SAGE_AI_OS_ROADMAP.md`
- `SAGE_ARRIVAL_EXPERIENCE.md`
- `SAGE_MEMORY_PLAN.md`
- `SAGE_PERSONA_FRAMEWORK.md`
- `PHASE_3_REALTIME_SAGE_PLAN.md`
- `ENTITY_VISUAL_PIPELINE.md`
- `ENTITY_TRANSFORMATION_PIPELINE.md`
- `ENTITY_RECORDING_LIVE_PIPELINE.md`
- `NETLIFY_CREDIT_POLICY.md`
- `PROVIDER_SETUP.md`
- `ACTIVATE_PROVIDERS.md`
- `supabase/schema.sql`
- `public/assets/sage/README.md`
- `public/assets/sage/official-sage-foundation.jpg`
- `public/assets/static-hero.png`
- `public/media/static-hero-fallback.png`
- `public/_redirects`

### B. Files modified

- `package.json`
- `netlify.toml`
- `index.html`
- `src/App.jsx`
- `src/main.jsx`
- `src/styles.css`
- `src/upgrade.css`
- `src/sage.css`
- `src/entity.css`
- `src/network-os.css`
- `src/beta-gate.css`
- `src/components/SiteChrome.jsx`
- `src/components/Forms.jsx`
- `src/components/Router.jsx`
- `src/components/UI.jsx`
- `src/pages/HomePage.jsx`
- `src/pages/BetaGatePage.jsx`
- `src/pages/PlatformPages.jsx`
- `src/pages/NetworkOSPages.jsx`
- `src/pages/EntityPages.jsx`
- `src/pages/EntityGeneratorPage.jsx`
- `src/pages/SagePage.jsx`
- `src/pages/SageOwnerPages.jsx`
- `src/pages/ProviderStatusPage.jsx`
- `src/context/AuthContext.jsx`
- `src/context/SageContext.jsx`
- `src/lib/betaAccess.js`
- `src/lib/betaRequests.js`
- `src/lib/sageIdentity.js`
- `src/lib/sagePersona.js`
- `src/lib/staticStore.js`
- `src/lib/supabaseClient.js`

### C. Docs created or meaningfully expanded

- `STATIC_MASTER_CONTEXT.md`
- `SAGE_ARRIVAL_EXPERIENCE.md`
- `PHASE_3_REALTIME_SAGE_PLAN.md`
- `ENTITY_VISUAL_PIPELINE.md`
- `ENTITY_TRANSFORMATION_PIPELINE.md`
- `ENTITY_RECORDING_LIVE_PIPELINE.md`
- `NETLIFY_CREDIT_POLICY.md`
- `PROVIDER_SETUP.md`
- `ACTIVATE_PROVIDERS.md`

Some docs are stale relative to the latest owner direction and should be revised before they are used as operating instructions.

### D. Scripts created

- `scripts/activate-elevenlabs.mjs`
- `scripts/activate-image-provider.mjs`
- `scripts/activate-talking-avatar.mjs`
- `scripts/activate-core-providers.mjs`
- `scripts/activate-providers.mjs`
- `scripts/validate-providers.mjs`
- `scripts/import-heygen-key-from-clipboard.mjs`
- `scripts/generate-sage-locked-voice.mjs`
- `scripts/create-sage-heygen-avatar.mjs`
- `scripts/generate-sage-heygen-motion.mjs`
- `scripts/generate-sage-heygen-lipsync.mjs`
- `scripts/generate-sage-heygen-talking-avatar.mjs`
- `scripts/generate-sage-heygen.mjs`
- `scripts/publish-approved-sage-arrival.mjs`
- `scripts/provider-activation-utils.mjs`

### E. Serverless functions created

- `netlify/functions/_provider-utils.js`
- `netlify/functions/_elevenlabs-voice.js`
- `netlify/functions/create-livekit-token.js`
- `netlify/functions/generate-entity-image.js`
- `netlify/functions/generate-entity-video.js`
- `netlify/functions/generate-entity-voice.js`
- `netlify/functions/generate-sage-voice.js`
- `netlify/functions/generate-talking-avatar.js`
- `netlify/functions/sage-agent.js`
- `netlify/functions/test-elevenlabs.js`
- `netlify/functions/test-google-ai.js`
- `netlify/functions/test-openai.js`
- `netlify/functions/test-runway.js`
- `netlify/functions/test-supabase.js`
- `netlify/functions/test-talking-avatar.js`
- `netlify/functions/upload-media.js`

### F. New folders / asset structures

- `src/components/sage/`
- `src/components/sage3d/`
- `src/components/entityGenerator/`
- `src/components/entityEngine/`
- `src/lib/ai/sage/`
- `src/lib/ai/sageVoice/`
- `src/lib/ai/entityImage/`
- `src/lib/entityEngine/`
- `src/lib/storage/`
- `src/providers/`
- `public/assets/sage/`
- `activation-output/` local/generated/ignored
- `dist/` build output/ignored
- `work/` local publish and CLI tooling/ignored

## Part 6 - Deployment Status

### Latest GitHub commit

Repository checked: `staticnetwork/static-network-website`

Latest main commit:

- SHA: `9168a733ca8a2857b89cd99fbb19a9b144b50b91`
- Message: `Gate private beta and add S.A.G.E. activation workflows`
- Files in that commit:
  - `STATIC_MASTER_CONTEXT.md`
  - `public/assets/sage/README.md`
  - `public/assets/sage/official-sage-foundation.jpg`
  - `scripts/provider-activation-utils.mjs`
  - `src/components/sage/SageAssistantPanel.jsx`
  - `src/components/sage/SagePersistentLauncher.jsx`
  - `src/lib/sageIdentity.js`
  - `src/sage.css`

Local folder status:

- The local workspace is not a git repository.
- `git status --short` returns `fatal: not a git repository`.
- Publishing has been handled by `work/publish-github.mjs`, not ordinary local git commits.

### Latest Netlify deploy

Latest production deploy:

- ID: `6a2dd91c8a01260396e34ee6`
- State: `ready`
- Title: `Fix S.A.G.E. spoken pronunciation`
- Published: `2026-06-13T22:26:45.975Z`
- URL: `https://thestaticnetwork.com`
- Deploy URL: `https://6a2dd91c8a01260396e34ee6--thestaticnetwork.netlify.app`
- Context: `production`
- Deploy time: `9` seconds

No deploy was performed for this handoff report.

Important: the approved local S.A.G.E. v1 arrival video integration is not live.

### Build and lint

Fresh local checks:

- Lint: passed with no output using bundled Node runtime.
- Build: passed.

Build output:

- `dist/index.html` 1.66 kB
- CSS asset `index-BrBu7WHq.css` 217.75 kB
- JS asset `index-DrPPhbKf.js` 424.09 kB
- React chunk 11.21 kB
- Supabase chunk 208.40 kB
- Build time about 5.16s in this pass.

### Console errors

The live browser check captured no console errors on the inspected public routes.

This is not a full route QA pass.

### Mobile overflow

Rendered live pages showed horizontal overflow at the tested browser viewport. This must not be marked fixed.

### 404s / crashes

- Netlify redirects are configured, so direct SPA routes should serve `index.html`.
- Unknown app routes route to `NotFoundPage` when internal access exists.
- `/tour` is not a real route.
- A full local route smoke test was not completed in this handoff pass. Build success proves modules compile, not that every route behavior is correct.

## Part 7 - What Actually Works Right Now

Only items in this section were verified by code, live endpoint, build, or known generated artifact state.

- Public beta gate works.
- Public utility pages `/login`, `/signup`, `/contact`, `/terms`, `/privacy` are reachable.
- Public most-app routes are gated behind beta gate.
- Beta request form saves locally in the browser.
- Contact page shows `thestaticnetwork.com@gmail.com`.
- Netlify production site is live and latest deploy is ready.
- GitHub repo exists and latest commit was readable.
- Local production build passes.
- Local lint passes.
- Netlify SPA fallback exists through both `netlify.toml` and `public/_redirects`.
- Live ElevenLabs endpoint validates successfully.
- Local ElevenLabs environment is configured.
- Local Google AI environment is configured.
- Local Cloudflare R2 environment is configured.
- Local approved S.A.G.E. foundation image exists as project asset.
- Local approved S.A.G.E. arrival MP4 exists in `activation-output/sage-heygen-arrival-final.mp4`.
- Approved S.A.G.E. arrival MP4 has an R2 public URL.
- S.A.G.E. identity code references the approved full body/idle still and arrival video.
- S.A.G.E. assistant panel exists and can navigate/guide through known routes internally.
- S.A.G.E. local/mock text responses work.
- S.A.G.E. ElevenLabs speech path exists and can call `generate-sage-voice` when connected and permitted.
- Entity Generator route exists.
- Entity Generator local preview creates three local SVG concept renders without provider spend.
- Entity Generator can save generated/local result as profile identity, banner, or output-type official image in local storage.
- Mr Stone Genesis preset exists.
- Manual Entity builder works locally.
- Local feed/channel/profile data flows exist through browser storage/IndexedDB.
- Uploads to local browser storage for media can work.
- R2 upload worked locally for the approved S.A.G.E. video.

## Part 8 - What Does Not Work / Is Low Quality

### Broken or mismatched

- `/sage-lab` talking-avatar UI is currently mismatched with the server function.
  - UI sends `action: 'create'` and status `action: 'status'`.
  - Current function expects `create-talking-video` and `video-status`.
  - Result: the S.A.G.E. Lab talking-video button should be considered broken until fixed.
- `activate-talking-avatar.mjs` still describes the older rejected/expensive HeyGen workflow.
- Some docs still refer to old provider paths and should not be treated as current operating truth.
- `/tour` is not a route.

### Fake, inactive, or scaffold-only

- Supabase auth is not live.
- Cloud sync is not live.
- Real public waitlist is not live.
- Payments/subscriptions are not live.
- Marketplace transactions are not live.
- Upload/storage backend is not live on Netlify.
- Live streaming is not live.
- Runway video generation is not live.
- OpenAI S.A.G.E. agent is not live.
- Google/OpenAI image generation is not live on Netlify.
- HeyGen talking-avatar generation is not live on Netlify.
- OpenArt is not integrated as a provider.
- LiveKit is scaffold only.
- 3D avatar/world systems are scaffold/stand-in only.

### Low quality or should stay hidden

- Avatar Builder quality is too primitive for the new immersive-universe North Star.
- Entity Generator local SVG preview is useful for flow testing but visually not acceptable as official output.
- Current 3D Entity viewport is procedural/capsule-style stand-in, not production avatar.
- Old D-ID output is unacceptable for S.A.G.E.
- Older boxed S.A.G.E. video composition looked attached/pasted and should not be shipped.
- Current live beta shell is useful as a holding pattern but not the final immersive portal.

### S.A.G.E. quality status

- Visual: approved v1 asset exists locally, but it is not final-quality and not live.
- Voice: ElevenLabs voice is connected and owner-approved for v1. The owner liked it.
- Pronunciation: final locked script uses "I'm Sage" instead of spelling S.A.G.E.
- Lip-sync/talking: successful HeyGen native talking video exists locally/R2. It is v1 only. Movement was slow/under-animated but owner accepted it for v1.
- Browser voice fallback: module exists, but active speech provider does not fall back to browser TTS. If ElevenLabs fails, S.A.G.E. goes silent.

### Overall design versus North Star

STATIC is not close yet to the immersive universe direction. It is a beta-gated website plus local prototypes. The current work is a foundation, not the destination.

## Part 9 - S.A.G.E. Status

### Current visual status

Approved local S.A.G.E. assets:

- Foundation image: `public/assets/sage/official-sage-foundation.jpg`
- Arrival MP4 local file: `activation-output/sage-heygen-arrival-final.mp4`
- Arrival MP4 public R2 URL is recorded in `src/lib/sageIdentity.js`.

The approved v1 arrival video:

- Provider: HeyGen native photo/avatar video route.
- Duration: about 11.9564 seconds.
- Generation cost recorded: `$0.55`.
- Playback cost: `$0`.
- Owner accepted it as v1 even though movement was slower and less expressive than desired.

It is not live on the public site.

### Bad old visual

- D-ID test is rejected and should stay hidden.
- Old boxed/attached composition is rejected.
- The latest seamless local composition was accepted for local v1 direction but not deployed.

### Official S.A.G.E. slots

Code defines slots for:

- Portrait
- Full body
- Welcome pose
- Pointing pose
- Assistant panel image
- Launcher image
- Idle still
- Tour still
- Talking video
- Tour video
- Arrival performance
- Idle pacing loop
- Corner collapse
- Corner summon

Only some are filled by approved default assets. Most slots are available but not fully populated with reviewed final assets.

### `/sage-identity`

Exists and is owner-only. It can store official S.A.G.E. identity assets in local identity state and upload public media if the upload function is configured.

Live production cannot use it properly because owner auth and R2 upload env are not configured.

### `/sage-lab`

Exists and is owner-only, but talking-avatar generation is currently broken due to action name mismatch with `generate-talking-avatar.js`.

Do not use it for paid generation until fixed.

### OpenArt assets for S.A.G.E.

The system can accept manually uploaded image/video assets into S.A.G.E. identity slots. There is no OpenArt-specific API integration. OpenArt output should be treated as manually downloaded and uploaded asset files.

### ElevenLabs status

ElevenLabs is connected locally and live. Voice IDs are configured live for S.A.G.E. Active label in local env is a private label. Do not expose the voice ID.

### Active voice

The approved voice is a female/premium-sounding ElevenLabs voice based on owner review. The user liked the voice after the pronunciation fix.

### Can S.A.G.E. speak?

Yes, when ElevenLabs is available and the app path requests speech through `generate-sage-voice`.

No, if ElevenLabs is unavailable. The current active voice provider returns false and does not use browser TTS fallback.

### Mouth movement / lip-sync

Yes for the approved local/R2 MP4 clip only. No realtime mouth movement exists in the app.

There is no live, interactive, always-speaking S.A.G.E. avatar with realtime lip sync.

### Talking-avatar provider

Local HeyGen credentials and avatar ID exist. Netlify live talking-avatar provider is not configured.

### Tour

S.A.G.E. tour overlay flow exists. `/tour` route does not exist.

### Can S.A.G.E. guide/navigate?

Partially. S.A.G.E. assistant can parse some commands and navigate to known internal routes. It can prepare local drafts. It is not a full autonomous AI agent unless OpenAI/S.A.G.E. agent provider is configured.

### What S.A.G.E. needs next

1. Fix `/sage-lab` action mismatch.
2. Update stale activation docs/scripts to the approved native HeyGen v1 route.
3. Decide whether S.A.G.E. v1 arrival is public enough after owner visual review.
4. If yes, publish only after owner approves live deployment.
5. Add proper fallback behavior: if ElevenLabs is unavailable, either stay intentionally muted or use browser TTS with clear owner approval.
6. Replace video-only S.A.G.E. with a proper interactive avatar plan: idle loop, summon/collapse, text/voice states, and later realtime lip sync.
7. Move owner-only controls behind working auth.

## Part 10 - Entity Generator / Mr Stone Status

### `/entities/generate`

Exists.

It should be treated as primary over the old manual builder, but the product still links to the old builder as "Manual Builder/Beta."

### Old avatar builder

Demoted conceptually but still present internally. It is too primitive for public use.

### Does Entity Generator actually generate outputs?

Yes in local preview mode, but these are non-AI SVG concept renders. The UI is functional but the output quality is not acceptable for official brand or flagship Entities.

Real provider generation path exists for:

- Google AI
- OpenAI

Those paths require:

- Provider endpoint validation
- Paid confirmation checkbox
- Serverless provider env configured

Locally Google AI is configured. Live Google AI is not configured.

### OpenArt manual workflow

Supported indirectly:

- Generate assets in OpenArt manually.
- Download files.
- Upload them into Entity Generator as references or logo/decal files.
- Save selected outputs or references into local Entity DNA/media storage.

There is no direct OpenArt provider, status endpoint, or API call.

### Official image slots requested vs current system

Requested slots:

- Profile portrait
- Full body
- Banner
- Feed pose
- Wave pose
- Live host pose
- Talking reference
- World/game concept
- Character sheet

Current system:

- Explicit output options: `portrait`, `full body`, `channel banner`, `cinematic scene`, `turnaround sheet`.
- Save buttons: profile identity, channel banner, or current output type.
- Official image records can store arbitrary target/output types, but not all requested slots are first-class product concepts.

Status by slot:

| Slot | Current support |
| --- | --- |
| Profile portrait | Supported via `Make Profile Identity`. |
| Full body | Output type exists; save as official image possible. |
| Banner | Supported via `Make Channel Banner`. |
| Feed pose | Not first-class. Could be saved as arbitrary official image only. |
| Wave pose | Not first-class. |
| Live host pose | Not first-class. |
| Talking reference | Not first-class. |
| World/game concept | Approximate via `cinematic scene`, not first-class. |
| Character sheet | Approximate via `turnaround sheet`, not full production sheet pipeline. |

### Asset propagation

Works locally for:

- Profile image reference
- Channel banner reference
- Channel profile image reference

Partial/not complete for:

- Feed
- Studio
- Signals
- Live
- Marketplace
- Official pose library

### Mr Stone Genesis preset

Exists in `src/lib/entityEngine/entityDefaults.js`.

It includes:

- Name/handle/role.
- Founder/CEO positioning.
- Black American identity/context.
- Luxury executive wardrobe.
- Jewelry/watch/pendant/logo usage.
- A non-operational gold 1911 display prop marked visual-prop-only.

Safety note: the weapon prop should stay non-operational, holstered/display-only, or be omitted until brand/legal policy is clear.

### Can Mr Stone be rebuilt using OpenArt assets?

Yes manually. Generate in OpenArt, download, upload references/assets into Entity Generator, then save official local assets.

No direct OpenArt API or automatic consistent-character import exists.

### What Mr Stone needs next

1. Generate a controlled OpenArt asset pack.
2. Pick one official face and body direction.
3. Save profile, full body, banner, feed pose, wave pose, live host pose, talking reference, world/game concept, and character sheet.
4. Build first-class slot fields for those assets in Entity DNA.
5. Wire saved assets consistently into profile, channel, feed, Studio, Signals, and future live surfaces.
6. Remove or hide old manual/procedural avatar visuals from any public path.

## Part 11 - OpenArt Integration Strategy

### Current OpenArt status

- OpenArt has not been added to provider config.
- OpenArt has no status endpoint.
- OpenArt has no environment variables in this project.
- OpenArt public API access is not confirmed.
- OpenArt is currently manual/external workflow only.

Do not claim OpenArt is integrated.

### Manual workflow

For S.A.G.E.:

1. Generate assets in OpenArt externally.
2. Download approved files.
3. Upload each file through `/sage-identity` to the correct S.A.G.E. slot.
4. Review in app.
5. Approve only the assets that match brand.

For Mr Stone:

1. Generate consistent-character outputs in OpenArt.
2. Download selected files.
3. Upload as references in `/entities/generate`.
4. Save official outputs to profile/banner/output slots.
5. Record notes in Entity DNA consistency fields.

### What to ask OpenArt support

- Do they offer a public API for image generation?
- Do they offer consistent-character or character-model API access?
- Can users upload reference images through API?
- Can the API return commercial-use outputs and metadata?
- Are there webhooks for generation completion?
- Are there enterprise/private API plans?
- What are the rate limits, costs, content restrictions, and rights terms?
- Can generated assets be used in games, live avatars, commercial branding, and resale marketplace contexts?

### S.A.G.E. OpenArt prompt set

Primary prompt:

```text
Premium futuristic holographic woman AI concierge named Sage, elegant British executive presence, refined K-pop idol warrior energy, polished high-fashion business suit, cinematic cyber-luxury design, intelligent calm expression, graceful posture, silver black charcoal icy-cyan and subtle violet holographic lighting, standing on a mechanical hologram emitter platform, luxury AI operating system aesthetic, full-body, ultra-detailed, cinematic, professional, powerful, warm, iconic, brand-ownable, not cartoonish, not childish, not sexualized, not generic robot, no text, no watermark.
```

Negative prompt:

```text
cheap mascot, cartoon blob, old computer assistant, low-poly, toy figure, goofy robot, childish, overly sexualized, messy armor, copied character, exact celebrity likeness, bad hands, distorted face, blurry, flat icon, generic sci-fi android, text, watermark, logo artifacts, extra fingers, extra limbs.
```

S.A.G.E. shot variants:

- Full body standing on hologram platform, 16:9 environment.
- Full body transparent/cutout if available.
- Portrait, calm eye contact.
- Welcome pose, open hand gesture.
- Pointing pose toward lower-right corner.
- Assistant panel crop.
- Launcher/bubble crop.
- Idle standing still.
- Tour guide pose.
- Speaking/talking reference frame with neutral mouth.
- Character sheet/turnaround.
- 16:9 empty portal background plate without S.A.G.E.

### Mr Stone OpenArt prompt set

Primary prompt:

```text
Mr Stone, Black American male founder and CEO, late 30s to early 40s, tall powerful tailored build, deep warm brown skin, close-cut black hair with immaculate line, strong jaw, calm authority, premium editorial realism, perfect black double-breasted suit over black silk shirt, diamond founder jewelry, custom Above All AI pendant, platinum architectural watch, future executive broadcast chamber overlooking a near-future city, obsidian black gunmetal white icy-cyan palette, cinematic luxury campaign lighting, serious calm confident expression, full-body, ultra-photoreal, high-end, brand-ownable, no text, no watermark.
```

Optional prop-safe variant:

```text
Same character and setting, include a non-operational gold 1911 display piece only as a luxury film prop, safely holstered or locked in a glass display case, not held, not aimed, no action pose, no violence.
```

Negative prompt:

```text
weapon aimed, firing weapon, violence, gang imagery, cheap costume, caricature, copied celebrity likeness, distorted hands, extra fingers, blurry, text, watermark, logo artifacts, plastic skin, cartoon, low-res, exaggerated muscles.
```

Mr Stone asset checklist:

- Profile portrait.
- Full body.
- Channel banner.
- Feed pose.
- Wave pose.
- Live host pose.
- Talking reference image.
- World/game concept image.
- Character sheet/turnaround.
- Jewelry/accessory closeups.
- Logo placement references.
- Safe prop reference only if still wanted.

## Part 12 - Immersive Universe Readiness

### How close STATIC is to the North Star

Not close yet.

Current STATIC is a beta-gated website plus a growing local prototype layer. It has important concepts and route scaffolding, but it is not an immersive AI-native universe yet.

### What moves toward the vision

- Beta gate protects weak/incomplete systems.
- S.A.G.E. has a first owner-approved v1 visual/voice direction.
- Entity DNA data structure exists.
- Mr Stone Genesis preset exists.
- Local Entity profile/channel/feed flows exist.
- R2 media storage is proven locally.
- Provider activation guardrails exist.
- App routes cover the intended network map.
- Three.js dependency and prototype components exist for future 3D.

### What is too primitive and should be denied/demoted

- Manual Avatar Builder.
- Local SVG Entity previews as official visuals.
- Procedural 3D capsule/avatar stand-ins.
- Simulated "Go Live" as if it were real live.
- Marketplace without real commerce.
- Static app-shell pages if presented as finished systems.
- D-ID test output.
- Any public claims of OpenArt integration before provider/API is real.

### Design changes needed

- Root experience should feel like arrival into a world, not a normal website.
- S.A.G.E. should be integrated into the environment, not pasted as a separate video card.
- Navigation should feel like a network operating system.
- Public beta gate should avoid exposing unfinished low-quality systems.
- Entity visuals need consistent high-end image/video direction before public exploration.
- Mobile layout must remove horizontal overflow.
- Motion should be deliberate and high-end, with reduced-motion support.

### Technical layers needed

- S.A.G.E.: visual identity, voice, memory, command routing, realtime mode, fallback states.
- Entity identity: stable DNA, official slots, asset governance, ownership, profile/channel propagation.
- 2D assets: consistent-character image generation/import, slot library, R2 storage.
- Talking avatars: provider adapter, cost guard, approved v1/v2 pipeline, webhooks, status UI.
- 3D avatars: real GLB/VRM pipeline, rigging, animation clips, LOD/performance.
- Worlds: world records, scene templates, asset storage, editor.
- WebXR: optional later layer, not now.
- Live avatar mode: LiveKit or alternative, realtime voice/video/avatar sync.
- AI-generated spaces: provider plan, asset queue, moderation.
- Storage: Supabase/R2 split, signed uploads, public/private policy.
- Realtime: auth, presence, channels, live rooms.
- Memory: user/account memory, S.A.G.E. memory, project memory, privacy rules.
- Creator economy: payments, subscriptions, marketplace, licensing, moderation.

### Next 3 build phases

Phase 1: Stabilize the hidden foundation.

- Fix `/sage-lab`.
- Configure Supabase and R2 on Netlify.
- Add real owner auth.
- Remove horizontal overflow.
- Hide/demote primitive visuals.
- Add production waitlist storage.
- Keep beta gate.

Phase 2: Make S.A.G.E. and Mr Stone visually credible.

- Generate OpenArt/Sage/Mr Stone official asset packs.
- Approve slots.
- Wire first-class official slots across profile/channel/feed/studio.
- Ship S.A.G.E. v1 arrival only after owner review.
- Replace local SVG previews with imported high-quality assets or real provider outputs.

Phase 3: Build the first immersive loop.

- Entity enters a channel/world.
- S.A.G.E. guides route/app actions.
- Entity has official image/video/talking reference.
- Basic live/avatar or recorded-host mode works.
- R2 stores media.
- Supabase stores accounts/entities/channels.
- Nothing implies full metaverse until actual world/avatar/live layers work.

## Part 13 - Owner Actions Required

Ordered next actions:

1. Do not deploy until owner reviews the current local S.A.G.E. integration.
2. Decide whether the v1 S.A.G.E. arrival video is good enough to go live as a temporary beta experience.
3. Approve or reject the current S.A.G.E. v1 MP4 after viewing it in the integrated page, not as a raw video file.
4. Create/configure Supabase project.
5. Apply `supabase/schema.sql`.
6. Add Supabase env vars locally and to Netlify.
7. Test `/login`, `/signup`, and beta request cloud save.
8. Add R2 env vars to Netlify only after deciding production upload policy.
9. Keep ElevenLabs active; do not generate more voice unless script is approved.
10. Decide whether Google AI should be enabled live or remain local-only.
11. Do not add OpenAI until there is a specific S.A.G.E. agent need and budget approval.
12. Do not spend more on HeyGen until `/sage-lab` is fixed and the exact script/shot is approved.
13. Generate OpenArt S.A.G.E. assets using the checklist above.
14. Approve one S.A.G.E. visual direction and fill official slots.
15. Generate OpenArt Mr Stone assets using the checklist above.
16. Approve one Mr Stone face/body/wardrobe direction.
17. Remove or hide primitive Avatar Builder from public-facing flows.
18. Decide whether the gold 1911 prop belongs in Mr Stone's public canon; safest route is to omit from first public visuals.
19. Set a Netlify deploy budget policy because production deploys consume credits.
20. Rotate any API keys that were ever exposed outside trusted local env files.

## Part 14 - Short Executive Summary

Truly done:

- STATIC has a live beta-gated public site.
- Core route map exists.
- Public unfinished routes are mostly hidden.
- Local S.A.G.E. v1 image/voice/video assets exist.
- ElevenLabs is live-configured.
- Local Google AI and R2 are configured.
- Entity Generator and Mr Stone preset exist.
- Build and lint pass.

Not done:

- Real public app.
- Real auth.
- Real waitlist/cloud intake.
- Real marketplace/payments.
- Real live streaming.
- Real OpenArt integration.
- Real 3D/avatar world system.
- Live S.A.G.E. arrival deployment.
- Production Entity generation pipeline.

Overstated before:

- "Provider setup" is not complete. Only ElevenLabs is live-configured.
- "Waitlist" is not a real cloud waitlist live.
- "Talking avatar" is not live-configured and `/sage-lab` is broken.
- "OpenArt" is not integrated.
- "Entity Generator" is not production-quality; local mode is SVG preview.
- "Immersive universe" is a direction, not the current product.

Embarrassing and should remain hidden:

- D-ID video.
- Old pasted/boxed S.A.G.E. video layout.
- Manual Avatar Builder as public creator tool.
- Local SVG Entity previews as official output.
- Simulated live features.
- Unconfigured provider pages.

Next smartest move:

Keep beta gate live, fix internal broken pieces, configure real Supabase/R2 on Netlify, generate and approve official OpenArt asset packs for S.A.G.E. and Mr Stone, then ship only the reviewed S.A.G.E. v1 portal experience after owner review.

## CHATGPT HANDOFF REPORT

STATIC Network is currently a live private-beta website at `https://thestaticnetwork.com/`, not a finished public app and not yet an immersive universe. Public visitors mostly see a beta gate with request-access copy. Most app routes are gated. `/login`, `/signup`, `/contact`, `/terms`, and `/privacy` are public utility pages. Login/signup are not production-functional because Supabase is not configured live. The request-access form saves locally in the visitor browser; it is not a real cloud waitlist yet.

Latest GitHub main commit is `9168a733ca8a2857b89cd99fbb19a9b144b50b91` with message `Gate private beta and add S.A.G.E. activation workflows`. Latest Netlify production deploy is `6a2dd91c8a01260396e34ee6`, state `ready`, title `Fix S.A.G.E. spoken pronunciation`, published `2026-06-13T22:26:45.975Z`. No deploy was performed for this report. Local build and lint pass. Live browser inspection found no console errors on tested pages but did find horizontal overflow, so mobile/overflow should not be marked fixed.

Provider status: ElevenLabs is configured and validated live. Google AI, OpenAI, Supabase, Runway, talking avatar, and Cloudflare R2 are not configured live. Locally, Google AI, ElevenLabs, R2, D-ID, and HeyGen credentials exist in `.env.local`; values must not be exposed. Supabase, OpenAI, Runway, and LiveKit are not locally configured. R2 worked locally for S.A.G.E. video upload, but live Netlify upload is not configured. OpenArt is not integrated; no public API access is confirmed. Treat OpenArt as manual external asset creation only until support/API access is confirmed.

S.A.G.E. status: approved v1 local assets exist: foundation image in `public/assets/sage/official-sage-foundation.jpg` and arrival video in `activation-output/sage-heygen-arrival-final.mp4`, also uploaded to R2. The video is about 11.96 seconds and recorded as a $0.55 HeyGen native photo-avatar talking-video output. Owner accepted it for v1 despite slow/limited movement. It is not live. The bad D-ID test and old boxed/pasted video composition should stay hidden. S.A.G.E. can partially guide/navigate internally and can speak through ElevenLabs when connected, but there is no realtime interactive avatar. Browser TTS fallback exists as a module but is not used by the active speech provider. `/sage-lab` is currently broken because its UI sends stale action names while the Netlify function expects newer HeyGen action names.

Entity/Mr Stone status: `/entities/generate` exists and should be treated as the preferred internal generator over `/entities/create`, but it is not production-quality. Local preview mode produces SVG concept renders, not real AI output. Google/OpenAI provider paths exist but require configured env and paid confirmation; live providers are not configured. Official image storage supports profile identity, channel banner, and arbitrary output-type images, but requested slots like feed pose, wave pose, live host pose, talking reference, world/game concept, and character sheet are not all first-class. Mr Stone Genesis preset exists with detailed DNA. Mr Stone can be rebuilt using manually generated OpenArt assets, but there is no direct OpenArt API workflow. The gold 1911 prop is marked visual-prop-only and should probably be omitted from first public visuals unless explicitly approved.

Current gaps: no real auth, no real cloud waitlist, no production database, no live R2 upload env, no OpenArt provider, no production Entity image pipeline, no realtime S.A.G.E., no real 3D avatars/worlds, no live streaming, no payments/subscriptions, no marketplace transactions, and no production creator dashboard. Some docs/scripts are stale, especially the talking-avatar activation path that still references the old expensive HeyGen cinematic/lipsync route.

Recommended build order: keep beta gate live; fix `/sage-lab`; update stale provider docs/scripts; configure Supabase and R2 on Netlify; verify auth and real beta request storage; remove horizontal overflow; keep primitive Avatar Builder hidden; generate official OpenArt asset packs for S.A.G.E. and Mr Stone; approve first-class asset slots; wire those slots across profile/channel/feed/studio; then deploy the reviewed S.A.G.E. v1 portal only after owner approval. After that, plan the real immersive layer: 3D/GLB or VRM avatars, world records, LiveKit/realtime, S.A.G.E. memory, and actual media generation/storage governance.

Owner actions required: review local S.A.G.E. v1 in-page integration before any deploy; create/configure Supabase; add Supabase env to local and Netlify; decide whether to add R2 env to Netlify; generate and approve OpenArt S.A.G.E. assets; generate and approve Mr Stone assets; decide on Mr Stone prop policy; avoid more HeyGen spend until `/sage-lab` is fixed and scripts/prompts are approved; set a Netlify deploy credit policy; rotate any API key that may have been exposed outside trusted local env.
