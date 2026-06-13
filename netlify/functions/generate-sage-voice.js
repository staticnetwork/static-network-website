import { voiceHandler } from './_elevenlabs-voice.js'

export const handler = (event) => voiceHandler(event, 'ELEVENLABS_SAGE_VOICE_ID', 'S.A.G.E.')

