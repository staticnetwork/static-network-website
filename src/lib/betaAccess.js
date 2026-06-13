export const staticBetaMode = import.meta.env.VITE_STATIC_BETA_MODE !== 'false'
export const localDevAccess = import.meta.env.DEV || import.meta.env.VITE_STATIC_DEV_MODE === 'true'

export function hasStaticInternalAccess(user) {
  return !staticBetaMode || localDevAccess || Boolean(user)
}

export function hasStaticOwnerAccess(user) {
  const role = user?.app_metadata?.role || user?.user_metadata?.role
  return localDevAccess || role === 'owner'
}
