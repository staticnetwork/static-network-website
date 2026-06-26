import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { BetaRequestForm } from '../components/Forms'
import { Link, RouteSEO, useRouter } from '../components/Router'
import { ArrowIcon } from '../components/UI'
import DistrictMotionLayers from '../components/portal/DistrictMotionLayers'
import { PortalEnvironment } from '../components/portal/PortalEnvironment'
import { createWorldEngineSnapshot, mountWorldEnginePreview } from '../lib/worldEngine/engineBridge'
import {
  arrivalCinemaClips,
  districtVenues,
  venueTravelScript,
} from '../lib/worldEngine/districtManifest'

const StaticWorldEngine = lazy(() => import('../components/world/StaticWorldEngine'))
const ownerPrototypeEnabled = import.meta.env.VITE_STATIC_OWNER_TOOLS === 'true'
const STATIC_MARK_ASSET = '/assets/brand/static-mark-official-working.png'
const publicDistrictVenues = districtVenues.filter((venue) => venue.id !== 'sage')

const districtPaths = [
  ['Visitors', 'Enter STATIC Social, follow creators, and start building a personal Signal across the network.', '/feed'],
  ['Creators', 'Create a STATIC profile, post AI-made work, open a Channel, and build Signal before the game client arrives.', '/signup'],
  ['Studios', 'Preview the future command floor for shows, games, music, live events, drops, and worlds.', '/studio'],
  ['Partners', 'Open a private channel when the public signal becomes a serious conversation.', '/contact'],
]

const districtLoops = [
  ['Watch', 'Signals, Originals, live rooms, sports nights, and Channel premieres', '/signals'],
  ['Hear', 'Radio rooftops, creator voices, music drops, car audio, and venue sound', '/radio'],
  ['Play', 'Prompted worlds, arena games, racing concepts, and remixable systems', '/play'],
  ['Create', 'Studio projects, AI posts, Channels, releases, and prompt stations', '/studio'],
  ['Own', 'Drops, memberships, outfits, vehicles, properties, and marketplace intent', '/marketplace'],
  ['Return', 'My Signal, follows, reminders, saved worlds, and future spawns', '/my-signal'],
]

const districtMoments = [
  ['Now', 'Signal Boulevard', 'A creator posts a world teaser and starts pulling followers into their Channel.'],
  ['Next', 'Broadcast Arena', 'A live premiere room warms up with reminders, comments, and future ticketing intent.'],
  ['Tonight', 'Rooftop Radio', 'A station takeover sets the sound of the district while users browse venues.'],
  ['Build', 'Creation Tower', 'A creator saves a PLAY concept, a show treatment, and a drop plan from one workspace.'],
  ['Drop', 'Asset Boulevard', 'Fans save skins, memberships, templates, and access passes before payments go live.'],
]

const platformProofs = [
  ['01', 'Profile layer', 'Creators get a durable public profile now, with future game identities waiting for the Unreal client.'],
  ['02', 'Social layer', 'Posts, follows, and My Signal turn discovery into return behavior and network memory.'],
  ['03', 'Media layer', 'Video, audio, live, radio, originals, and feed cards exist as one entertainment surface.'],
  ['04', 'Game layer', 'STATIC PLAY creates the bridge from watching content into entering playable worlds.'],
  ['05', 'Creator layer', 'Studio connects prompts, projects, releases, Channels, drops, and provider workflows.'],
  ['06', 'Economy layer', 'Marketplace intent comes before payments: save, request, follow, collect, and unlock.'],
  ['07', 'Guide layer', 'The assistant layer is parked until it can do real work across the network.'],
  ['08', 'Client layer', 'The website opens access while PC, console, Steam, and VR become the high-fidelity city path.'],
]

const districtMetrics = [
  ['8', 'core systems'],
  ['20+', 'district concepts'],
  ['WEB', 'public gateway'],
  ['GAME', 'client path'],
]

const roleTracks = [
  ['Fan', 'Follow creators, save venues, tune radio, join live rooms, and build a personal My Signal feed.', '/my-signal', 'Start watching'],
  ['Creator', 'Create a profile, open a Channel, publish AI posts, plan drops, and build worlds in Studio.', '/signup', 'Create profile'],
  ['Studio', 'Treat STATIC like a release floor for IP, premieres, characters, channels, games, and drops.', '/studio', 'Open command'],
  ['Partner', 'Start with the public tour, then contact STATIC for serious private conversations.', '/contact', 'Open channel'],
]

const roadmapGates = [
  ['Now', 'The Arrival District is open as the public front door: watch the city signal, tap venues, take the tour, and join STATIC Social.', 'Public'],
  ['Next', 'Creators and early testers enter deeper profile, creation, and world-building systems as the rollout expands.', 'Access list'],
  ['Then', 'Studios, performers, builders, and partners begin shaping venues, drops, shows, events, properties, and live moments.', 'Pilot wave'],
  ['Future', 'The city grows from guided web arrival into high-fidelity traversal, avatars, vehicles, interiors, NPCs, and multiplayer presence.', 'Engine layer'],
]

