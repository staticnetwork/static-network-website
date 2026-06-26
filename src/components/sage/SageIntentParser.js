const routeRules = [
  ['generate_entity', /\b(generate|make).*(entity|profile image|mr stone)\b/i],
  ['create_entity', /\b(create|build|make).*(entity|character|identity)\b/i],
  ['customize_avatar', /\b(customize|edit).*(avatar|appearance)\b/i],
  ['customize_channel', /\b(customize|edit).*(channel)\b/i],
  ['open_studio', /\b(open|go to|show).*(studio|creator tools)\b/i],
  ['open_feed', /\b(open|go to|show).*(feed|signals composer)\b/i],
  ['open_my_signal', /\b(open|go to|show).*(my signal|followed feed|personal feed)\b/i],
  ['open_channel', /\b(open|go to|show).*(my channel|channel)\b/i],
  ['open_account', /\b(open|go to|show|log).*(account|login|sign in|sign up)\b/i],
  ['provider_status', /\b(provider|api|integration).*(status|setup|connected)|\bprovider status\b/i],
  ['go_live_preview', /\b(go|start|open).*(live)\b/i],
  ['build_world', /\b(build|create|make).*(world)\b/i],
  ['create_drop', /\b(build|create|make).*(drop)\b/i],
  ['upload_media', /\b(upload|add).*(media|image|video|audio)\b/i],
]

export function parseSageIntent(input) {
  const text = String(input || '').trim()
  const lower = text.toLowerCase()
  if (!text) return { intent: 'help', text }
  if (/\b(tour|show me around|how everything works)\b/i.test(text)) return { intent: 'start_tour', text }
  if (/\b(onboard|setup|set me up|what next|next move|killer loop|first loop|district os|city os|guide me)\b/i.test(text)) return { intent: 'district_onboarding', text }
  if (/\b(network status|my network|what have we built|dashboard|stats|inventory|reminders|saved projects)\b/i.test(text)) return { intent: 'network_status', text }
  if (/\b(cloud|sync|supabase|saved to cloud|cloud saved|local only)\b/i.test(text)) return { intent: 'cloud_status', text }
  if (/\b(real|actually works|working now|preview only|fake|shell|mock|backend|api|cost|credits|paid)\b/i.test(text)) return { intent: 'real_vs_preview', text }
  if (/\b(open|go|show|take|return).*(district|city|arrival|home)\b/i.test(text)) return { intent: 'navigate', text, route: '/' }
  if (/\b(district|city|arrival|map|venue|where should i go|what is this place)\b/i.test(text)) return { intent: 'district_status', text }
  if (/\b(set|make).*(default|active).*(entity)\b/i.test(text)) return { intent: 'set_default_entity', text, entityName: text.match(/(?:entity|as)\s+(.+)$/i)?.[1]?.trim() || '' }
  if (/\bpost\b|\bpublish\b|\btransmit\b/i.test(text)) {
    const payload = text
      .replace(/^(?:hey\s+sage[,.]?\s*)/i, '')
      .replace(/^(?:post|publish|transmit)\s+/i, '')
      .replace(/\s+as\s+.+$/i, '')
      .trim()
    return { intent: 'post_signal', text, payload: payload || 'Welcome to the STATIC Network.' }
  }
  if (/\b(what is|explain|tell me about|how does)\b/i.test(text)) {
    const feature = ['signal score', 'cloud sync', 'preview mode', 'city', 'district', 'marketplace', 'signals', 'signal', 'entity', 'channel', 'studio', 'play', 'live', 'radio', 'static'].find((item) => lower.includes(item)) || 'static'
    return { intent: 'explain_feature', text, feature }
  }
  if (/\b(go live|start.*live|begin.*broadcast)\b/i.test(text)) return { intent: 'go_live_preview', text }
  if (/\b(my signal|radio|play|originals|marketplace|labs|discover|signals|live|account|studio|city|district|home)\b/i.test(text) && /\b(open|go|show|take|run)\b/i.test(text)) {
    const destination = ['my signal', 'signals', 'radio', 'play', 'originals', 'marketplace', 'labs', 'discover', 'live', 'account', 'studio', 'city', 'district', 'home'].find((item) => lower.includes(item))
    return { intent: 'navigate', text, route: ['city', 'district', 'home'].includes(destination) ? '/' : destination === 'account' ? '/account' : destination === 'my signal' ? '/my-signal' : `/${destination}` }
  }
  const route = routeRules.find(([, pattern]) => pattern.test(text))
  if (route) return { intent: route[0], text, preset: /mr stone/i.test(text) ? 'mr-stone' : '' }
  return { intent: 'help', text }
}

export default parseSageIntent
