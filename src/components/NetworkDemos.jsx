import { useEffect, useMemo, useRef, useState } from 'react'
import {
  broadcasts,
  channelWorlds,
  generationSteps,
  liveEvents,
  marketDrops,
  radioProgramming,
  signalFeed,
  studioModes,
} from '../data/media'
import { Link } from './Router'
import { ArrowIcon, LiveIndicator, PlayIcon, Reveal, SignalMark } from './UI'
import { LocalSignalCard, LocalSignalMedia } from './EntitySystem'
import { getSignals, subscribeToNetworkUpdates } from '../lib/staticStore'

function useRotatingIndex(length, delay = 5200, paused = false) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (paused || length < 2) return undefined
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % length), delay)
    return () => window.clearInterval(timer)
  }, [delay, length, paused])

  return [index, setIndex]
}

export function MediaVisual({ className, label, children }) {
  return (
    <div className={`media-visual ${className}`}>
      <div className="media-visual__grid" aria-hidden="true" />
      <div className="media-visual__noise" aria-hidden="true" />
      {label && <span className="media-visual__code">{label}</span>}
      {children}
    </div>
  )
}

export function HeroMediaWall() {
  return (
    <div className="hero-media-wall" aria-hidden="true">
      {signalFeed.slice(0, 5).map((item, index) => (
        <div className={`hero-float hero-float--${index + 1}`} key={item.id}>
          <MediaVisual className={item.visual} label={item.type}>
            <span className="hero-float__status">{item.status}</span>
          </MediaVisual>
          <div><b>{item.title}</b><span>{item.creator}</span></div>
        </div>
      ))}
      <div className="hero-media-wall__orbit"><i /><i /><i /></div>
    </div>
  )
}

