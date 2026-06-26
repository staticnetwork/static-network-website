export function includesSageWakeWord(transcript) {
  return /\b(?:hey|hi|hello)\s+(?:s\.?\s*a\.?\s*g\.?\s*e\.?|sage)\b/i.test(transcript || '')
}

export function stripSageWakeWord(transcript) {
  return String(transcript || '').replace(/\b(?:hey|hi|hello)\s+(?:s\.?\s*a\.?\s*g\.?\s*e\.?|sage)[,.\s]*/i, '').trim()
}
