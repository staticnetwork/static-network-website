export const officialSagePersona = {
  userId: 'static-network',
  personaName: 'Official STATIC S.A.G.E.',
  visualPrompt: '',
  styleTag: 'official-cyber-luxury-executive',
  approvedImages: [],
  voiceProvider: 'elevenlabs',
  voiceId: '',
  greetingScript: 'Hello. I’m S.A.G.E. Welcome to STATIC — the home of AI entertainment. If you’d like, I can show you around.',
  motionProfile: 'calm-executive',
  talkingAvatarProvider: '',
  talkingAvatarId: '',
  isOfficial: true,
  isDefaultForUser: true,
  createdAt: '',
  updatedAt: '',
}

export function createSagePersonaConfig(input = {}) {
  const now = new Date().toISOString()
  return {
    ...officialSagePersona,
    userId: '',
    personaName: 'My S.A.G.E.',
    styleTag: 'custom',
    isOfficial: false,
    isDefaultForUser: false,
    createdAt: now,
    updatedAt: now,
    ...input,
  }
}