export function BroadcastDeck({ compact = false }) {
  const [active, setActive] = useRotatingIndex(broadcasts.length, 4600)
  const item = broadcasts[active]

  return (
    <section className={`broadcast-deck ${compact ? 'broadcast-deck--compact' : ''}`} aria-label="Now broadcasting">
      <div className="broadcast-deck__lead">
        <LiveIndicator label={item.label} />
        <span>STATIC TRANSMISSION</span>
      </div>
      <Link className={`broadcast-deck__feature ${item.visual}`} to={item.route}>
        <div className="broadcast-deck__number">0{active + 1}</div>
        <div>
          <p>{item.detail}</p>
          <h2>{item.title}</h2>
          <span>{item.meta}</span>
        </div>
        <span className="broadcast-deck__action">Open transmission <ArrowIcon /></span>
      </Link>
      <div className="broadcast-deck__queue">
        {broadcasts.map((broadcast, index) => (
          <button
            className={index === active ? 'is-active' : ''}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show ${broadcast.title}`}
            key={broadcast.title}
          >
            <i />
            <span>0{index + 1}</span>
            <b>{broadcast.title}</b>
          </button>
        ))}
      </div>
    </section>
  )
}

export function LiveSignalFeed({ limit, searchable = false, initialCategory = 'All' }) {
  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [localSignals, setLocalSignals] = useState(() => getSignals())
  const categories = ['All', 'Entities', 'Signals', 'Channels', 'Radio', 'Play', 'Live', 'Originals', 'Marketplace']

  useEffect(() => subscribeToNetworkUpdates(() => setLocalSignals(getSignals())), [])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    const local = localSignals
      .filter((item) => item.visibility !== 'Draft')
      .map((item) => ({
        ...item,
        local: true,
        category: 'Entities',
        creator: item.entityName,
        handle: item.entityHandle,
        description: item.caption,
      }))
    const filtered = [...local, ...signalFeed].filter((item) => {
      const matchesCategory =
        category === 'All' ||
        item.category === category ||
        (category === 'Channels' && ['Entities', 'Signals'].includes(item.category)) ||
        (category === 'Marketplace' && item.type.includes('Drop'))
      const matchesSearch =
        !query ||
        `${item.creator} ${item.title} ${item.type} ${item.description}`.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
    return typeof limit === 'number' ? filtered.slice(0, limit) : filtered
  }, [category, limit, localSignals, search])

  return (
    <div className="live-feed">
      {searchable && (
        <div className="discover-controls">
          <label>
            <span className="sr-only">Search the network</span>
            <i aria-hidden="true">⌕</i>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search creators, worlds, broadcasts..."
              type="search"
            />
            <kbd>LIVE INDEX</kbd>
          </label>
          <div className="media-filters">
            {categories.map((item) => (
              <button className={item === category ? 'is-active' : ''} onClick={() => setCategory(item)} type="button" key={item}>
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="live-feed__grid">
        {visible.map((item, index) => (
          item.local ? (
            <Reveal delay={(index % 4) * 55} key={item.id}>
              <LocalSignalCard signal={item} onOpen={setSelected} />
            </Reveal>
          ) : <Reveal as="article" className={`feed-card feed-card--${item.accent}`} delay={(index % 4) * 55} key={item.id}>
            <button className="feed-card__open" type="button" onClick={() => setSelected(item)} aria-label={`Open signal ${item.title}`}>
              <MediaVisual className={item.visual} label={item.duration}>
                <span className={`feed-status ${item.status === 'Live Now' ? 'feed-status--live' : ''}`}>{item.status}</span>
                <span className="feed-card__play"><PlayIcon /></span>
              </MediaVisual>
              <div className="feed-card__creator">
                <span className="creator-avatar">{item.avatar}</span>
                <div><b>{item.creator}</b><span>{item.handle}</span></div>
                <em>{item.type}</em>
              </div>
              <div className="feed-card__copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="feed-card__stats">
                <span>◉ {item.stats.views}</span>
                <span>◇ {item.stats.reactions}</span>
                <span>↻ {item.stats.remixes}</span>
                <b>Open Signal <ArrowIcon /></b>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="empty-signal"><SignalMark animated /><h3>No signal on this frequency.</h3><p>Try another network filter or search phrase.</p></div>
      )}

      {selected && (
        <div className="signal-modal" role="dialog" aria-modal="true" aria-label={selected.title}>
          <button className="signal-modal__backdrop" type="button" onClick={() => setSelected(null)} aria-label="Close signal" />
          <article>
            <button className="signal-modal__close" type="button" onClick={() => setSelected(null)} aria-label="Close">×</button>
            {selected.local ? <LocalSignalMedia signal={selected} /> : (
              <MediaVisual className={selected.visual} label={selected.duration}>
                <span className="signal-modal__play"><PlayIcon /></span>
              </MediaVisual>
            )}
            <div className="signal-modal__body">
              <LiveIndicator label={selected.local ? 'ENTITY SIGNAL' : selected.status} />
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
              <div>
                <span>{selected.creator}</span>
                {selected.local ? <><span>{selected.visibility}</span><span>Signal Score {selected.signalScore}</span></> : <><span>{selected.stats.views} views</span><span>{selected.stats.reactions} reactions</span></>}
              </div>
              <Link className="button button--primary" to={selected.local ? `/channels/${selected.entityHandle.replace('@', '')}` : '/waitlist'}>
                {selected.local ? 'Open Entity Channel' : 'Follow this signal'} <ArrowIcon />
              </Link>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}

export function RadioPlayer({ mini = false }) {
  const [stationIndex, setStationIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(28)
  const station = radioProgramming[stationIndex]

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => setProgress((value) => (value >= 100 ? 0 : value + 0.35)), 160)
    return () => window.clearInterval(timer)
  }, [playing])

  function selectStation(index) {
    setStationIndex(index)
    setProgress(12 + index * 11)
  }

  return (
    <div className={`radio-player ${mini ? 'radio-player--mini' : ''}`}>
      <div className={`radio-player__stage ${station.visual}`}>
        <div className="radio-player__top"><LiveIndicator label={playing ? 'TRANSMITTING' : 'TUNED'} /><span>{station.frequency} FM</span></div>
        <div className={`radio-orb ${playing ? 'is-playing' : ''}`}><i /><i /><SignalMark animated={playing} /></div>
        <div className="radio-player__track">
          <span>NOW ON {station.name}</span>
          <h3>{station.track}</h3>
          <p>{station.artist} / hosted by {station.host}</p>
        </div>
        <div className="radio-wave" aria-hidden="true">
          {Array.from({ length: mini ? 26 : 42 }, (_, index) => <i style={{ '--wave': `${15 + ((index * 23) % 74)}%` }} key={index} />)}
        </div>
        <div className="radio-controls">
          <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause station demo' : 'Play station demo'}>
            {playing ? 'Ⅱ' : <PlayIcon />}
          </button>
          <div><i style={{ width: `${progress}%` }} /></div>
          <span>{Math.floor(progress * 2.17 / 60)}:{String(Math.floor(progress * 2.17 % 60)).padStart(2, '0')}</span>
          <button className="volume-button" type="button" aria-label="Volume display">VOL 72</button>
        </div>
      </div>
      <div className="radio-player__stations">
        <div className="console-topbar"><span>STATION DIRECTORY</span><span>{radioProgramming.length} LIVE</span></div>
        {radioProgramming.map((item, index) => (
          <button className={index === stationIndex ? 'is-active' : ''} type="button" onClick={() => selectStation(index)} key={item.id}>
            <span>0{index + 1}</span>
            <div><b>{item.name}</b><small>{item.genre}</small></div>
            <em>{item.listeners}</em>
          </button>
        ))}
        <div className="radio-player__next"><span>UP NEXT</span><p>{station.next}</p></div>
      </div>
    </div>
  )
}

export function PlayGenerator({ compact = false }) {
  const timers = useRef([])
  const [prompt, setPrompt] = useState('A rain-soaked street racing world where the city changes every lap.')
  const [step, setStep] = useState(-1)
  const [generatedPrompt, setGeneratedPrompt] = useState('')

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  function generate(event) {
    event.preventDefault()
    if (!prompt.trim()) return
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setGeneratedPrompt('')
    setStep(0)

    generationSteps.slice(1).forEach((_, index) => {
      const timer = window.setTimeout(() => {
        const nextStep = index + 1
        setStep(nextStep)
        if (nextStep === generationSteps.length - 1) setGeneratedPrompt(prompt.trim())
      }, (index + 1) * 720)
      timers.current.push(timer)
    })

    // TODO: Replace this deterministic sequence with an authenticated server
    // job that streams real generation progress and returns a playable build.
  }

  const busy = step >= 0 && step < generationSteps.length - 1

  return (
    <div className={`play-generator ${compact ? 'play-generator--compact' : ''}`}>
      <div className="play-generator__viewport">
        <div className={`generated-world ${generatedPrompt ? 'is-ready' : ''}`}><i /><i /><i /><b /></div>
        <div className="play-generator__hud">
          <span>{generatedPrompt ? 'WORLD//READY' : 'WORLD//COMPOSER'}</span>
          <LiveIndicator label={busy ? 'GENERATING' : generatedPrompt ? 'PLAYABLE PREVIEW' : 'ENGINE READY'} />
        </div>
        {generatedPrompt && (
          <div className="generated-world__card">
            <span>GENERATED WORLD</span>
            <h3>{makeWorldTitle(generatedPrompt)}</h3>
            <p>{generatedPrompt}</p>
            <div><span>EXPLORATION</span><span>DYNAMIC RULES</span><span>REMIXABLE</span></div>
          </div>
        )}
      </div>
      <form onSubmit={generate}>
        <label>
          <span>WHAT WOULD YOU LIKE TO PLAY TODAY?</span>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={compact ? 3 : 4} />
        </label>
        <div className="play-generator__bottom">
          <div className="style-pills"><span>WORLD</span><span>MULTIPLAYER</span><span>CINEMATIC</span></div>
          <button className="button button--primary" type="submit" disabled={busy}>
            {busy ? generationSteps[step] : generatedPrompt ? 'Generate Another World' : 'Generate World'} <ArrowIcon />
          </button>
        </div>
        <div className="generation-track" aria-live="polite">
          {generationSteps.map((label, index) => (
            <span className={step >= index ? 'is-complete' : ''} key={label}><i />{label}</span>
          ))}
        </div>
      </form>
    </div>
  )
}

function makeWorldTitle(prompt) {
  const words = prompt.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter((word) => word.length > 4)
  return (words.slice(0, 2).join(' ') || 'Untitled Signal').toUpperCase()
}

export function StudioCreator({ mini = false }) {
  const [modeIndex, setModeIndex] = useState(0)
  const [prompt, setPrompt] = useState(studioModes[0].prompt)
  const [style, setStyle] = useState(studioModes[0].style[0])
  const [phase, setPhase] = useState('ready')
  const timerRef = useRef(null)
  const mode = studioModes[modeIndex]

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function chooseMode(index) {
    setModeIndex(index)
    setPrompt(studioModes[index].prompt)
    setStyle(studioModes[index].style[0])
    setPhase('ready')
  }

  function generate(event) {
    event.preventDefault()
    setPhase('transmitting')
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setPhase('complete'), 1700)
    // TODO: Send this request to the selected server-side provider adapter,
    // then store approved outputs in the creator project workspace.
  }

  return (
    <div className={`studio-creator ${mini ? 'studio-creator--mini' : ''}`}>
      <div className="studio-creator__top">
        <div><SignalMark animated /><span>STATIC STUDIO / CREATE</span></div>
        <LiveIndicator label={phase === 'transmitting' ? 'TRANSMITTING' : 'WORKSPACE ACTIVE'} />
      </div>
      <div className="studio-mode-tabs" role="tablist" aria-label="Creation mode">
        {studioModes.map((item, index) => (
          <button className={index === modeIndex ? 'is-active' : ''} type="button" role="tab" aria-selected={index === modeIndex} onClick={() => chooseMode(index)} key={item.id}>
            <span>0{index + 1}</span>{item.label}
          </button>
        ))}
      </div>
      <div className="studio-creator__body">
        <form onSubmit={generate}>
          <label><span>CREATION PROMPT</span><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={mini ? 3 : 5} /></label>
          <fieldset>
            <legend>STYLE SIGNAL</legend>
            <div className="style-selector">
              {mode.style.map((item) => <button className={item === style ? 'is-active' : ''} type="button" onClick={() => setStyle(item)} key={item}>{item}</button>)}
            </div>
          </fieldset>
          <button className="button button--primary button--wide" type="submit" disabled={phase === 'transmitting'}>
            {phase === 'transmitting' ? 'Building transmission...' : `Generate ${mode.label}`} <ArrowIcon />
          </button>
        </form>
        <div className={`studio-output ${mode.visual} ${phase === 'transmitting' ? 'is-loading' : ''}`}>
          <div className="studio-output__scan" />
          <div className="studio-output__meta"><span>OUTPUT//{mode.id.toUpperCase()}</span><span>{phase === 'complete' ? 'NEW VERSION' : 'PREVIEW MODE'}</span></div>
          <div className="studio-output__art"><i /><b /><SignalMark animated={phase === 'transmitting'} /></div>
          <div className="studio-output__copy">
            <span>{style.toUpperCase()} / {mode.label.toUpperCase()}</span>
            <h3>{phase === 'complete' ? makeWorldTitle(prompt) : mode.output}</h3>
            <p>{mode.meta}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChannelGallery({ limit }) {
  const [active, setActive] = useState(0)
  const worlds = typeof limit === 'number' ? channelWorlds.slice(0, limit) : channelWorlds
  const selected = worlds[Math.min(active, worlds.length - 1)]

  return (
    <div className="channel-gallery">
      <div className={`channel-stage ${selected.visual}`}>
        <div className="channel-stage__top"><LiveIndicator label={selected.live ? 'CHANNEL LIVE' : 'WORLD ONLINE'} /><span>{selected.followers} FOLLOWING</span></div>
        <div className="channel-stage__identity">
          <span>{selected.archetype}</span>
          <h2>{selected.name}</h2>
          <p>{selected.description}</p>
          <div>{selected.modules.map((module) => <span key={module}>{module}</span>)}</div>
          <Link className="button button--primary" to="/waitlist">Follow channel <ArrowIcon /></Link>
        </div>
        <div className="channel-stage__count">{selected.releases}</div>
      </div>
      <div className="channel-list">
        {worlds.map((world, index) => (
          <button className={index === active ? 'is-active' : ''} type="button" onClick={() => setActive(index)} key={world.id}>
            <span className={`channel-list__avatar ${world.visual}`}>{world.name.slice(0, 2)}</span>
            <div><b>{world.name}</b><span>{world.archetype}</span></div>
            {world.live ? <LiveIndicator label="LIVE" /> : <em>{world.followers}</em>}
          </button>
        ))}
      </div>
    </div>
  )
}

export function LiveBroadcasts() {
  const [reminders, setReminders] = useState(() => new Set())
  const [active, setActive] = useState(0)
  const event = liveEvents[active]

  function toggleReminder(id) {
    setReminders((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="live-broadcasts">
      <div className={`live-room ${event.visual}`}>
        <div className="live-room__stage"><SignalMark animated /><span>{event.live ? 'LIVE TRANSMISSION' : 'PREMIERE ROOM'}</span></div>
        <div className="live-room__info">
          <LiveIndicator label={event.time} />
          <h2>{event.title}</h2>
          <p>{event.creator} / {event.format}</p>
          <span>{event.viewers}</span>
        </div>
        <div className="live-room__chat">
          <span>ROOM SIGNAL</span>
          <p><i /> luxx: the world just opened</p>
          <p><i /> northstar: transmitting from london</p>
          <p><i /> static_one: signal locked</p>
        </div>
      </div>
      <div className="event-rail">
        {liveEvents.map((item, index) => (
          <article className={index === active ? 'is-active' : ''} key={item.id}>
            <button className="event-rail__select" type="button" onClick={() => setActive(index)}>
              <span>0{index + 1}</span><div><b>{item.title}</b><small>{item.creator} / {item.format}</small></div><em>{item.time}</em>
            </button>
            {!item.live && (
              <button className={`reminder-button ${reminders.has(item.id) ? 'is-set' : ''}`} type="button" onClick={() => toggleReminder(item.id)}>
                {reminders.has(item.id) ? 'Reminder set' : 'Set reminder'}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

export function MarketplaceBrowser({ limit }) {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const categories = ['All', 'Worlds', 'Music Packs', 'Skins', 'Templates', 'Character Packs', 'Memberships']
  const visible = (filter === 'All' ? marketDrops : marketDrops.filter((drop) => drop.category === filter)).slice(0, limit || marketDrops.length)

  return (
    <div className="market-browser">
      <div className="media-filters">
        {categories.map((item) => <button className={item === filter ? 'is-active' : ''} type="button" onClick={() => setFilter(item)} key={item}>{item}</button>)}
      </div>
      <div className="market-browser__grid">
        {visible.map((drop, index) => (
          <Reveal as="article" className="drop-card" delay={(index % 3) * 55} key={drop.id}>
            <button type="button" onClick={() => setSelected(drop)}>
              <MediaVisual className={drop.visual} label={drop.edition}><span className="drop-card__signal">STATIC DROP</span></MediaVisual>
              <div><span>{drop.category}</span><h3>{drop.name}</h3><p>{drop.creator}</p><div><b>{drop.price}</b><em>View drop <ArrowIcon /></em></div></div>
            </button>
          </Reveal>
        ))}
      </div>
      {selected && (
        <div className="drop-drawer">
          <button type="button" onClick={() => setSelected(null)} aria-label="Close drop">×</button>
          <MediaVisual className={selected.visual} label={selected.edition} />
          <div><span>{selected.category}</span><h2>{selected.name}</h2><p>{selected.detail}</p><strong>{selected.price}</strong><Link className="button button--primary" to="/waitlist">Request drop access <ArrowIcon /></Link></div>
        </div>
      )}
    </div>
  )
}
