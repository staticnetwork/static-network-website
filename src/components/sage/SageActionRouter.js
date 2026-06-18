import { sageExplanations, sageRoutes } from '../../lib/ai/sage/sageActionRegistry'

export function planSageAction(parsed) {
  if (parsed.intent === 'navigate') return { type: 'navigate', route: parsed.route, response: `Opening ${parsed.route.replace('/', '')}.` }
  if (parsed.intent === 'start_tour') return { type: 'tour', response: 'Excellent. I’ll guide you through the network one system at a time.' }
  if (parsed.intent === 'explain_feature') return { type: 'respond', response: sageExplanations[parsed.feature] || sageExplanations.static }
  if (parsed.intent === 'post_signal') return { type: 'confirm', response: `I can prepare “${parsed.payload}” in the Signal composer. Confirm transmission setup?` }
  if (parsed.intent === 'set_default_entity') return { type: 'confirm', response: 'Changing the active identity affects the whole local network. Approve this action?' }
  if (parsed.intent === 'go_live_preview') return { type: 'confirm', response: 'I can open the Live preview. Nothing will broadcast externally. Approve this action?' }
  if (sageRoutes[parsed.intent]) return { type: 'navigate', route: sageRoutes[parsed.intent], response: `Opening ${parsed.intent.replaceAll('_', ' ')}.` }
  return { type: 'respond', response: 'I can navigate STATIC, guide your District OS setup, explain what is real versus preview, open creative tools, prefill a Signal, check providers, or start the tour.' }
}

export default planSageAction
