#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve('.env.local')
const allowLive = process.argv.includes('--allow-live')

function loadEnvFile() {
  if (!existsSync(envPath)) return new Map()
  return new Map(
    readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf('=')
        return index > 0 ? [line.slice(0, index), line.slice(index + 1)] : [line, '']
      }),
  )
}

function saveEnv(env) {
  writeFileSync(envPath, `${[...env].map(([key, value]) => `${key}=${value}`).join('\n')}\n`, { mode: 0o600 })
}

function formBody(data) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) params.set(key, String(value))
  }
  return params.toString()
}

const env = loadEnvFile()
const secretKey = env.get('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY in .env.local.')
  process.exit(1)
}

if (!allowLive && !secretKey.startsWith('sk_test_')) {
  console.error('Refusing to create Stripe products with a non-test key. Pass --allow-live only when you intentionally want live billing objects.')
  process.exit(1)
}

async function stripeFetch(path, options = {}) {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(options.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error?.message || `Stripe ${path} returned ${response.status}`)
  return data
}

async function findProduct(staticKey) {
  const list = await stripeFetch('/products?active=true&limit=100')
  return list.data?.find((product) => product.metadata?.static_key === staticKey) || null
}

async function ensureProduct({ key, name, description }) {
  const existing = await findProduct(key)
  if (existing) return existing
  return stripeFetch('/products', {
    method: 'POST',
    body: formBody({
      name,
      description,
      'metadata[static_key]': key,
      'metadata[platform]': 'static_network',
    }),
  })
}

async function ensurePrice({ productId, lookupKey, unitAmount, recurringInterval }) {
  const prices = await stripeFetch(`/prices?product=${productId}&active=true&limit=100`)
  const existing = prices.data?.find((price) => (
    price.lookup_key === lookupKey
    && price.unit_amount === unitAmount
    && price.currency === 'usd'
    && (recurringInterval ? price.recurring?.interval === recurringInterval : !price.recurring)
  ))
  if (existing) return existing

  return stripeFetch('/prices', {
    method: 'POST',
    body: formBody({
      product: productId,
      currency: 'usd',
      unit_amount: unitAmount,
      lookup_key: lookupKey,
      ...(recurringInterval ? { 'recurring[interval]': recurringInterval } : {}),
    }),
  })
}

async function ensureWebhook() {
  const webhookUrl = `${(env.get('STATIC_APP_URL') || env.get('URL') || 'https://thestaticnetwork.com').replace(/\/$/, '')}/.netlify/functions/stripe-webhook`
  const endpoints = await stripeFetch('/webhook_endpoints?limit=100')
  const existing = endpoints.data?.find((endpoint) => endpoint.url === webhookUrl)
  if (existing) {
    if (!env.get('STRIPE_WEBHOOK_SECRET')) {
      throw new Error(`Webhook endpoint already exists for ${webhookUrl}, but Stripe only reveals signing secrets when the endpoint is created. Reveal/copy the signing secret in Stripe and save it as STRIPE_WEBHOOK_SECRET.`)
    }
    return existing
  }

  const endpoint = await stripeFetch('/webhook_endpoints', {
    method: 'POST',
    body: formBody({
      url: webhookUrl,
      'enabled_events[0]': 'checkout.session.completed',
      description: 'STATIC Network checkout fulfillment',
    }),
  })
  if (endpoint.secret) env.set('STRIPE_WEBHOOK_SECRET', endpoint.secret)
  return endpoint
}

const catalog = [
  {
    key: 'static_plus',
    envName: 'STRIPE_STATIC_PLUS_PRICE_ID',
    name: 'Static+',
    description: 'Monthly creator tier for STATIC Social and creation credits.',
    unitAmount: 1999,
    recurringInterval: 'month',
  },
  {
    key: 'creator_pro',
    envName: 'STRIPE_CREATOR_PRO_PRICE_ID',
    name: 'Creator Pro',
    description: 'Advanced builder/operator tier for STATIC creator workflows.',
    unitAmount: 9999,
    recurringInterval: 'month',
  },
  {
    key: 'coins_500',
    envName: 'STRIPE_COINS_500_PRICE_ID',
    name: '500 Static Coins',
    description: 'Starter Static Coin pack for boosts, tips, and creation credit.',
    unitAmount: 499,
  },
  {
    key: 'coins_2500',
    envName: 'STRIPE_COINS_2500_PRICE_ID',
    name: '2,500 Static Coins',
    description: 'Creator Static Coin pack for larger drops and boosts.',
    unitAmount: 1999,
  },
  {
    key: 'coins_10000',
    envName: 'STRIPE_COINS_10000_PRICE_ID',
    name: '10,000 Static Coins',
    description: 'World-builder Static Coin pack for serious creator activity.',
    unitAmount: 6999,
  },
]

const summary = []

for (const item of catalog) {
  const product = await ensureProduct(item)
  const price = await ensurePrice({
    productId: product.id,
    lookupKey: item.key,
    unitAmount: item.unitAmount,
    recurringInterval: item.recurringInterval,
  })
  env.set(item.envName, price.id)
  summary.push({
    key: item.key,
    productId: product.id,
    priceEnv: item.envName,
    priceId: price.id,
    amountUsd: `$${(item.unitAmount / 100).toFixed(2)}`,
    interval: item.recurringInterval || 'one-time',
  })
}

const webhook = await ensureWebhook()
saveEnv(env)

console.log(JSON.stringify({
  mode: secretKey.startsWith('sk_test_') ? 'test' : 'live',
  products: summary,
  webhookEndpointId: webhook.id,
  webhookSecretSaved: Boolean(env.get('STRIPE_WEBHOOK_SECRET')),
  envUpdated: '.env.local',
  secretsPrinted: false,
}, null, 2))