const cityAccessSignals = [
  ['The trailer becomes the invitation', 'A full cinematic city reveal belongs in the signal theater, not as a forced loading wall. Visitors land inside the world and choose how deep they want to go.'],
  ['The district stays public', 'The Arrival District should excite people immediately. The access gate protects deeper systems while the public can still see what STATIC is becoming.'],
  ['The site is the official home', 'thestaticnetwork.com should hold the whole brand: STATIC Social, built-in creation engines, Channels, Marketplace, and the game-world client path.'],
  ['The city goes beyond the browser', 'Posts, Channels, Radio, image generation, music, music videos, video, small games, blueprints, assets, properties, companions, The Fields, and STATIC Universe all point toward PC, console, Steam, and VR clients.'],
]

const launchStats = [
  ['SOCIAL', 'available now'],
  ['CREATE', 'engines coming soon'],
  ['BLUEPRINTS', 'saved for the game'],
  ['GAME', 'client coming soon'],
]

const launchPromises = [
  ['Post The Work', 'Images, videos, music, prompts, characters, assets, worlds, and experiments made by or with AI.'],
  ['Create Inside STATIC', 'Music, images, videos, music videos, small-scale games, drops, assets, and blueprints are planned as native creation tools.'],
  ['Grow Signal', 'Posts and unique followers earn 100. Comments and likes earn 10. Shares earn 20. Reputation starts now.'],
  ['Carry It Forward', 'Your STATIC login is designed to move identity, Signal, creations, blueprints, assets, and follows into the future game.'],
]

const accessReasons = [
  'City-scale public reveal',
  'Creator profile and future identity paths',
  'Trailer-first campaign hub',
  'Future PC, console, Steam, and VR direction',
]

