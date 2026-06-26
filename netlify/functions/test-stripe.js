import { hasEnv, json } from './_provider-utils.js'

const required = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_STATIC_PLUS_PRICE_ID',
  'STRIPE_CREATOR_PRO_PRICE_ID',
  'STRIPE_COINS_500_PRICE_ID',
  'STRIPE_COINS_2500_PRICE_ID',
  'STRIPE_COINS_10000_PRICE_ID',
  'SUPABASE_SERVICE_ROLE_KEY',
]

export const handler = async () => {
  const missing = required.filter((name) => !process.env[name])
  return json(200, {
    ok: true,
    provider: 'Stripe',
    configured: missing.length === 0,
    validated: hasEnv(required),
    capabilities: ['Static+', 'Creator Pro', 'Static Coins', 'Stripe webhook fulfillment'],
    missing,
  })
}
