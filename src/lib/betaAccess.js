export const staticBetaMode = import.meta.env.VITE_STATIC_BETA_MODE !== 'false'
export const localDevAccess = import.meta.env.DEV || import.meta.env.VITE_STATIC_DEV_MODE === 'true'

function hasLocalOwnerPreviewAccess() {
  if (typeof window === 'undefined') return false
  const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
  if (!localHosts.has(window.location.hostname)) return false
  return window.location.search.includes('owner-preview=1')
    || window.localStorage?.getItem('static-owner-preview') === 'true'
}

export function hasStaticInternalAccess(user) {
  return !staticBetaMode || localDevAccess || Boolean(user)
}

export function hasStaticOwnerAccess(user) {
  const role = user?.app_metadata?.role || user?.user_metadata?.role
  return localDevAccess || hasLocalOwnerPreviewAccess() || role === 'owner'
}