export default function PortalGatePage({ requestedPath = '' }) {
  const { navigate } = useRouter()
  const [activeVenueId, setActiveVenueId] = useState('signals')
  const [portalOpening, setPortalOpening] = useState(false)
  const [portalEntered, setPortalEntered] = useState(false)
  const [cinemaOpen, setCinemaOpen] = useState(false)
  const [travelVenue, setTravelVenue] = useState(null)
  const [worldPrototypeOpen, setWorldPrototypeOpen] = useState(false)
  const restrictedPath = requestedPath && requestedPath !== '/' && requestedPath !== '/request-access'
  const activeVenue = publicDistrictVenues.find((venue) => venue.id === activeVenueId) || publicDistrictVenues[0]
  const worldSnapshot = useMemo(() => createWorldEngineSnapshot(activeVenue.id), [activeVenue.id])

  useEffect(() => {
    const bridge = mountWorldEnginePreview({
      mountId: 'static-world-engine-mount',
      snapshot: worldSnapshot,
    })
    return () => bridge.unmount()
  }, [worldSnapshot])

  function selectVenue(venue) {
    setActiveVenueId(venue.id)
  }

  function startVenueTravel(venue) {
    setActiveVenueId(venue.id)
    setTravelVenue(venue)
  }

  function openWorldPrototype() {
    setCinemaOpen(false)
    setTravelVenue(null)
    setWorldPrototypeOpen(true)
  }

  function handlePublicTour() {
    setCinemaOpen(false)
    startDistrictTour()
  }

  function enterStatic() {
    if (portalOpening || portalEntered) return
    playPortalCharge()
    sessionStorage.setItem('static_gate_entered', '1')
    sessionStorage.setItem('static_gate_transition', '1')
    setPortalOpening(true)
    window.setTimeout(() => setPortalEntered(true), 820)
    window.setTimeout(() => navigate('/feed'), 1240)
  }

  function completeVenueTravel() {
    if (!travelVenue) return
    const destination = travelVenue.route
    setTravelVenue(null)
    navigate(destination)
  }

  function enterDistrictFromCinema() {
    setCinemaOpen(false)
  }

  function startDistrictTour() {
    setCinemaOpen(false)
    setActiveVenueId('signals')
    document.getElementById('request-access')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="portal-gate" data-engine-scene={worldSnapshot.sceneId} data-engine-mode={worldSnapshot.status.mode}>
      <RouteSEO
        path="/"
        title="STATIC Network | Official Home"
        description="The official home for everything STATIC: STATIC Social, the coming creation engines, and the future STATIC City game client."
      />
      <PortalEnvironment>
        <header className="portal-gate__nav">
          <Link className="portal-wordmark" to="/" aria-label="STATIC Network arrival district">
            <StaticBrandMark />
            <span>STATIC</span>
            <small>NETWORK</small>
          </Link>
          <div className="portal-gate__state"><i /><span>ARRIVAL DISTRICT / CITY ACCESS LAYER</span></div>
          <Link className="portal-gate__login" to="/login">Login</Link>
        </header>

        <main className={`portal-gate__main ${portalEntered ? 'portal-gate__main--entered' : ''}`}>
          <section className={`static-entry-portal ${portalOpening || portalEntered ? 'is-entered' : ''}`} aria-label="Enter STATIC Network">
            <div className="static-entry-portal__backdrop" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="static-entry-portal__whiteout" aria-hidden="true" />
            <div className="static-entry-portal__portal">
              <div className="static-entry-portal__rings">
                <i />
                <i />
                <i />
              </div>
              <button
                className="static-entry-portal__mark"
                type="button"
                onClick={enterStatic}
                aria-label="Enter STATIC"
                disabled={portalOpening || portalEntered}
              >
                <StaticBrandMark className="static-brand-mark--base" />
                <StaticBrandMark className="static-brand-mark--gate static-brand-mark--gate-left" />
                <StaticBrandMark className="static-brand-mark--gate static-brand-mark--gate-right" />
                <span className="static-entry-portal__gate-label">Enter STATIC</span>
              </button>
            </div>
            <div className="static-entry-portal__copy">
              <span>Tap the mark to enter</span>
            </div>
          </section>

          {portalEntered && (
            <div className="portal-reveal-stack" id="static-reveal">
              <section className="static-reveal" aria-label="STATIC City reveal">
                <div className="static-reveal__copy">
                  <span>STATIC NETWORK / OFFICIAL HOME</span>
                  <h2>STATIC Social is the app. Creation is the engine. The city comes next.</h2>
                  <p>STATIC Network is the umbrella for every STATIC product. Start with STATIC Social: post AI-made work, discover creators, build Channels, grow Signal, and prepare for built-in tools that generate music, images, videos, music videos, small games, assets, and reusable game blueprints.</p>
                  <div className="static-reveal__stats" aria-label="STATIC launch scale targets">
                    {launchStats.map(([value, label]) => (
                      <small key={label}><b>{value}</b>{label}</small>
                    ))}
                  </div>
                  <div className="static-reveal__actions">
                    <Link className="portal-button portal-button--primary" to="/feed">Enter The Feed</Link>
                    <Link className="portal-button portal-button--ghost" to="/signup">Create Profile</Link>
                    <button className="portal-button portal-button--ghost" type="button" onClick={() => setCinemaOpen(true)}>
                      Watch The Future Trailer
                    </button>
                  </div>
                </div>
                <LaunchTrailerStage onExpand={() => setCinemaOpen(true)} />
              </section>

              <section className="static-promise-grid" aria-label="STATIC world promise">
                {launchPromises.map(([title, copy]) => (
                  <article key={title}>
                    <span />
                    <h2>{title}</h2>
                    <p>{copy}</p>
                  </article>
                ))}
              </section>

              <section className="portal-hero" aria-label="STATIC Arrival District">
                <h1 className="sr-only">STATIC Network Arrival District</h1>

                <ArrivalCinematicMode open={cinemaOpen} onClose={() => setCinemaOpen(false)} onEnter={enterDistrictFromCinema} />
                <TravelToVenueOverlay venue={travelVenue} onCancel={() => setTravelVenue(null)} onComplete={completeVenueTravel} />
                {ownerPrototypeEnabled && worldPrototypeOpen && (
                  <Suspense fallback={<div className="world-engine-loading">Booting STATIC world prototype...</div>}>
                    <StaticWorldEngine
                      snapshot={worldSnapshot}
                      activeVenueId={activeVenue.id}
                      onExit={() => setWorldPrototypeOpen(false)}
                      onSelectVenue={(venue) => setActiveVenueId(venue.id)}
                      onTravelToVenue={(venue) => {
                        setWorldPrototypeOpen(false)
                        startVenueTravel(venue)
                      }}
                      onSummonSage={() => setWorldPrototypeOpen(false)}
                    />
                  </Suspense>
                )}

                <figure
                  className="district-scene"
                  aria-label="STATIC arrival district with venues, billboards, creators, and fans"
                  data-engine-mount="arrival-district"
                  data-active-venue={activeVenue.id}
                >
                  <img src="/assets/static-arrival-district.png" alt="" />
                  <div id="static-world-engine-mount" className="district-engine-mount" aria-hidden="true" />
                  <div className="district-motion-layer" aria-hidden="true">
                    <span className="district-motion district-motion--tower" />
                    <span className="district-motion district-motion--static-sign" />
                    <span className="district-motion district-motion--club" />
                    <span className="district-motion district-motion--sweep" />
                    <span className="district-motion district-motion--crowd" />
                    <span className="district-motion district-motion--rain" />
                    <span className="district-motion district-motion--ad district-motion--ad-left" data-copy="LIVE PREMIERE" />
                    <span className="district-motion district-motion--ad district-motion--ad-center" data-copy="CREATOR DROP" />
                    <span className="district-motion district-motion--ad district-motion--ad-right" data-copy="PLAY WORLDS" />
                    <span className="district-motion district-motion--vehicle-trails" />
                    <span className="district-motion district-motion--street-reflection" />
                    <span className="district-motion district-motion--drone-lights" />
                  </div>
                  <DistrictMotionLayers />
                  <figcaption>STATIC Arrival District / public access preview</figcaption>
                  <DistrictAmbience />
                  <nav className="district-hotspots" aria-label="Explore the STATIC arrival district">
                    {publicDistrictVenues.map((venue) => (
                      <button
                        className={`district-hotspot ${venue.hotspotClass} ${activeVenue.id === venue.id ? 'is-active' : ''}`}
                        type="button"
                        onClick={() => selectVenue(venue)}
                        data-engine-venue={venue.id}
                        data-engine-zone={venue.engine.zone}
                        data-engine-camera={venue.engine.camera}
                        style={{
                          '--engine-x': `${venue.engine.spawn.x}%`,
                          '--engine-y': `${venue.engine.spawn.y}%`,
                        }}
                        key={venue.id}
                      >
                        <span>{venue.name}</span>
                        <small>{venue.eyebrow}</small>
                      </button>
                    ))}
                  </nav>
                  <nav className="district-entry-actions" aria-label="Primary district entry actions">
                    <Link className="portal-button portal-button--primary" to="/signup">Join STATIC Social</Link>
                    <button className="portal-button portal-button--ghost" type="button" onClick={handlePublicTour}>Take The Tour</button>
                  </nav>
                </figure>

                <section className="district-mobile-venues" aria-label="STATIC district mobile venue cards">
                  <span>DISTRICT VENUES / TAP TO PREVIEW</span>
                  <div>
                    {publicDistrictVenues.map((venue) => (
                      <button className={activeVenue.id === venue.id ? 'is-active' : ''} type="button" onClick={() => selectVenue(venue)} key={venue.id}>
                        <b>{venue.name}</b>
                        <small>{venue.eyebrow}</small>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="district-venue-panel" aria-live="polite">
                  <span>{activeVenue.eyebrow}</span>
                  <h2>{activeVenue.name}</h2>
                  <p>{activeVenue.copy}</p>
                  <div className="district-venue-panel__status">
                    <b>{activeVenue.status}</b>
                    <em>{activeVenue.metric}</em>
                  </div>
                  <div className="district-venue-panel__unlocks">
                    {activeVenue.unlocks.map((item) => <small key={item}>{item}</small>)}
                  </div>
                  <div className="district-venue-panel__engine" aria-label="STATIC venue access details">
                    <small>DISTRICT ACCESS</small>
                    <b>{activeVenue.engine.zone}</b>
                    <em>{activeVenue.route.toUpperCase()}</em>
                  </div>
                  <div className="district-venue-panel__actions">
                    <button className="portal-button portal-button--primary" type="button" onClick={() => startVenueTravel(activeVenue)}>
                      Travel to venue <ArrowIcon />
                    </button>
                    <Link className="portal-button portal-button--ghost" to="/my-signal">
                      Follow in My Signal
                    </Link>
                  </div>
                </section>

                <section className="district-pathfinder" aria-label="STATIC entry paths">
                  {districtPaths.map(([label, copy, route]) => (
                    <Link to={route} key={label}>
                      <span>{label}</span>
                      <p>{copy}</p>
                      <ArrowIcon />
                    </Link>
                  ))}
                </section>

                <section className="district-world-stack" aria-label="STATIC platform loops">
                  <div className="district-world-stack__lead">
                    <span>STATIC CITY / NETWORK GRAVITY</span>
                    <h2>The website is the network. The world is the product.</h2>
                    <p>This public layer should sell the scale fast, capture access, and make people understand the bigger path: AI social now, persistent identity, media, games, properties, companions, The Fields, and the eventual game client.</p>
                    <div className="district-value-metrics" aria-label="STATIC current platform metrics">
                      {districtMetrics.map(([value, label]) => (
                        <small key={label}><b>{value}</b>{label}</small>
                      ))}
                    </div>
                  </div>
                  <div className="district-loop-grid">
                    {districtLoops.map(([title, copy, route]) => (
                      <Link to={route} key={title}>
                        <b>{title}</b>
                        <p>{copy}</p>
                        <ArrowIcon />
                      </Link>
                    ))}
                  </div>
                  <div className="district-moment-board">
                    <span>TONIGHT IN THE DISTRICT</span>
                    {districtMoments.map(([time, place, copy]) => (
                      <article key={`${time}-${place}`}>
                        <b>{time}</b>
                        <div>
                          <strong>{place}</strong>
                          <p>{copy}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="district-proof-grid" aria-label="STATIC platform proof layers">
                  <div>
                    <span>WHY THIS HITS DIFFERENT</span>
                    <h2>Eight layers. One city-scale network.</h2>
                    <p>STATIC is built to feel less like clicking through pages and more like entering culture: identity, media, worlds, creation, live moments, gameplay, and ownership all reinforcing each other.</p>
                  </div>
                  {platformProofs.map(([code, title, copy]) => (
                    <article key={code}>
                      <span>{code}</span>
                      <h3>{title}</h3>
                      <p>{copy}</p>
                    </article>
                  ))}
                </section>

                <section className="district-command-floor" aria-label="STATIC role tracks and build gates">
                  <div className="district-command-floor__intro">
                    <span>COMMAND FLOOR / WHO ENTERS FIRST</span>
                    <h2>Every visitor needs a role, a reason, and a next move.</h2>
                    <p>The reveal page creates the first hit of awe. The Arrival District gives people proof they can explore. Access requests tell us who is ready to build when deeper systems open.</p>
                  </div>
                  <div className="district-role-grid">
                    {roleTracks.map(([title, copy, route, action]) => (
                      <Link to={route} key={title}>
                        <span>{title}</span>
                        <p>{copy}</p>
                        <b>{action}<ArrowIcon /></b>
                      </Link>
                    ))}
                  </div>
                  <div className="district-roadmap-grid">
                    {roadmapGates.map(([phase, copy, status]) => (
                      <article key={phase}>
                        <b>{phase}</b>
                        <p>{copy}</p>
                        <small>{status}</small>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="district-engine-readiness" aria-label="STATIC city access signals">
                  <div>
                    <span>CITY ACCESS / WHAT OPENS NEXT</span>
                    <h2>The trailer is the spark. The city is the promise.</h2>
                    <p>The public layer should make STATIC feel alive now, then pull serious creators into the deeper rollout when they are ready to build, perform, play, own, and return.</p>
                  </div>
                  <div>
                    {cityAccessSignals.map(([title, copy]) => (
                      <article key={title}>
                        <b>{title}</b>
                        <p>{copy}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <aside className="portal-orbital-console" aria-label="STATIC access status">
                  <div><span>VENUE</span><strong>CLUBSTATIC</strong></div>
                  <div><span>ACCESS</span><strong>CONTROLLED</strong></div>
                  <div><span>STATUS</span><strong>SOCIAL LIVE</strong></div>
                  <p>The public feed is open. The deeper STATIC City systems are opening to creators, studios, builders, performers, and early explorers in phases.</p>
                </aside>
              </section>

              <section className="portal-access" id="request-access" aria-labelledby="portal-access-title">
                <div className="portal-section-copy portal-access__copy">
                  <span>REQUEST ACCESS / FIRST SIGNAL</span>
                  <h2 id="portal-access-title">Request your city pass.</h2>
                  <p>Join the first access list for STATIC City. Early creators and builders receive updates as creator systems, account features, private venues, and deeper world layers open.</p>
                  <div className="portal-access__reasons" aria-label="Why request STATIC access">
                    {accessReasons.map((reason) => <span key={reason}>{reason}</span>)}
                  </div>
                  <div className="portal-soft-gate" aria-label="STATIC beta access note">
                    <b>Controlled access active</b>
                    <p>The Arrival District and guided tour stay public. Creator tools, property systems, avatar creation, private rooms, world previews, and advanced access open in planned phases.</p>
                    {ownerPrototypeEnabled && <button type="button" onClick={openWorldPrototype}>Owner prototype preview</button>}
                  </div>
                  {restrictedPath && <small>That destination is opening in phases.</small>}
                </div>
                <BetaRequestForm />
              </section>
            </div>
          )}
        </main>

        <footer className="portal-gate__footer">
          <span>© {new Date().getFullYear()} STATIC Network</span>
          <nav aria-label="Public district links">
            <Link to="/contact">Contact</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
          <span>LOS ANGELES / EVERYWHERE</span>
        </footer>
      </PortalEnvironment>
    </div>
  )
}

function DistrictTrailerConsole({ onExpand }) {
  const [activeClipId, setActiveClipId] = useState(arrivalCinemaClips[0]?.id || '')
  const reducedMotion = usePrefersReducedMotion()
  const activeClip = arrivalCinemaClips.find((clip) => clip.id === activeClipId) || arrivalCinemaClips[0]

  if (!activeClip) return null

  return (
    <aside className="district-trailer-console" aria-label="STATIC City trailer screen">
      <div className="district-trailer-console__rig" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="district-trailer-console__header">
        <span>STATIC CITY / SIGNAL THEATER 01</span>
        <b>PUBLIC SIGNAL THEATER</b>
      </div>
      <div className="district-trailer-console__screen">
        <video
          key={activeClip.src}
          src={activeClip.src}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="district-trailer-console__lower">
          <span>SCENE 0{arrivalCinemaClips.findIndex((clip) => clip.id === activeClip.id) + 1} / ARRIVAL DISTRICT</span>
          <strong>{activeClip.label}</strong>
          <small>{activeClip.caption}</small>
        </div>
      </div>
      <div className="district-trailer-console__copy">
        <span>FIRST LOOK SIGNAL</span>
        <b>Watch the city wake up.</b>
        <p>Arrival, Signals, Radio Rooftop, PLAY, Market Walk, Wondercore, The Fields, STATIC Island, tunnels, Gophurs, and city-scale creation.</p>
        <div className="district-trailer-console__controls">
          {arrivalCinemaClips.map((clip, index) => (
            <button
              className={clip.id === activeClip.id ? 'is-active' : ''}
              type="button"
              onClick={() => setActiveClipId(clip.id)}
              key={clip.id}
            >
              0{index + 1}
            </button>
          ))}
          <button type="button" onClick={onExpand}>Full Screen</button>
        </div>
      </div>
    </aside>
  )
}

function StaticBrandMark({ className = '' }) {
  return (
    <span className={`static-brand-mark ${className}`} aria-hidden="true">
      <img src={STATIC_MARK_ASSET} alt="" decoding="async" />
    </span>
  )
}

function LaunchTrailerStage({ onExpand }) {
  const [activeClipId, setActiveClipId] = useState(arrivalCinemaClips[0]?.id || '')
  const reducedMotion = usePrefersReducedMotion()
  const activeClip = arrivalCinemaClips.find((clip) => clip.id === activeClipId) || arrivalCinemaClips[0]

  if (!activeClip) return null

  return (
    <aside className="launch-trailer-stage" aria-label="STATIC City reveal trailer">
      <div className="launch-trailer-stage__chrome" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="launch-trailer-stage__screen">
        <video
          key={activeClip.src}
          src={activeClip.src}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="launch-trailer-stage__hud">
          <span>STATIC SIGNAL TRAILER</span>
          <strong>{activeClip.label}</strong>
          <small>{activeClip.caption}</small>
        </div>
      </div>
      <div className="launch-trailer-stage__controls">
        {arrivalCinemaClips.map((clip, index) => (
          <button
            className={clip.id === activeClip.id ? 'is-active' : ''}
            type="button"
            onClick={() => setActiveClipId(clip.id)}
            key={clip.id}
          >
            Shot 0{index + 1}
          </button>
        ))}
        <button type="button" onClick={onExpand}>Full Trailer</button>
      </div>
    </aside>
  )
}

function ArrivalCinematicMode({ open, onClose, onEnter }) {
  const [clipIndex, setClipIndex] = useState(0)
  const [switching, setSwitching] = useState(false)
  const switchTimerRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()
  const activeClip = arrivalCinemaClips[clipIndex] || arrivalCinemaClips[0]

  useEffect(() => {
    if (open) {
      setClipIndex(0)
      setSwitching(false)
    }
  }, [open])

  useEffect(() => () => {
    if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current)
  }, [])

  function advance() {
    if (clipIndex < arrivalCinemaClips.length - 1) {
      if (switching) return
      setSwitching(true)
      switchTimerRef.current = window.setTimeout(() => {
        setClipIndex((current) => Math.min(current + 1, arrivalCinemaClips.length - 1))
        setSwitching(false)
      }, reducedMotion ? 0 : 620)
      return
    }
    onClose()
  }

  if (!open) return null

  return (
    <section className={`arrival-cinema ${switching ? 'is-switching' : ''}`} aria-label="STATIC cinematic arrival">
      <video
        className="arrival-cinema__video"
        key={activeClip.src}
        src={activeClip.src}
        autoPlay={!reducedMotion}
        muted
        playsInline
        preload="metadata"
        onEnded={advance}
        onError={advance}
      />
      <div className="arrival-cinema__veil" aria-hidden="true" />
      <div className="arrival-cinema__hud">
        <span>{activeClip.label}</span>
        <h2>Arrive. Connect. Live.</h2>
        <p>{activeClip.caption}</p>
        <div className="arrival-cinema__progress" aria-label="Arrival cinema progress">
          {arrivalCinemaClips.map((clip, index) => (
            <i className={index === clipIndex ? 'is-active' : ''} key={clip.src} />
          ))}
        </div>
      </div>
      <div className="arrival-cinema__actions">
        <button type="button" onClick={onEnter}>Enter STATIC</button>
        <button type="button" onClick={advance}>Next Shot</button>
      </div>
    </section>
  )
}

function TravelToVenueOverlay({ venue, onCancel, onComplete }) {
  const [clipIndex, setClipIndex] = useState(0)
  const [switching, setSwitching] = useState(false)
  const completeRef = useRef(onComplete)
  const switchTimerRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()
  const activeClip = arrivalCinemaClips[clipIndex] || arrivalCinemaClips[0]

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!venue) return undefined
    setClipIndex(0)
    setSwitching(false)
    if (!reducedMotion) return undefined
    const timer = window.setTimeout(() => completeRef.current(), 1700)
    return () => window.clearTimeout(timer)
  }, [reducedMotion, venue])

  useEffect(() => () => {
    if (switchTimerRef.current) window.clearTimeout(switchTimerRef.current)
  }, [])

  if (!venue) return null

  function advance() {
    if (clipIndex < arrivalCinemaClips.length - 1) {
      if (switching) return
      setSwitching(true)
      switchTimerRef.current = window.setTimeout(() => {
        setClipIndex((current) => Math.min(current + 1, arrivalCinemaClips.length - 1))
        setSwitching(false)
      }, reducedMotion ? 0 : 620)
      return
    }
    onComplete()
  }

  return (
    <section className={`venue-travel ${switching ? 'is-switching' : ''}`} aria-label={`Traveling to ${venue.name}`}>
      <video
        className="venue-travel__video"
        key={`${venue.id}-${activeClip.src}`}
        src={activeClip.src}
        autoPlay={!reducedMotion}
        muted
        playsInline
        preload="metadata"
        onEnded={advance}
        onError={onComplete}
      />
      <div className="venue-travel__map" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="venue-travel__copy">
        <span>TRAVEL MODE // V1 CINEMATIC ROUTE</span>
        <h2>{venue.name}</h2>
        <p>{venueTravelScript[venue.id] || 'Moving through the Arrival District.'}</p>
        <small>Future build: controlled Entity movement, vehicles, NPCs, crowd presence, skins, concerts, and live venue state.</small>
      </div>
      <div className="venue-travel__actions">
        <button type="button" onClick={onComplete}>Arrive Now</button>
        <button type="button" onClick={onCancel}>Stay In District</button>
      </div>
    </section>
  )
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)

    function handleChange(event) {
      setReducedMotion(event.matches)
    }

    if (media.addEventListener) {
      media.addEventListener('change', handleChange)
      return () => media.removeEventListener('change', handleChange)
    }
    media.addListener(handleChange)
    return () => media.removeListener(handleChange)
  }, [])

  return reducedMotion
}

function DistrictAmbience() {
  const audioRef = useRef(null)
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem('static_district_ambience') !== 'muted'
    } catch {
      return true
    }
  })
  const [audioState, setAudioState] = useState(enabled ? 'armed' : 'muted')

  useEffect(() => {
    try {
      localStorage.setItem('static_district_ambience', enabled ? 'on' : 'muted')
    } catch {
      // Local storage can be unavailable in private browser contexts.
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      stopDistrictAmbience(audioRef.current)
      audioRef.current = null
      setAudioState('muted')
      return undefined
    }

    let cancelled = false
    setAudioState('armed')

    async function startAmbience() {
      try {
        if (!audioRef.current) audioRef.current = createDistrictAmbience()
        await audioRef.current.context.resume()
        if (!cancelled) setAudioState('live')
      } catch {
        if (!cancelled) setAudioState('armed')
      }
    }

    startAmbience()
    window.addEventListener('pointerdown', startAmbience, { passive: true })
    window.addEventListener('keydown', startAmbience)

    return () => {
      cancelled = true
      window.removeEventListener('pointerdown', startAmbience)
      window.removeEventListener('keydown', startAmbience)
    }
  }, [enabled])

  const label = audioState === 'live' ? 'LIVE' : audioState === 'muted' ? 'MUTED' : 'ARMED'

  return (
    <button
      className="district-ambience"
      type="button"
      data-state={audioState}
      onClick={() => setEnabled((current) => !current)}
      aria-pressed={enabled}
      aria-label={`District city audio ${label.toLowerCase()}`}
    >
      <span>City audio</span>
      <b>{label}</b>
      <small>{audioState === 'armed' ? 'Starts on first tap' : 'Synthetic street bed'}</small>
    </button>
  )
}

function playPortalCharge() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const context = new AudioContext()
    const master = context.createGain()
    const hum = context.createOscillator()
    const spark = createNoiseSource(context, 1.2)
    const sparkFilter = context.createBiquadFilter()
    const sparkGain = context.createGain()
    const overtone = context.createOscillator()
    const overtoneGain = context.createGain()

    master.gain.setValueAtTime(0.0001, context.currentTime)
    master.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.05)
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.35)
    master.connect(context.destination)

    hum.type = 'sawtooth'
    hum.frequency.setValueAtTime(52, context.currentTime)
    hum.frequency.exponentialRampToValueAtTime(122, context.currentTime + 0.72)
    hum.connect(master)

    overtone.type = 'triangle'
    overtone.frequency.setValueAtTime(210, context.currentTime)
    overtone.frequency.exponentialRampToValueAtTime(680, context.currentTime + 0.5)
    overtoneGain.gain.setValueAtTime(0.0001, context.currentTime)
    overtoneGain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.12)
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.05)
    overtone.connect(overtoneGain).connect(master)

    sparkFilter.type = 'bandpass'
    sparkFilter.frequency.setValueAtTime(2100, context.currentTime)
    sparkFilter.frequency.exponentialRampToValueAtTime(5200, context.currentTime + 0.72)
    sparkFilter.Q.setValueAtTime(3.6, context.currentTime)
    sparkGain.gain.setValueAtTime(0.0001, context.currentTime)
    sparkGain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.2)
    sparkGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.08)
    spark.connect(sparkFilter).connect(sparkGain).connect(master)

    hum.start()
    overtone.start()
    spark.start()
    window.setTimeout(() => {
      ;[hum, overtone, spark].forEach((node) => {
        try {
          node.stop()
        } catch {
          // Short one-shot sound; nodes may already be stopped.
        }
      })
      context.close().catch(() => {})
    }, 1450)
  } catch {
    // Portal entry still works without Web Audio support.
  }
}

