export const sensitiveSageIntents = new Set([
  'post_signal',
  'upload_media',
  'set_default_entity',
  'go_live_preview',
  'paid_generation',
  'delete_content',
  'connect_account',
])

export function sageIntentRequiresConfirmation(intent) {
  return sensitiveSageIntents.has(intent)
}

