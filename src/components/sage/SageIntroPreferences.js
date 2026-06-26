const KEY = 'static_sage_intro_preferences'
const SESSION_KEY = 'static_sage_intro_seen_this_session'

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

export function shouldShowSageIntro() {
  const preferences = getSageIntroPreferences()
  return preferences.showOnHome && sessionStorage.getItem(SESSION_KEY) !== 'true'
}

export function markSageIntroSeenThisSession() {
  sessionStorage.setItem(SESSION_KEY, 'true')
}
