import { SignalMark } from '../UI'
import { Link } from '../Router'
import { useSage } from '../../context/SageContext'

const zones = [
  { name: 'Signals', label: 'Discovery Boulevard', code: '01', route: '/signals', lore: 'Clips, posts, drops, premieres, and world teasers move through the public pulse first.' },
  { name: 'Channels', label: 'Creator Venues', code: '02', route: '/channels', lore: 'Creator-owned destinations with Signals, drops, live, lore, shows, and worlds.' },
  { name: 'Radio', label: 'Rooftop Frequency', code: '03', route: '/radio', lore: 'Always-on stations set the sound of the district while people explore.' },
  { name: 'PLAY', label: 'Arcade Worlds', code: '04', route: '/play', lore: 'Describe what you want to play and save the playable concept.' },
  { name: 'LIVE', label: 'Broadcast Arena', code: '05', route: '/live', lore: 'Premieres, rooms, countdowns, and Entity broadcast previews.' },
  { name: 'Studio', label: 'Creation Tower', code: '06', route: '/studio', lore: 'Build shows, worlds, drops, entities, and story systems from one console.' },
  { name: 'Marketplace', label: 'Asset Boulevard', code: '07', route: '/marketplace', lore: 'Save drops, request access, and track future inventory intent.' },
  { name: 'S.A.G.E.', label: 'Concierge Signal', code: '08', route: '/sage', lore: 'Ask the guide what is live, what is preview, and where to go next.' },
]

export function PortalEnvironment({ children }) {
  return (
    <div className="portal-environment">
      <div className="portal-district-image" aria-hidden="true" />
      <div className="portal-space" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="portal-grid-plane" aria-hidden="true" />
      <div className="portal-light-beams" aria-hidden="true" />
      <div className="portal-core" aria-hidden="true">
        <div className="portal-core__ring portal-core__ring--outer" />
        <div className="portal-core__ring portal-core__ring--mid" />
        <div className="portal-core__ring portal-core__ring--inner" />
        <div className="portal-core__door" />
        <div className="portal-core__horizon" />
      </div>
      <div className="portal-sage-presence" aria-hidden="true">
        <span>S.A.G.E. ONLINE</span>
        <i />
        <small>District concierge signal</small>
      </div>
      {children}
    </div>
  )
}

export function PortalZoneMap() {
  const sage = useSage()
  return (
    <section className="portal-zone-section" id="network-map" aria-labelledby="portal-zone-title">
      <div className="portal-section-copy">
        <span>DISTRICT MAP / LIVE DESTINATIONS</span>
        <h2 id="portal-zone-title">Explore the district.</h2>
        <p>Eight entertainment systems connect the STATIC city. Each one opens as a destination for creators, fans, Entities, broadcasts, games, and worlds.</p>
      </div>
      <div className="portal-zone-map" aria-label="STATIC Network zones">
        <div className="portal-zone-map__axis" aria-hidden="true"><SignalMark animated /></div>
        {zones.map(({ name, label, code, route, lore }, index) => {
          const content = <><span>{code}</span><h3>{name}</h3><p>{label}</p><small>{lore}</small></>
          return name === 'S.A.G.E.'
            ? <button className="portal-zone-node" style={{ '--node-index': index }} type="button" onClick={sage.summonIntro} key={name}>{content}</button>
            : <Link className="portal-zone-node" style={{ '--node-index': index }} to={route} key={name}>{content}</Link>
        })}
      </div>
      <div className="portal-district-transit" aria-label="STATIC transit routes">
        <span>PUBLIC TRANSIT LAYER</span>
        <nav>
          {zones.map(({ name, route }) => name === 'S.A.G.E.'
            ? <button type="button" onClick={sage.summonIntro} key={name}>{name}</button>
            : <Link to={route} key={name}>{name}</Link>)}
        </nav>
      </div>
    </section>
  )
}
