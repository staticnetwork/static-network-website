# Entity Transformation Pipeline

## Canonical State

Each Entity has one stable identity record and versioned approved assets. Generated outputs are candidates until the owner or Entity owner approves them.

```js
entityTransformation = {
  entityId,
  dnaVersion,
  activeAssetVersion,
  assets: {
    profilePortrait,
    fullBodyRender,
    banner,
    feedPose,
    wavePose,
    hostPose,
    livePresentationPose,
    worldGameConcept,
    future3dAvatarData,
    futureRigAnimationData,
    futureVoiceData,
    futureTalkingAvatarId,
  },
  approvals: [],
  createdAt,
  updatedAt,
}
```

Every asset record should contain `id`, `slot`, `mediaRef`, `publicUrl`, `mimeType`, `provider`, `promptVersion`, `approvedBy`, `approvedAt`, `rightsStatus`, and `safetyStatus`.

## Implemented Baseline

- `/entities/generate` can call Google or OpenAI image adapters when activated.
- Generated or uploaded images can be saved into current Entity official assets.
- IndexedDB stores local files.
- Cloudflare R2 is the server-side public-media handoff.
- Profile, Channel, feed, Signals, and Studio consume Entity media references.

This does not mean consistency, rights review, cloud durability, talking avatars, or 3D conversion are complete.

## Required Stages

### 1. Identity DNA

Version the Entity's name, age presentation, face geometry, body silhouette, hair, wardrobe language, palette, marks, logo rules, prohibited traits, and references.

### 2. 2D candidate generation

Generate a small, explicit batch for one slot at a time. Identify provider and expected cost, require confirmation, preserve model/prompt metadata, run safety checks, and avoid hidden loops.

### 3. Approval

Record slot, approver, rights/likeness confirmation, safety review, approval time, and active version. Only approved assets may appear on public identity surfaces.

### 4. 2D distribution

Use approved 2D assets in profiles, Channels, feed cards, Signals, Studio, Radio artwork, Originals packaging, LIVE holding frames, and 2D Worlds. Resolve by semantic slot, not hard-coded filename.

### 5. Voice

Store provider and voice ID server-side. Require proof of voice rights, cost consent, rate limits, text moderation, and audit records.

### 6. Talking avatar

Send an approved public image and voice/audio URL to a reviewed adapter. Save job ID, provider, source versions, result URL, consent, and cost metadata. Approve only after visual lip-sync review.

### 7. 3D conversion

Create a separate production asset with mesh, topology, PBR materials, hair/cloth, facial blendshapes, visemes, body rig, animations, LODs, compressed textures, GLB/USDZ exports, and source/license records.

Use the 3D form in games, interactive Worlds, spatial LIVE experiences, and avatar-led tools. Do not call talking video 3D.

## Provider Boundary

```js
{
  validate(),
  estimateCost(request),
  createJob(request, explicitConsent),
  getJob(jobId),
  cancelJob(jobId),
  normalizeResult(result),
}
```

Provider keys stay in Netlify functions. Browsers receive safe status, job IDs, bounded result URLs, and errors only.

## Safety And Ownership

- age and sexualization safeguards;
- celebrity and public-figure likeness review;
- copyrighted character/IP review;
- voice-consent record;
- prompt and output moderation;
- paid-action confirmation;
- deletion and retention policy;
- provenance metadata;
- appeal and admin review.

## Completion Criteria

One test Entity must generate and approve consistent 2D slots, render them across the app, generate real voice, return visible lip sync, preserve consent/cost/provenance, and survive sign-in on another device through cloud storage.
