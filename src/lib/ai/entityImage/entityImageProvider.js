import { generateMockEntityImages } from './mockEntityImageProvider'
import { generateWithGoogle } from './googleImageProvider'
import { generateWithOpenAI } from './openAIImageProvider'

export function generateEntityImages(provider, payload) {
  if (provider === 'google') return generateWithGoogle(payload)
  if (provider === 'openai') return generateWithOpenAI(payload)
  return generateMockEntityImages(payload)
}
