import { useMemo, useState } from 'react'
import {
  navigationMapPlan,
  signatureCityLoop,
  tenPhaseCityPlan,
} from '../../lib/worldEngine/cityPhasePlan'

const routeMarkers = [
  'Property spawn',
  'Valet point',
  'Mountain route',
  'Market Walk',
  'Radio rooftop',
  'Return state',
]

export default function StaticCityLoopPrototype() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeLoop = signatureCityLoop[activeIndex] || signatureCityLoop[0]
  const systemStack = useMemo(() => tenPhaseCityPlan.map((phase) => phase.title), [])

  return (
    <aside className="world-engine__city-loop" aria-label="STATIC gated city loop prototype">
      <span>GATED CITY LOOP // NOT LIVE GAMEPLAY</span>
      <h3>Penthouse to strip route</h3>
      <p>
        This shell turns the next product direction into an interface contract:
        spawn, travel, shop, socialize, broadcast, and return.
      </p>

      <div className="world-engine__loop-track" role="list" aria-label="Prototype route steps">
        {signatureCityLoop.map(([title], index) => (
          <button
            className={index === activeIndex ? 'is-active' : ''}
            type="button"
            onClick={() => setActiveIndex(index)}
            key={title}
          >
            <small>{String(index + 1).padStart(2, '0')}</small>
            <b>{title}</b>
          </button>
        ))}
      </div>

      <article className="world-engine__loop-detail">
        <small>{routeMarkers[activeIndex] || routeMarkers[0]}</small>
        <b>{activeLoop[0]}</b>
        <p>{activeLoop[1]}</p>
      </article>

      <div className="world-engine__map-contract" aria-label="Navigation map contract">
        <b>{navigationMapPlan.name}</b>
        <small>{navigationMapPlan.layers.map(([title]) => title).join(' / ')}</small>
      </div>

      <div className="world-engine__system-strip" aria-label="Internal system stack">
        {systemStack.map((title) => <small key={title}>{title}</small>)}
      </div>
    </aside>
  )
}
