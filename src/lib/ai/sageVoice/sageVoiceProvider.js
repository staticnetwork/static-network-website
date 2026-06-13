import { speakWithElevenLabs } from './elevenLabsSageVoiceProvider'
import { getSageVoiceSettings } from './sageVoiceSettings'

let activeAudio = null

export async function speakAsSage(text, callbacks = {}) {
  const settings = getSageVoiceSettings()
  if (!callbacks.connected || !settings.enabled || !settings.spokenResponses || settings.muted) return false
  callbacks.onState?.('speaking')
  try {
    activeAudio = await speakWithElevenLabs(text, true)
    activeAudio.addEventListener('ended', () => callbacks.onState?.('idle'), { once: true })
    return true
  } catch {
    callbacks.onState?.('idle')
    return false
  }
}

export function stopSageVoice() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.currentTime = 0
  }
  activeAudio = null
}
