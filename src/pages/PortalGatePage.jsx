import { useEffect, useMemo, useRef, useState } from 'react'
import { BetaRequestForm } from '../components/Forms'
import { Link, RouteSEO, useRouter } from '../components/Router'
import { ArrowIcon, SignalMark } from '../components/UI'
import DistrictMotionLayers from '../components/portal/DistrictMotionLayers'
import { PortalEnvironment, PortalZoneMap } from '../components/portal/PortalEnvironment'
import { useSage } from '../context/SageContext'
import { createWorldEngineSnapshot, mountWorldEnginePreview } from '../lib/worldEngine/engineBridge'
import {
  arrivalCinemaClips,
  districtVenues,
  venueTravelScript,
  worldEngineReadiness,
} from '../lib/worldEngine/districtManifest'

const districtPaths = [
  ['For fans', 'Watch, listen, play, follow venues, and build a My Signal pulse.', '/my-signal'],
  ['For creators', 'Create an Entity, open a Channel, transmit Signals, and build worlds.', '/entities/create'],
  ['For studios', 'Use Studio as the command floor for releases, formats, worlds, and drops.', '/studio'],
  ['For partners', 'Open a private channel when the conversation needs more than the public tour.', '/contact'],
]

const districtLoops = [
  ['Watch', 'Signals, Originals, Live rooms, Channel premieres', '/signals'],
  ['Hear', 'Radio stations, entity voices, music drops, audio worlds', '/radio'],
  ['Play', 'Prompted worlds, arcade concepts, remixable game systems', '/play'],
  ['Create', 'Studio projects, Entities, Channels, release systems', '/studio'],
  ['Own', 'Drops, memberships, templates, skins, marketplace intent', '/marketplace'],
  ['Return', 'My Signal, follows, reminders, saved worlds, S.A.G.E.', '/my-signal'],
]

const districtMoments = [
  ['Now', 'Signal Boulevard', 'A creator drops a world teaser and starts pulling followers into their Channel.'],
  ['Next', 'Broadcast Arena', 'A live premiere room warms up with reminders, comments, and future ticketing intent.'],
  ['Tonight', 'Rooftop Radio', 'A station takeover sets the sound of the district while users browse venues.'],
  ['Build', 'Creation Tower', 'A creator saves a PLAY concept, a show treatment, and a drop plan from one workspace.'],
  ['Drop', 'Asset Boulevard', 'Fans save skins, memberships, templates, and access passes before payments go live.'],
]

const platformProofs = [
  ['01', 'Identity layer', 'Entities give every creator, character, studio, and world a persistent public face.'],
  ['02', 'Social layer', 'Signals and My Signal turn discovery into follows, return behavior, and network memory.'],
  ['03', 'Media layer', 'Video, audio, live, radio, originals, and feed cards exist as one entertainment surface.'],
  ['04', 'Game layer', 'STATIC PLAY creates the bridge from watching content into entering playable worlds.'],
  ['05', 'Creator layer', 'Studio connects prompts, projects, releases, Channels, drops, and future provider jobs.'],
  ['06', 'Economy layer', 'Marketplace intent comes before payments: save, request, follow, collect, and unlock.'],
  ['07', 'Guide layer', 'S.A.G.E. explains the network, routes visitors, and becomes the future operator surface.'],
  ['08', 'Cloud layer', 'Supabase sync path moves local prototype actions toward account-owned network state.'],
]

const districtMetrics = [
  ['8', 'public venues'],
  ['6', 'return loops'],
  ['4', 'entry paths'],
  ['0', 'fake backends'],
]

const roleTracks = [
  ['Fan', 'Follow creators, save venues, tune radio, join live rooms, and build a personal My Signal feed.', '/my-signal', 'Start watching'],
  ['Creator', 'Claim an Entity, open a Channel, publish Signals, plan drops, and build worlds in Studio.', '/entities/create', 'Create identity'],
  ['Studio', 'Treat STATIC like a release floor for IP, premieres, characters, channels, games, and drops.', '/studio', 'Open command'],
  ['Partner', 'Start with the public tour, then contact STATIC for serious private conversations.', '/contact', 'Open channel'],
]

const roadmapGates = [
  ['Now', 'Public world, route network, local creation loops, Supabase sync path, and reviewable world preview.', 'Visible today'],
  ['Next', 'Authenticated profiles, public reads, creator onboarding, saved media, follows, and safer account state.', 'Build gate'],
  ['Then', 'Provider jobs for voice, video, image, music, uploads, moderation, and live programming.', 'API gate'],
  ['Later', 'Playable world engine, avatar presence, multiplayer rooms, creator monetization, and marketplace transactions.', 'Platform gate'],
]

