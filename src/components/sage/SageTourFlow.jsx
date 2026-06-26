import { useEffect } from 'react'
import { useSage } from '../../context/SageContext'
import { useRouter } from '../Router'

const steps = [
  { route: '/', label: 'ARRIVAL DISTRICT', text: 'This is the public Arrival District: the front door to STATIC City, where visitors see the world before they request access.' },
  { route: '/', label: 'STATIC CITY', text: 'STATIC is planned as a full entertainment city: street pulse, luxury districts, creator venues, sports, beaches, marina routes, suburbs, hidden streets, and prestige properties.' },
  { route: '/', label: 'VENUES', text: 'The public district connects Signals, Channels, Radio, PLAY, LIVE, Originals, Marketplace, Studio, and S.A.G.E. as places people can eventually move between.' },
  { route: '/', label: 'ENTITY FUTURE', text: 'The next major unlock is a true create-a-player Entity system: identity, wardrobe, rigging, spawn points, companions, vehicles, property access, and saved ownership.' },
  { route: '/', label: 'CONTROLLED ACCESS', text: 'The deeper prototype, creator systems, properties, live events, NPCs, Unreal traversal, and multiplayer stay controlled until they are ready and safe.' },
  { route: '/#request-access', label: 'REQUEST ACCESS', text: 'That is the public tour. To continue past the district preview, request access and join the first STATIC operators.' },
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
      navigate('/#request-access')
      sage.say('Tour complete. Request access to continue into the network when the next gate opens.', true)
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
