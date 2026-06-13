const KEY = 'static_sage_intro_preferences'

export function getSageIntroPreferences() {
  try {
    return { seen: false, showOnHome: true, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { seen: false, showOnHome: true }
  }
}

export function saveSageIntroPreferences(value) {
  localStorage.setItem(KEY, JSON.stringify({ ...getSageIntroPreferences(), ...value }))
}

