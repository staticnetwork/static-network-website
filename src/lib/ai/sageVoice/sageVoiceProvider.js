import { speakWithBrowser, stopBrowserSpeech } from './browserSpeechProvider'
import { getSageVoiceSettings } from './sageVoiceSettings'

export async function speakAsSage(text, callbacks = {}) {
  const settings = getSageVoiceSettings()
  if (!settings.enabled || !settings.spokenResponses || settings.muted) return false
  callbacks.onState?.('speaking')
  const result = await speakWithBrowser(text, { onStart: callbacks.onStart })
  callbacks.onState?.('idle')
  return result
}

export function stopSageVoice() {
  stopBrowserSpeech()
}