function createDistrictAmbience() {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) throw new Error('Web Audio is unavailable.')

  const context = new AudioContext()
  const master = context.createGain()
  master.gain.setValueAtTime(0.0001, context.currentTime)
  master.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 1.8)
  master.connect(context.destination)

  const rumble = context.createOscillator()
  const rumbleFilter = context.createBiquadFilter()
  const rumbleGain = context.createGain()
  rumble.type = 'sine'
  rumble.frequency.setValueAtTime(42, context.currentTime)
  rumbleFilter.type = 'lowpass'
  rumbleFilter.frequency.setValueAtTime(105, context.currentTime)
  rumbleGain.gain.setValueAtTime(0.16, context.currentTime)
  rumble.connect(rumbleFilter).connect(rumbleGain).connect(master)
  rumble.start()

  const crowd = createNoiseSource(context, 4)
  const crowdFilter = context.createBiquadFilter()
  const crowdGain = context.createGain()
  crowdFilter.type = 'bandpass'
  crowdFilter.frequency.setValueAtTime(620, context.currentTime)
  crowdFilter.Q.setValueAtTime(0.52, context.currentTime)
  crowdGain.gain.setValueAtTime(0.06, context.currentTime)
  crowd.connect(crowdFilter).connect(crowdGain).connect(master)
  crowd.start()

  const traffic = createNoiseSource(context, 3)
  const trafficFilter = context.createBiquadFilter()
  const trafficGain = context.createGain()
  trafficFilter.type = 'highpass'
  trafficFilter.frequency.setValueAtTime(900, context.currentTime)
  trafficGain.gain.setValueAtTime(0.025, context.currentTime)
  traffic.connect(trafficFilter).connect(trafficGain).connect(master)
  traffic.start()

  const neon = context.createOscillator()
  const neonGain = context.createGain()
  const neonLfo = context.createOscillator()
  const neonLfoGain = context.createGain()
  neon.type = 'triangle'
  neon.frequency.setValueAtTime(185, context.currentTime)
  neonGain.gain.setValueAtTime(0.028, context.currentTime)
  neonLfo.frequency.setValueAtTime(0.12, context.currentTime)
  neonLfoGain.gain.setValueAtTime(0.016, context.currentTime)
  neonLfo.connect(neonLfoGain).connect(neonGain.gain)
  neon.connect(neonGain).connect(master)
  neon.start()
  neonLfo.start()

  return {
    context,
    nodes: [master, rumble, rumbleFilter, rumbleGain, crowd, crowdFilter, crowdGain, traffic, trafficFilter, trafficGain, neon, neonGain, neonLfo, neonLfoGain],
  }
}

function createNoiseSource(context, seconds) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate)
  const channel = buffer.getChannelData(0)
  let last = 0
  for (let index = 0; index < channel.length; index += 1) {
    last = last * 0.92 + (Math.random() * 2 - 1) * 0.08
    channel[index] = last
  }
  const source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}

function stopDistrictAmbience(graph) {
  if (!graph) return
  graph.nodes.forEach((node) => {
    try {
      if (typeof node.stop === 'function') node.stop()
    } catch {
      // Oscillators can only be stopped once.
    }
    try {
      node.disconnect()
    } catch {
      // Some nodes may already be disconnected by browser cleanup.
    }
  })
  graph.context.close().catch(() => {})
}
