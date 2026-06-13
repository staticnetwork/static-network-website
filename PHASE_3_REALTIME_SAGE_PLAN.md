# Phase 3 Realtime S.A.G.E. Plan

Pricing and product facts were checked against official provider pages on June 13, 2026. Recheck them before purchasing.

## Decision

Use two stages:

1. **D-ID now for approved image-to-talking-video clips.** It accepts a source image plus public audio and is the shortest path from the official S.A.G.E. still to a visibly synchronized result.
2. **Tavus CVI for Phase 3 realtime browser conversation.** Tavus provides a WebRTC conversational-video pipeline, browser conversation URL, stock replicas for testing, and custom replica training on Starter.

D-ID is connected in the current `/sage-lab` adapter. Tavus can be validated by the activation script, but a Tavus realtime browser adapter is not yet connected.

## Fastest Path

1. Run `npm run activate-elevenlabs`.
2. Approve one official image in `/sage-identity`.
3. Connect Cloudflare R2 so the approved image and ElevenLabs audio have public URLs.
4. Run `npm run activate-talking-avatar` and choose D-ID.
5. Generate one short clip in `/sage-lab`.
6. Review face stability, mouth movement, timing, voice character, and brand quality.
7. Approve the clip only if it is visibly worthy.
8. In parallel, test a Tavus stock replica on the free developer tier.
9. Buy Tavus Starter only after realtime quality is accepted and a custom S.A.G.E. training video exists.

## Provider Comparison

### D-ID

- Best current use: approved still image plus ElevenLabs audio to generated talking video.
- API: Talks and Agents.
- Trial: D-ID advertises a free trial. Its public API page does not expose a fixed post-trial dollar amount, so the owner must review the signed-in quote before purchasing.
- Required secret: `DID_API_KEY`.
- Current STATIC support: validation, talk creation, status polling, result preview, and approval.
- Realtime: Agents supports a realtime path, but it requires a separate implementation and quality evaluation.

### Tavus

- Best current use: future realtime browser conversation.
- Free developer tier: 25 conversational-video minutes, 5 generated-video minutes, and stock replicas.
- Starter: $59/month plus usage; custom replica training, 100 conversational minutes, 10 generated-video minutes, and up to three concurrent streams.
- Growth: $397/month plus usage.
- Required secret: `TAVUS_API_KEY`.
- Browser: CVI returns a conversation URL for WebRTC browser sessions.
- Mobile: viable, but bandwidth, heat, interruption recovery, and fallback UI need real-device testing.
- Current STATIC support: credential validation only. No realtime session is claimed active.

### HeyGen

- Best current use: alternative generated and streaming avatars.
- Free API credits exist, while custom photo-avatar generation can require prepaid usage or a paid API plan.
- Published pay-as-you-go examples include Avatar IV at $0.15/second and Avatar III at $0.05/second.
- Required secret: `HEYGEN_API_KEY`.
- Current STATIC support: credential validation only. No generated-video adapter is claimed active.

## Free And Paid Stack

Free-first private test:

- ElevenLabs Free: 10,000 credits/month.
- Tavus Basic: 25 conversational minutes and 5 generated-video minutes.
- Cloudflare R2 Standard: 10 GB-month storage, 1 million Class A operations, 10 million Class B operations, and free direct egress per month.
- D-ID: free trial, with exact post-trial pricing confirmed in the owner account.

Minimum practical paid stack after trials:

- ElevenLabs Starter: $6/month if commercial licensing or more credits are required.
- Tavus Starter: $59/month when a custom realtime S.A.G.E. replica is required.
- Gemini 3.1 Flash Image: no free tier; approximately $0.067 per standard 1K output.
- R2 beyond free tier: $0.015/GB-month Standard storage plus operations.
- D-ID post-trial: do not approve until the owner sees the exact account quote.

The known minimum recurring stack for custom realtime S.A.G.E. is approximately **$65/month plus image, avatar overage, hosting, and LLM usage**, before any D-ID cost. The free Tavus tier can validate interaction mechanics with stock replicas first.

## Browser Architecture

1. Authenticated owner requests a session from a Netlify function.
2. The function creates a Tavus conversation with server-side credentials.
3. Browser receives only the conversation URL or bounded session token.
4. The UI asks for explicit microphone/camera consent.
5. Text fallback remains available.
6. Session start, stop, timeout, cost, and error events are logged without retaining raw conversation by default.
7. S.A.G.E. cannot publish, purchase, go live, or change providers without explicit confirmation.

## 3D Evolution

Talking video is not a 3D asset. A later 3D route requires an approved turnaround, production mesh and topology, PBR materials, hair/wardrobe system, facial blendshapes, visemes, body rig, animation set, LODs, compressed textures, and a mobile-tested WebGL/WebGPU runtime.

The approved 2D identity remains the visual source of truth. A 3D vendor or artist must reproduce it instead of replacing it with a generic model.

## Recommended Next Step

Activate ElevenLabs and D-ID, connect R2, generate one short owner-reviewed clip, and reject it if synchronization or appearance is weak. Then test Tavus Basic with a stock replica before approving the $59/month custom-replica plan.

## Official Sources

- https://elevenlabs.io/pricing
- https://www.d-id.com/pricing/api/
- https://docs.d-id.com/docs/v3-photo-avatar-quickstart
- https://www.tavus.io/pricing
- https://docs.tavus.io/sections/conversational-video-interface/conversation
- https://www.heygen.com/pricing
- https://docs.heygen.com/docs/pricing-plans-and-credits
- https://developers.cloudflare.com/r2/pricing/
- https://ai.google.dev/gemini-api/docs/pricing
