import { navigationMapPlan } from '../../lib/worldEngine/cityPhasePlan'

export default function StaticNavMapPreview({ variant = 'district' }) {
  return (
    <aside className={`static-navmap static-navmap--${variant}`} aria-label="STATIC NavMap preview">
      <div className="static-navmap__head">
        <span>{navigationMapPlan.name}</span>
        <b>{navigationMapPlan.status}</b>
      </div>
      <div className="static-navmap__screen" aria-hidden="true">
        <i className="static-navmap__mountain" />
        <i className="static-navmap__route" />
        {navigationMapPlan.pins.map((pin) => (
          <span
            className={`static-navmap__pin static-navmap__pin--${pin.type}`}
            style={{ '--pin-x': `${pin.x}%`, '--pin-y': `${pin.y}%` }}
            key={pin.id}
          >
            {pin.label}
          </span>
        ))}
      </div>
      <div className="static-navmap__meta">
        <span>Current: Arrival Core</span>
        <span>Route: Penthouse → Valet → Market → Radio → Strip</span>
      </div>
    </aside>
  )
}
