import { json, parseBody, rateLimit, requirePost, safeFetch } from './_provider-utils.js'
import { requireSupabaseUser } from './_supabase-auth.js'

const products = {
  static_plus: {
    label: 'Static+',
    mode: 'subscription',
    priceEnv: 'STRIPE_STATIC_PLUS_PRICE_ID',
    itemType: 'subscription',
  },
  creator_pro: {
    label: 'Creator Pro',
    mode: 'subscription',
    priceEnv: 'STRIPE_CREATOR_PRO_PRICE_ID',
    itemType: 'subscription',
  },
  coins_500: {
    label: '500 Static Coins',
    mode: 'payment',
    priceEnv: 'STRIPE_COINS_500_PRICE_ID',
    itemType: 'coin_pack',
    coins: 500,
  },
  coins_2500: {
    label: '2,500 Static Coins',
    mode: 'payment',
    priceEnv: 'STRIPE_COINS_2500_PRICE_ID',
    itemType: 'coin_pack',
    coins: 2500,
  },
  coins_10000: {
    label: '10,000 Static Coins',
    mode: 'payment',
    priceEnv: 'STRIPE_COINS_10000_PRICE_ID',
    itemType: 'coin_pack',
    coins: 10000,
  },
}

function configured() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

function appUrl(event) {
  return process.env.STATIC_APP_URL
    || process.env.URL
    || event.headers?.origin
    || 'http://localhost:5173'
}

async function createCheckoutSession({ user, product, event }) {
  const price = process.env[product.priceEnv]
  if (!price) throw Object.assign(new Error(`${product.priceEnv} is not configured.`), { statusCode: 503 })

  const baseUrl = appUrl(event).replace(/\/$/, '')
  const params = new URLSearchParams()
  params.set('mode', product.mode)
  params.set('client_reference_id', user.id)
  params.set('success_url', `${baseUrl}/account?checkout=success`)
  params.set('cancel_url', `${baseUrl}/static-plus?checkout=cancelled`)
  params.set('line_items[0][price]', price)
  params.set('line_items[0][quantity]', '1')
  params.set('metadata[user_id]', user.id)
  params.set('metadata[item_type]', product.itemType)
  params.set('metadata[product]', product.key)
  params.set('metadata[label]', product.label)
  if (product.coins) params.set('metadata[coins]', String(product.coins))
  if (user.email) params.set('customer_email', user.email)
  params.set('allow_promotion_codes', 'true')

  const response = await safeFetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  }, 20000)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(data.error?.message || `Stripe returned ${response.status}.`), { statusCode: response.status })
  return data
}

export const handler = async (event) => {
  const methodError = requirePost(event)
  if (methodError) return methodError
  const limited = rateLimit(event, 12)
  if (limited) return limited
  if (!configured()) return json(503, { ok: false, provider: 'Stripe', configured: false, error: 'Stripe checkout is not configured yet.' })

  try {
    const { user } = await requireSupabaseUser(event)
    const body = parseBody(event)
    const productKey = String(body.product || '').trim()
    const product = products[productKey]
    if (!product) return json(400, { ok: false, error: 'Unknown checkout product.' })
    const session = await createCheckoutSession({ user, product: { ...product, key: productKey }, event })
    return json(200, { ok: true, provider: 'Stripe', url: session.url, id: session.id })
  } catch (error) {
    return json(error.statusCode || 502, { ok: false, provider: 'Stripe', configured: configured(), error: error.message || 'Checkout could not be created.' })
  }
}
