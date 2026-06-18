import { useEffect } from 'react'
import { useSage } from '../../context/SageContext'
import { useRouter } from '../Router'

const steps = [
  { route: '/', label: 'ARRIVAL DISTRICT', text: 'The Arrival District is the front door: a public world map where visitors preview venues, request access, and choose where to enter.' },
  { route: '/discover', label: 'NETWORK COMMAND', text: 'Discover is the index layer: watch, follow, create, play, broadcast, and return through one connected entertainment loop.' },
  { route: '/entities', label: 'ENTITIES', text: 'Everything begins with an Entity. Your Entity becomes your public identity across the network.' },
  { route: '/signals', label: 'SIGNALS', text: 'Signals are how Entities post, publish, premiere, and broadcast every media format.' },
  { route: '/my-signal', label: 'MY SIGNAL', text: 'My Signal is the personal pulse: followed venues and Entities gathered into one return feed.' },
  { route: '/channels', label: 'CHANNELS', text: 'Your Channel is the media home for your identity, audience, releases, and world.' },
  { route: '/studio', label: 'STUDIO', text: 'Studio is your creator control room for shaping everything behind the public signal.' },
  { route: '/feed', label: 'FEED', text: 'The Feed is where Entity transmissions become social entertainment.' },
  { route: '/sage', label: 'S.A.G.E.', text: 'I remain available across every page to guide, explain, navigate, and prepare approved actions.' },
  { route: '/login', label: 'ACCOUNT ACCESS', text: 'Sign in when you want cloud-backed ownership and cross-device access. Local mode still works without it.' },
  { route: '/entities/generate', label: 'ENTITY GENERATOR', text: 'Direct your Entity DNA, create concept frames, and promote official identity images.' },
  { route: '/feed', label: 'START TRANSMITTING', text: 'Create or select an Entity, prepare a Signal, review it, and transmit when you are ready.' },
]

export default function SageTourFlow() {
  const sage = useSage()
  const { navigate } = useRouter()
  const step = steps[sage.tourStep]

  useEffect(() => {
    if (step) navigate(step.route)
  }, [navigate, step])

  if (!step) return null
  function close() {
    sage.setTourStep(-1)
  }
  function move(next) {
    if (next >= steps.length) {
      close()
      sage.setOpen(true)
      sage.say('Tour complete. I’m staying right here whenever you need me.', true)
      return
    }
    sage.setTourStep(next)
    sage.say(steps[next].text, true)
  }

  return (
    <div className="sage-tour" role="dialog" aria-modal="true" aria-label={`S.A.G.E. tour step ${sage.tourStep + 1}`}>
      <div className="sage-tour__signal"><i /><span>S.A.G.E. GUIDED TOUR</span></div>
      <div className="sage-tour__card">
        <span>{String(sage.tourStep + 1).padStart(2, '0')} / {steps.length} · {step.label}</span>
        <p>{step.text}</p>
        <div><button type="button" onClick={() => move(Math.max(0, sage.tourStep - 1))} disabled={sage.tourStep === 0}>Previous</button><button type="button" onClick={() => move(sage.tourStep + 1)}>{sage.tourStep === steps.length - 1 ? 'Finish' : 'Next'}</button><button type="button" onClick={close}>Skip tour</button></div>
      </div>
    </div>
  )
}