export default function PortalGatePage({ requestedPath = '' }) {
  const sage = useSage()
  const { navigate } = useRouter()
  const [activeVenueId, setActiveVenueId] = useState('signals')
  const [cinemaOpen, setCinemaOpen] = useState(true)
  const [travelVenue, setTravelVenue] = useState(null)
  const restrictedPath = requestedPath && requestedPath !== '/' && requestedPath !== '/request-access'
  const activeVenue = districtVenues.find((venue) => venue.id === activeVenueId) || districtVenues[0]
  const worldSnapshot = useMemo(() => createWorldEngineSnapshot(activeVenue.id), [activeVenue.id])

  useEffect(() => {
    const bridge = mountWorldEnginePreview({
      mountId: 'static-world-engine-mount',
      snapshot: worldSnapshot,
    })
    return () => bridge.unmount()
  }, [worldSnapshot])

  function selectVenue(venue) {
    if (venue.id === 'sage') {
      sage.summonArrivalIntro?.()
      return
    }
    setActiveVenueId(venue.id)
  }

  function startVenueTravel(venue) {
    if (venue.id === 'sage') {
      sage.summonArrivalIntro?.()
      return
    }
    setActiveVenueId(venue.id)
    setTravelVenue(venue)
  }

  function completeVenueTravel() {
    if (!travelVenue) return
    const destination = travelVenue.route
    setTravelVenue(null)
    navigate(destination)
  }

  async function enterDistrictFromCinema() {
    setCinemaOpen(false)
    await sage.summonArrivalIntro?.()
  }

  function startDistrictTour() {
    setCinemaOpen(false)
    sage.startTour?.()
  }

  return (
    <div className="portal-gate" data-engine-scene={worldSnapshot.sceneId} data-engine-mode={worldSnapshot.status.mode}>
      <RouteSEO
        path="/"
        title="STATIC Network | Arrival District"
        description="Explore the STATIC Network Arrival District and request early access to the AI-native entertainment world."
      />
      <PortalEnvironment>
        <header className="portal-gate__nav">
          <Link className="portal-wordmark" to="/" aria-label="STATIC Network arrival district">
            <SignalMark animated />
            <span>STATIC</span>
            <small>NETWORK</small>
          </Link>
          <div className="portal-gate__state"><i /><span>ARRIVAL DISTRICT / PUBLIC PREVIEW</span></div>
          <Link className="portal-gate__login" to="/login">Operator Login</Link>
        </header>

        <main className="portal-gate__main">
          <section className="portal-hero" aria-label="STATIC Arrival District">
            <h1 className="sr-only">STATIC Network Arrival District</h1>

            <ArrivalCinematicMode open={cinemaOpen} onClose={() => setCinemaOpen(false)} onEnter={enterDistrictFromCinema} />
            <TravelToVenueOverlay venue={travelVenue} onCancel={() => setTravelVenue(null)} onComplete={completeVenueTravel} />

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
                {districtVenues.map((venue) => (
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
                <a className="portal-button portal-button--primary" href="#request-access">Request Access</a>
                <button className="portal-button portal-button--ghost" type="button" onClick={startDistrictTour}>Take The Tour</button>
                <button className="portal-button portal-button--quiet" type="button" onClick={() => setCinemaOpen(true)}>Replay Arrival</button>
              </nav>
            </figure>

            <section className="district-mobile-venues" aria-label="STATIC district mobile venue cards">
              <span>DISTRICT VENUES / TAP TO PREVIEW</span>
              <div>
                {districtVenues.map((venue) => (
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
              <div className="district-venue-panel__engine" aria-label="Future world engine metadata">
                <small>ENGINE ZONE</small>
                <b>{activeVenue.engine.zone}</b>
                <em>{activeVenue.engine.camera}</em>
              </div>
              <div className="district-venue-panel__actions">
                <button className="portal-button portal-button--primary" type="button" onClick={() => startVenueTravel(activeVenue)}>
                  Travel to venue <ArrowIcon />
                </button>
                <Link className="portal-button portal-button--ghost" to="/my-signal">
                  Add to My Signal
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
                <span>HIGH-GEAR PRODUCT PASS / NETWORK GRAVITY</span>
                <h2>This has to stop feeling like a page and start feeling like a place people can live inside.</h2>
                <p>STATIC becomes valuable when every visitor has a reason to move from watching into following, creating, playing, broadcasting, collecting, and returning.</p>
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
                <span>WHY THIS CAN BECOME BIG</span>
                <h2>Eight layers. One network gravity.</h2>
                <p>The design goal is not “another app.” It is a system where identity, media, worlds, creation, live culture, and ownership reinforce each other.</p>
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
                <p>The district should sell itself in seconds, then route fans, creators, studios, and investors into the right proof path without pretending unfinished systems are live.</p>
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

            <section className="district-engine-readiness" aria-label="STATIC world engine readiness">
              <div>
                <span>WORLD ENGINE READY / NEXT WORKLOAD</span>
                <h2>The site is being prepared to become a controllable district.</h2>
                <p>Today this is a polished web district with cinematic travel. Next, the engine layer can take over movement, camera paths, avatars, NPCs, spatial audio, and venue presence from the same manifest.</p>
              </div>
              <div>
                {worldEngineReadiness.map(([title, copy]) => (
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
              <div><span>STATUS</span><strong>S.A.G.E. ONLINE</strong></div>
              <p>The first STATIC district is opening to approved creators, studios, builders, performers, and early explorers.</p>
            </aside>
          </section>

          <PortalZoneMap />

          <section className="portal-access" id="request-access" aria-labelledby="portal-access-title">
            <div className="portal-section-copy portal-access__copy">
              <span>REQUEST ACCESS / FIRST SIGNAL</span>
              <h2 id="portal-access-title">Request your district pass.</h2>
              <p>Join the first access list for the STATIC District. Approved operators receive the signal as each venue, world, and creator system opens.</p>
              {restrictedPath && <small>That destination is opening in phases for approved operators.</small>}
            </div>
            <BetaRequestForm />
          </section>
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
        <button type="button" onClick={onEnter}>Enter With S.A.G.E.</button>
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
