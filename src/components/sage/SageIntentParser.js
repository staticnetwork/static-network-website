const routeRules = [
  ['generate_entity', /\b(generate|make).*(entity|profile image|mr stone)\b/i],
  ['create_entity', /\b(create|build|make).*(entity|character|identity)\b/i],
  ['customize_avatar', /\b(customize|edit).*(avatar|appearance)\b/i],
  ['customize_channel', /\b(customize|edit).*(channel)\b/i],
  ['open_studio', /\b(open|go to|show).*(studio|creator tools)\b/i],
  ['open_feed', /\b(open|go to|show).*(feed|signals composer)\b/i],
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
    const feature = ['signal score', 'entity', 'signal', 'channel', 'studio', 'static'].find((item) => lower.includes(item)) || 'static'
    return { intent: 'explain_feature', text, feature }
  }
  const route = routeRules.find(([, pattern]) => pattern.test(text))
  if (route) return { intent: route[0], text, preset: /mr stone/i.test(text) ? 'mr-stone' : '' }
  if (/\b(radio|play|originals|marketplace|labs|discover)\b/i.test(text) && /\b(open|go|show|take)\b/i.test(text)) {
    const destination = ['radio', 'play', 'originals', 'marketplace', 'labs', 'discover'].find((item) => lower.includes(item))
    return { intent: 'navigate', text, route: `/${destination}` }
  }
  return { intent: 'help', text }
}

export default parseSageIntent

