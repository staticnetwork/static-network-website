const KEY = 'static_sage_voice_settings'

export const defaultSageVoiceSettings = {
  enabled: true,
  spokenResponses: true,
  muted: false,
  pushToTalkOnly: true,
  wakePhraseEnabled: false,
  voice: 'British Executive',
  provider: 'browser',
}

export function getSageVoiceSettings() {
  try {
    return { ...defaultSageVoiceSettings, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return defaultSageVoiceSettings
  }
}

export function saveSageVoiceSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings))
  return settings
}

