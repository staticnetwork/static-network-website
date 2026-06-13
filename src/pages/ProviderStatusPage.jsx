import { useEffect, useState } from 'react'
import { RouteSEO } from '../components/Router'
import { ArrowIcon, LiveIndicator, PageHero } from '../components/UI'

const providers = [
  ['Supabase', 'test-supabase', 'Accounts and cloud records'],
  ['Google AI', 'test-google-ai', 'Primary Entity image generation'],
  ['OpenAI', 'test-openai', 'S.A.G.E. reasoning and alternate images'],
  ['ElevenLabs', 'test-elevenlabs', 'S.A.G.E. and Entity voice'],
  ['Runway', 'test-runway', 'Entity video adapter'],
  ['LiveKit', 'create-livekit-token', 'Secure live-room tokens'],
  ['Cloudflare R2', 'upload-media', 'Media storage'],
]

async function checkProvider([name, endpoint, capability]) {
  try {
    const response = await fetch(`/.netlify/functions/${endpoint}`)
    const data = await response.json()
    return { name, capability, ...data }
  } catch {
    return { name, capability, configured: false, validated: false, unavailable: true }
  }
}

export default function ProviderStatusPage() {
  const [states, setStates] = useState([])
  const [checking, setChecking] = useState(true)

  async function refresh() {
    setChecking(true)
    setStates(await Promise.all(providers.map(checkProvider)))
    setChecking(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <>
      <RouteSEO path="/provider-status" title="Provider Status | STATIC Network" description="Secure provider configuration status for STATIC Network." />
      <PageHero compact code="SYSTEM//PROVIDERS" eyebrow="SECURE INTEGRATION STATUS" title="The network knows what is real." copy="These checks validate configuration without exposing credentials or launching paid generation." status={checking ? 'CHECKING' : 'STATUS READY'} />
      <section className="section provider-status-page">
        <div className="page-frame">
          <div className="provider-status-toolbar">
            <div><LiveIndicator label="SERVER-SIDE CREDENTIAL BOUNDARY" /><p>Secret provider keys never enter the browser bundle.</p></div>
            <button className="button button--glass" type="button" onClick={refresh} disabled={checking}>{checking ? 'Checking...' : 'Run Safe Checks'} <ArrowIcon /></button>
          </div>
          <div className="provider-status-grid">
            {providers.map(([name,, capability]) => {
              const state = states.find((item) => item.name === name)
              const label = !state ? 'Checking' : state.validated ? 'Validated' : state.configured ? 'Needs attention' : 'Pending owner setup'
              return (
                <article className={`provider-card ${state?.validated ? 'is-valid' : ''}`} key={name}>
                  <span>{label}</span>
                  <h2>{name}</h2>
                  <p>{capability}</p>
                  <dl>
                    <div><dt>Configured</dt><dd>{state?.configured ? 'Yes' : 'No'}</dd></div>
                    <div><dt>Validated</dt><dd>{state?.validated ? 'Yes' : 'No'}</dd></div>
                  </dl>
                  {state?.unavailable && <small>Functions become available through Netlify Dev or deployment.</small>}
                  {state?.error && <small>{state.error}</small>}
                </article>
              )
            })}
          </div>
          <p className="provider-status-note">Generation remains in preview mode until a provider validates and the user explicitly confirms a paid request.</p>
        </div>
      </section>
    </>
  )
}

