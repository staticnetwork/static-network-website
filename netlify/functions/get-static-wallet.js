import { json, safeFetch } from './_provider-utils.js'
import { requireSupabaseUser } from './_supabase-auth.js'

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { ok: false, error: 'GET required.' })

  try {
    const { user, token, url, anonKey } = await requireSupabaseUser(event)
    const walletEndpoint = new URL(`${url}/rest/v1/static_coin_wallets`)
    walletEndpoint.searchParams.set('select', 'balance,lifetime_earned,lifetime_spent,updated_at')
    walletEndpoint.searchParams.set('owner_id', `eq.${user.id}`)
    walletEndpoint.searchParams.set('limit', '1')

    const ledgerEndpoint = new URL(`${url}/rest/v1/static_coin_ledger`)
    ledgerEndpoint.searchParams.set('select', 'id,delta,reason,provider,provider_reference,created_at,data')
    ledgerEndpoint.searchParams.set('owner_id', `eq.${user.id}`)
    ledgerEndpoint.searchParams.set('order', 'created_at.desc')
    ledgerEndpoint.searchParams.set('limit', '8')

    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    }
    const [walletResponse, ledgerResponse] = await Promise.all([
      safeFetch(walletEndpoint.toString(), { headers }),
      safeFetch(ledgerEndpoint.toString(), { headers }),
    ])

    if (!walletResponse.ok || !ledgerResponse.ok) {
      return json(200, {
        ok: true,
        ready: false,
        wallet: null,
        ledger: [],
        error: 'Static Coin wallet migration has not been applied yet.',
      })
    }

    const walletRows = await walletResponse.json()
    const ledger = await ledgerResponse.json()
    return json(200, {
      ok: true,
      ready: true,
      wallet: Array.isArray(walletRows) && walletRows[0] ? walletRows[0] : {
        balance: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
        updated_at: null,
      },
      ledger: Array.isArray(ledger) ? ledger : [],
    })
  } catch (error) {
    return json(error.statusCode || 502, {
      ok: false,
      ready: false,
      error: error.message || 'Static Coin wallet could not be loaded.',
    })
  }
}
