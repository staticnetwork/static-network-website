import crypto from 'node:crypto'
import { json } from './_provider-utils.js'
import { serviceRoleRpc, serviceRoleUpsert } from './_supabase-auth.js'

function configured() {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function verifyStripeSignature(rawBody, header, secret) {
  const parts = Object.fromEntries(String(header || '').split(',').map((part) => {
    const [key, value] = part.split('=')
    return [key, value]
  }))
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false
  const payload = `${timestamp}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}

async function recordCheckout(session) {
  const metadata = session.metadata || {}
  if (!metadata.user_id) return
  const orders = await serviceRoleUpsert('marketplace_orders', {
    owner_id: metadata.user_id,
    item_id: metadata.product || session.id,
    item_type: metadata.item_type || 'stripe_checkout',
    title: metadata.label || 'Stripe checkout',
    status: session.payment_status === 'paid' ? 'paid' : session.status || 'checkout_completed',
    amount_cents: session.amount_total || 0,
    currency: session.currency || 'usd',
    provider: 'stripe',
    provider_reference: session.id,
    data: {
      mode: session.mode,
      customer: session.customer,
      subscription: session.subscription,
      coins: metadata.coins || null,
      checkout: session,
    },
  }, { onConflict: 'provider_reference', returning: true })

  const coins = Number(metadata.coins || 0)
  if (metadata.item_type === 'coin_pack' && coins > 0 && session.payment_status === 'paid') {
    await serviceRoleRpc('credit_static_coins', {
      p_owner_id: metadata.user_id,
      p_delta: coins,
      p_reason: 'stripe_coin_pack',
      p_provider: 'stripe',
      p_provider_reference: session.id,
      p_order_id: Array.isArray(orders) ? orders[0]?.id || null : null,
      p_data: {
        product: metadata.product,
        label: metadata.label,
        amount_total: session.amount_total || 0,
        currency: session.currency || 'usd',
      },
    })
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'POST required.' })
  if (!configured()) return json(503, { ok: false, provider: 'Stripe', configured: false, error: 'Stripe webhook is not configured.' })

  const rawBody = event.body || ''
  const signature = event.headers?.['stripe-signature'] || event.headers?.['Stripe-Signature']
  if (!verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)) {
    return json(400, { ok: false, provider: 'Stripe', error: 'Invalid Stripe signature.' })
  }

  const payload = JSON.parse(rawBody)
  if (payload.type === 'checkout.session.completed') {
    await recordCheckout(payload.data?.object || {})
  }
  return json(200, { ok: true, provider: 'Stripe', received: true })
}
