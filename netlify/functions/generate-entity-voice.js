import { voiceHandler } from './_elevenlabs-voice.js'

export const handler = (event) => voiceHandler(event, 'ELEVENLABS_ENTITY_VOICE_ID', 'Entity')

