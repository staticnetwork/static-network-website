# S.A.G.E. Persona Framework

Official STATIC S.A.G.E. remains the only priority until her visual, ElevenLabs voice, and talking-avatar result are approved.

The code framework lives in `src/lib/sagePersona.js`:

```js
sagePersonaConfig = {
  userId,
  personaName,
  visualPrompt,
  styleTag,
  approvedImages,
  voiceProvider,
  voiceId,
  greetingScript,
  motionProfile,
  talkingAvatarProvider,
  talkingAvatarId,
  isOfficial,
  isDefaultForUser,
  createdAt,
  updatedAt,
}
```

## Rules

- The official persona is immutable to non-owners.
- User personas inherit capability and safety policy, not official visual assets.
- Every generated image requires approval before use.
- Voice selection requires usage rights and server-side credentials.
- Talking-avatar IDs are provider references, not proof of active generation.
- Persona changes do not grant more action permissions.
- Public sharing requires moderation, provenance, and deletion.

## Future Flow

1. User starts from a style preset or visual prompt.
2. Provider creates a bounded candidate set.
3. User approves images into semantic slots.
4. User chooses an allowed or owned voice.
5. A talking-avatar adapter creates a private test.
6. User reviews and activates a default persona.
7. S.A.G.E. keeps the same confirmation and safety boundaries.

Executive, western, anime-inspired, alien, concierge, male, and robot-butler personas must remain original and avoid celebrity or copyrighted-character imitation.
