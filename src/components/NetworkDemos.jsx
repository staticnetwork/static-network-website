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
import {
  socialBotCreators,
} from '../data/socialBots'
import {
  addCreatorSignalPoints,
  getCatalogAction,
	  getCurrentEntity,
	  getEntities,
	  getDrops,
	  getFollows,
	  getMedia,
	  getProjects,
  getReminders,
  getSignals,
  saveProject,
  saveWorld,
  subscribeToNetworkUpdates,
} from '../lib/staticStore'
import { getCloudApprovedRadioTracks, getCloudRadioStationSchedule, getPublicCloudSignals } from '../lib/storage/supabaseStore'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useBackendCapability } from '../lib/backendReadiness'
import { recordRadioStationPlay, toggleSocialCatalogAction, toggleSocialReminder } from '../lib/socialActions'

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

function PreviewModeStrip({ title = 'Preview mode', detail }) {
  return (
    <div className="preview-mode-strip">
      <span>{title}</span>
      <p>{detail}</p>
    </div>
  )
}

function normalizeRadioMediaList(value) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function isMusicVideoSignal(signal = {}) {
  const text = `${signal.postType || signal.type || ''} ${signal.title || ''} ${signal.text || signal.caption || ''} ${signal.tags || ''}`.toLowerCase()
  return text.includes('music video') || text.includes('music-video') || text.includes('#musicvideo')
}

function isRadioMediaSignal(signal = {}) {
  const type = String(signal.postType || signal.type || '').toLowerCase()
  return type.includes('music') || type.includes('audio') || isMusicVideoSignal(signal)
}

function mediaKindForRadioSignal(signal = {}, index = 0, url = '') {
  const typeList = normalizeRadioMediaList(signal.fileTypes || signal.file_types)
  const fileType = String(typeList[index] || signal.fileType || signal.file_type || '').toLowerCase()
  const source = String(url || '').toLowerCase()
  if (isMusicVideoSignal(signal) || fileType.startsWith('video/') || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(source)) return 'video'
  return 'audio'
}

function radioTracksFromSignals(signals = []) {
  return signals
    .filter((signal) => signal.visibility !== 'Draft' && isRadioMediaSignal(signal))
    .flatMap((signal) => {
      const urls = normalizeRadioMediaList(signal.mediaUrls || signal.media_urls)
      const refs = normalizeRadioMediaList(signal.mediaRefs || (signal.mediaId ? [signal.mediaId] : []))
      const count = Math.max(urls.length, refs.length)
      return Array.from({ length: count }, (_, index) => {
        const mediaUrl = urls[index] || ''
        const mediaRef = refs[index] || ''
        if (!mediaUrl && !mediaRef) return null
        const mediaKind = mediaKindForRadioSignal(signal, index, mediaUrl)
        const creatorName = signal.entityName || signal.creator || 'STATIC Creator'
        return {
          id: `creator-media-${signal.id}-${index}`,
          name: mediaKind === 'video' ? 'STATIC MUSIC VIDEO' : 'STATIC RADIO',
          frequency: mediaKind === 'video' ? 'MV' : 'LIVE',
          genre: mediaKind === 'video' ? 'MUSIC VIDEO / CREATOR UPLOAD' : 'MUSIC / CREATOR UPLOAD',
          listeners: signal.previewReactionCount ? `${signal.previewReactionCount}` : 'QUEUE',
          host: 'STATIC Social',
          track: signal.title || signal.fileNames?.[index] || signal.fileName || 'Untitled upload',
          artist: creatorName,
          next: signal.text || signal.caption || 'Creator media from STATIC Social.',
          visual: mediaKind === 'video' ? 'station--drive' : 'station--one',
          mediaKind,
          mediaUrl,
          mediaRef,
          signalId: signal.id,
          sourceType: 'creator_upload',
        }
      }).filter(Boolean)
    })
}

function normalizeRadioGenres(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }
  return []
}

function cloudRadioMediaKind(track = {}, mediaUrl = '') {
  const data = track.data || {}
  const mime = String(track.media_asset?.mime_type || data.mimeType || data.fileType || '').toLowerCase()
  const mode = String(data.mediaMode || data.mediaKind || data.outputType || '').toLowerCase()
  const source = String(mediaUrl || track.audio_url || '').toLowerCase()
  if (mode.includes('video') || mime.startsWith('video/') || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(source)) return 'video'
  return 'audio'
}

function cloudRadioTrackToStation(row = {}, index = 0) {
  const track = row.track || row
  const stationRow = row.station || {}
  const trackData = track.data || {}
  const mediaAsset = track.media_asset || {}
  const mediaUrl = track.audio_url || mediaAsset.public_url || trackData.mediaUrl || trackData.publicUrl || ''
  const mediaKind = cloudRadioMediaKind(track, mediaUrl)
  const genres = normalizeRadioGenres(track.genres)
  const stationName = stationRow.name || trackData.stationName || (mediaKind === 'video' ? 'STATIC Music Video' : 'STATIC Radio')
  const artist = track.artist || trackData.artist || trackData.creator || 'STATIC Creator'

  return {
    id: `approved-radio-${track.id || index}`,
    stationId: stationRow.station_id || stationRow.id || 'static-radio',
    trackId: track.id,
    name: stationName,
    frequency: stationRow.frequency || trackData.frequency || (mediaKind === 'video' ? 'MV' : '24/7'),
    genre: genres.length ? genres.join(' / ').toUpperCase() : mediaKind === 'video' ? 'MUSIC VIDEO / APPROVED' : 'MUSIC / APPROVED',
    listeners: trackData.listeners || 'APPROVED',
    host: stationRow.data?.host || trackData.host || 'STATIC Radio',
    track: track.title || mediaAsset.file_name || 'Untitled track',
    artist,
    next: stationRow.description || trackData.description || trackData.caption || 'Approved creator media in STATIC rotation.',
    visual: mediaKind === 'video' ? 'station--drive' : 'station--one',
    mediaKind,
    mediaUrl,
    mediaRef: '',
    sourceType: track.source_type || 'creator_upload',
    rightsStatus: track.rights_status || 'approved',
    approvedCloudTrack: true,
    scheduleId: row.id,
    schedulePosition: row.position,
    durationSeconds: track.duration_seconds || 0,
  }
}

function formatPlaybackTime(seconds = 0) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`
}

function StaticRadioMedia({ station, mediaElementRef, playing, onProgress, onEnded }) {
  const [source, setSource] = useState(station.mediaUrl || '')

  useEffect(() => {
    let cancelled = false
    let localUrl = ''
    setSource(station.mediaUrl || '')

    if (!station.mediaUrl && station.mediaRef) {
      getMedia(station.mediaRef).then((record) => {
        if (cancelled || !record?.blob) return
        localUrl = URL.createObjectURL(record.blob)
        setSource(localUrl)
      })
    }

    return () => {
      cancelled = true
      if (localUrl) URL.revokeObjectURL(localUrl)
    }
  }, [station.mediaRef, station.mediaUrl])

  useEffect(() => {
    const player = mediaElementRef.current
    if (!player || !source) return
    if (playing) {
      player.play().catch(() => {
        // Browser autoplay protection can still reject if state changes
        // outside a direct user gesture. Native controls remain available.
      })
    } else {
      player.pause()
    }
  }, [mediaElementRef, playing, source, station.id])

  if (!source) return <div className="static-radio-native static-radio-native--loading">Loading creator media...</div>

  if (station.mediaKind === 'video') {
    return (
      <video
        className="static-radio-video"
        ref={mediaElementRef}
        src={source}
        controls
        playsInline
        preload="metadata"
        onTimeUpdate={onProgress}
        onEnded={onEnded}
      />
    )
  }

  return (
    <audio
      className="static-radio-native"
      ref={mediaElementRef}
      src={source}
      controls
      preload="metadata"
      onTimeUpdate={onProgress}
      onEnded={onEnded}
    />
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

function dedupeSignals(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = item.cloudId || item.localId || item.id
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function isFollowedSignal(item, follows) {
  const keys = new Set(Object.keys(follows || {}))
  const followedHandles = new Set(Object.values(follows || {}).map((follow) => String(follow.handle || '').replace('@', '').toLowerCase()).filter(Boolean))
  const handle = String(item.entityHandle || item.handle || '').replace('@', '').toLowerCase()
  return Boolean(
    keys.has(`entity:${item.entityId}`) ||
    keys.has(`channel:${item.channelId}`) ||
    followedHandles.has(handle)
  )
}

export function LiveSignalFeed({ limit, searchable = false, initialCategory = 'All', followedOnly = false }) {
  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [localSignals, setLocalSignals] = useState(() => getSignals())
  const [follows, setFollows] = useState(() => getFollows())
  const [cloudSignals, setCloudSignals] = useState([])
  const [cloudStatus, setCloudStatus] = useState('checking')
  const categories = ['All', 'Posts', 'Channels', 'Radio', 'Live', 'Marketplace']

  useEffect(() => subscribeToNetworkUpdates(() => {
    setLocalSignals(getSignals())
    setFollows(getFollows())
  }), [])

  useEffect(() => {
    let active = true
    if (!isSupabaseConfigured) {
      setCloudStatus('local')
      return () => {
        active = false
      }
    }
    setCloudStatus('checking')
    getPublicCloudSignals(50)
      .then((items) => {
        if (!active) return
        setCloudSignals(items)
        setCloudStatus(items.length ? 'online' : 'quiet')
      })
      .catch(() => {
        if (!active) return
        setCloudSignals([])
        setCloudStatus('local')
      })
    return () => {
      active = false
    }
  }, [])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    const local = localSignals
      .filter((item) => item.visibility !== 'Draft')
      .map((item) => ({
        ...item,
        local: true,
        category: 'Posts',
        creator: item.entityName,
        handle: item.entityHandle,
        description: item.caption,
      }))
    const filtered = dedupeSignals([...local, ...cloudSignals, ...signalFeed]).filter((item) => {
      const matchesCategory =
        category === 'All' ||
        item.category === category ||
        (category === 'Channels' && ['Posts', 'Signals'].includes(item.category)) ||
        (category === 'Marketplace' && String(item.type || '').includes('Drop'))
      const matchesSearch =
        !query ||
        `${item.creator} ${item.title} ${item.type} ${item.description}`.toLowerCase().includes(query)
      const matchesFollow = !followedOnly || isFollowedSignal(item, follows)
      return matchesCategory && matchesSearch && matchesFollow
    })
    return typeof limit === 'number' ? filtered.slice(0, limit) : filtered
  }, [category, cloudSignals, followedOnly, follows, limit, localSignals, search])

  const selectedRoute = selected?.local && selected?.entityHandle && !selected?.publicCloud
    ? `/channels/${selected.entityHandle.replace('@', '')}`
    : selected?.publicCloud
      ? '/my-signal'
      : '/waitlist'
  const selectedCta = selected?.local && !selected?.publicCloud
    ? 'Open Creator Channel'
    : selected?.publicCloud
      ? 'Open My Signal'
      : 'Follow this venue'

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

      {(searchable || followedOnly) && (
        <div className="cloud-feed-strip">
          <span>{followedOnly ? 'MY SIGNAL' : 'PUBLIC CLOUD INDEX'}</span>
          <p>
            {followedOnly
              ? `${Object.keys(follows).length} followed venues shaping this pulse.`
              : cloudStatus === 'online'
                ? `${cloudSignals.length} public cloud posts synced into discovery.`
                : cloudStatus === 'quiet'
                  ? 'Cloud is connected. Public posts will appear here as creators publish.'
                  : 'Local preview programming remains visible while the cloud index warms up.'}
          </p>
          <Link to={followedOnly ? '/discover' : '/my-signal'}>{followedOnly ? 'Find more venues' : 'Open My Signal'} <ArrowIcon /></Link>
        </div>
      )}

      <div className="live-feed__grid">
        {visible.map((item, index) => (
          item.local ? (
            <Reveal delay={(index % 4) * 55} key={item.id}>
              <LocalSignalCard signal={item} onOpen={setSelected} />
            </Reveal>
          ) : <Reveal as="article" className={`feed-card feed-card--${item.accent}`} delay={(index % 4) * 55} key={item.id}>
            <button className="feed-card__open" type="button" onClick={() => setSelected(item)} aria-label={`Open district card ${item.title}`}>
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
                <b>Open Card <ArrowIcon /></b>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="empty-signal">
          <SignalMark animated />
          <h3>{followedOnly ? 'Your feed is waiting on a follow.' : 'No posts on this frequency.'}</h3>
          <p>{followedOnly ? 'Follow creator venues and they will appear in this personal pulse.' : 'Try another network filter or search phrase.'}</p>
          {followedOnly && <Link className="button button--primary" to="/discover">Discover venues <ArrowIcon /></Link>}
        </div>
      )}

      {selected && (
        <div className="signal-modal" role="dialog" aria-modal="true" aria-label={selected.title}>
          <button className="signal-modal__backdrop" type="button" onClick={() => setSelected(null)} aria-label="Close post" />
          <article>
            <button className="signal-modal__close" type="button" onClick={() => setSelected(null)} aria-label="Close">×</button>
            {selected.local ? <LocalSignalMedia signal={selected} /> : (
              <MediaVisual className={selected.visual} label={selected.duration}>
                <span className="signal-modal__play"><PlayIcon /></span>
              </MediaVisual>
            )}
            <div className="signal-modal__body">
              <LiveIndicator label={selected.local ? 'AI POST' : selected.status} />
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
              <div>
                <span>{selected.creator}</span>
                {selected.local ? <><span>{selected.visibility}</span><span>Signal {selected.signalScore}</span></> : <><span>{selected.stats.views} views</span><span>{selected.stats.reactions} reactions</span></>}
              </div>
              <Link className="button button--primary" to={selectedRoute}>
                {selectedCta} <ArrowIcon />
              </Link>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}

export function RadioPlayer({ mini = false }) {
  const { user } = useAuth()
  const [stationIndex, setStationIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(28)
  const [playbackSeconds, setPlaybackSeconds] = useState(0)
  const [signals, setSignals] = useState(() => getSignals())
  const [approvedCloudTracks, setApprovedCloudTracks] = useState([])
  const [radioSource, setRadioSource] = useState(isSupabaseConfigured ? 'loading' : 'local-only')
  const [reminders, setReminders] = useState(() => getReminders())
  const sessionId = useRef(`radio-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const mediaElementRef = useRef(null)
  const creatorMediaTracks = useMemo(() => radioTracksFromSignals(signals), [signals])
  const playlist = approvedCloudTracks.length ? approvedCloudTracks : creatorMediaTracks.length ? creatorMediaTracks : radioProgramming
  const station = playlist[stationIndex] || playlist[0] || radioProgramming[0]
  const isApprovedCloudMedia = Boolean(station?.approvedCloudTrack)
  const isCreatorMedia = Boolean(station?.mediaUrl || station?.mediaRef)
  const libraryLabel = approvedCloudTracks.length ? 'STATIC RADIO LIBRARY' : creatorMediaTracks.length ? 'CREATOR MEDIA QUEUE' : 'STATION DIRECTORY'
  const libraryCountLabel = approvedCloudTracks.length ? `${approvedCloudTracks.length} APPROVED` : creatorMediaTracks.length ? `${creatorMediaTracks.length} POSTS` : `${playlist.length} LIVE`

  useEffect(() => {
    if (!playing || isCreatorMedia) return undefined
    const timer = window.setInterval(() => setProgress((value) => (value >= 100 ? 0 : value + 0.35)), 160)
    return () => window.clearInterval(timer)
  }, [isCreatorMedia, playing])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setRadioSource('local-only')
      return undefined
    }

    let active = true
    async function loadApprovedRadio() {
      setRadioSource((current) => current === 'station-schedule' || current === 'approved-library' ? current : 'loading')
      try {
        const scheduled = await getCloudRadioStationSchedule('static-radio').catch(() => [])
        const rows = scheduled.length ? scheduled : await getCloudApprovedRadioTracks(60)
        if (!active) return
        setApprovedCloudTracks(rows.map((row, index) => cloudRadioTrackToStation(row, index)).filter((item) => item.mediaUrl))
        setRadioSource(rows.length ? (scheduled.length ? 'station-schedule' : 'approved-library') : 'empty')
      } catch {
        if (!active) return
        setApprovedCloudTracks([])
        setRadioSource('error')
      }
    }

    loadApprovedRadio()
    const refresh = window.setInterval(loadApprovedRadio, 60000)
    return () => {
      active = false
      window.clearInterval(refresh)
    }
  }, [])

  useEffect(() => subscribeToNetworkUpdates(() => {
    setReminders(getReminders())
    setSignals(getSignals())
  }), [])

  useEffect(() => {
    if (stationIndex >= playlist.length) setStationIndex(0)
  }, [playlist.length, stationIndex])

  function selectStation(index) {
    const nextStation = playlist[index]
    if (!nextStation) return
    mediaElementRef.current?.pause()
    setStationIndex(index)
    setPlaying(false)
    setPlaybackSeconds(0)
    setProgress(nextStation.mediaUrl || nextStation.mediaRef ? 0 : 12 + index * 11)
    recordRadioStationPlay(user, nextStation, 'tune', {
      sessionId: sessionId.current,
      progress: nextStation.mediaUrl || nextStation.mediaRef ? 0 : 12 + index * 11,
    }).catch(() => null)
  }

  function togglePlayback() {
    const nextPlaying = !playing
    setPlaying(nextPlaying)
    recordRadioStationPlay(user, station, nextPlaying ? 'play' : 'pause', {
      sessionId: sessionId.current,
      progress,
      secondsListened: Math.floor(progress * 2.17),
    }).catch(() => null)
  }

  function updateMediaProgress(event) {
    const media = event.currentTarget
    setPlaybackSeconds(media.currentTime || 0)
    if (Number.isFinite(media.duration) && media.duration > 0) {
      setProgress((media.currentTime / media.duration) * 100)
    }
  }

  function completeMediaTrack() {
    setPlaying(false)
    setProgress(100)
    recordRadioStationPlay(user, station, 'complete', {
      sessionId: sessionId.current,
      progress: 100,
      secondsListened: Math.floor(playbackSeconds),
    }).catch(() => null)
  }

  async function toggleStationReminder() {
    await toggleSocialReminder(user, `radio-${station.id}`, {
      kind: 'radio',
      title: station.name,
      detail: `${station.track} / ${station.artist}`,
      frequency: station.frequency,
      route: '/radio',
    }).catch(() => null)
    await recordRadioStationPlay(user, station, 'save', {
      sessionId: sessionId.current,
      progress,
    }).catch(() => null)
    setReminders(getReminders())
  }

  return (
    <div className={`radio-player ${mini ? 'radio-player--mini' : ''}`}>
      <div className={`radio-player__stage ${station.visual}`}>
        <div className="radio-player__top"><LiveIndicator label={playing ? 'TRANSMITTING' : isApprovedCloudMedia ? 'APPROVED ROTATION' : isCreatorMedia ? 'CREATOR QUEUE' : 'TUNED'} /><span>{station.frequency} {isCreatorMedia ? '' : 'FM'}</span></div>
        {station.mediaKind === 'video' ? (
          <StaticRadioMedia station={station} mediaElementRef={mediaElementRef} playing={playing} onProgress={updateMediaProgress} onEnded={completeMediaTrack} />
        ) : (
          <div className={`radio-orb ${playing ? 'is-playing' : ''}`}><i /><i /><SignalMark animated={playing} /></div>
        )}
        <div className="radio-player__track">
          <span>{isCreatorMedia ? `NOW PLAYING / ${station.name}` : `NOW ON ${station.name}`}</span>
          <h3>{station.track}</h3>
          <p>{station.artist} / hosted by {station.host}</p>
        </div>
        {isCreatorMedia && station.mediaKind !== 'video' && (
          <StaticRadioMedia station={station} mediaElementRef={mediaElementRef} playing={playing} onProgress={updateMediaProgress} onEnded={completeMediaTrack} />
        )}
        <div className="radio-wave" aria-hidden="true">
          {Array.from({ length: mini ? 26 : 42 }, (_, index) => <i style={{ '--wave': `${15 + ((index * 23) % 74)}%` }} key={index} />)}
        </div>
        <div className="radio-controls">
          <button type="button" onClick={togglePlayback} aria-label={playing ? 'Pause station' : 'Play station'}>
            {playing ? 'Ⅱ' : <PlayIcon />}
          </button>
          <div><i style={{ width: `${progress}%` }} /></div>
          <span>{formatPlaybackTime(isCreatorMedia ? playbackSeconds : progress * 2.17)}</span>
          <button className="volume-button" type="button" aria-label="Volume display">VOL 72</button>
        </div>
      </div>
      {mini ? (
        <div className="radio-player__mini-footer">
          <span>{radioSource === 'loading' ? 'Syncing station' : libraryLabel}</span>
          <button className={reminders[`radio-${station.id}`] ? 'reminder-button is-set' : 'reminder-button'} type="button" onClick={toggleStationReminder}>
            {reminders[`radio-${station.id}`] ? 'Saved' : 'Save'}
          </button>
        </div>
      ) : (
        <div className="radio-player__stations">
          <div className="console-topbar"><span>{libraryLabel}</span><span>{radioSource === 'loading' ? 'SYNCING' : libraryCountLabel}</span></div>
          {playlist.map((item, index) => (
            <button className={index === stationIndex ? 'is-active' : ''} type="button" onClick={() => selectStation(index)} key={item.id}>
              <span>0{index + 1}</span>
              <div><b>{item.name}</b><small>{item.genre}</small></div>
              <em>{item.mediaKind === 'video' ? 'VIDEO' : item.approvedCloudTrack ? 'APPROVED' : item.listeners}</em>
            </button>
          ))}
          <div className="radio-player__next">
            <span>UP NEXT</span>
            <p>{station.next}</p>
            <button className={reminders[`radio-${station.id}`] ? 'reminder-button is-set' : 'reminder-button'} type="button" onClick={toggleStationReminder}>
              {reminders[`radio-${station.id}`] ? 'Station saved' : 'Save station'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function PlayGenerator({ compact = false }) {
  const timers = useRef([])
  const [prompt, setPrompt] = useState('A rain-soaked street racing world where the city changes every lap.')
  const [step, setStep] = useState(-1)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [savedProject, setSavedProject] = useState(null)
  const [projects, setProjects] = useState(() => getProjects({ type: 'play' }).slice(0, 4))

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])
  useEffect(() => subscribeToNetworkUpdates(() => setProjects(getProjects({ type: 'play' }).slice(0, 4))), [])

  function generate(event) {
    event.preventDefault()
    if (!prompt.trim()) return
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setGeneratedPrompt('')
    setSavedProject(null)
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

  function saveGeneratedWorld() {
    if (!generatedPrompt) return
    const entity = getCurrentEntity()
    const title = makeWorldTitle(generatedPrompt)
    const project = saveProject({
      type: 'play',
      title,
      prompt: generatedPrompt,
      style: 'Playable world',
      outputType: 'STATIC PLAY',
      status: 'Playable concept saved',
      route: '/play',
      entityId: entity?.id || '',
      entityName: entity?.name || '',
    })
    if (entity) {
      saveWorld({
        entityId: entity.id,
        title,
        setting: generatedPrompt,
        mood: 'Playable / remixable',
        visualStyle: entity.visualStyle || 'Cinematic',
        contentTypes: 'Game world, live session, Signal, creator drop',
        projectId: project.id,
      })
    }
    setSavedProject(project)
    setProjects(getProjects({ type: 'play' }).slice(0, 4))
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
            <button className="button button--glass" type="button" onClick={saveGeneratedWorld}>
              {savedProject ? 'Saved To Studio' : 'Save Playable Concept'} <ArrowIcon />
            </button>
          </div>
        )}
      </div>
      <form onSubmit={generate}>
        <PreviewModeStrip detail="This composer runs a local preview sequence and saves the concept. No game-generation API, paid render, or multiplayer backend is called." />
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
      <div className="play-project-rail">
        <div className="console-topbar"><span>SAVED PLAY WORLDS</span><span>{projects.length} SYNC READY</span></div>
        {projects.length ? projects.map((project) => (
          <article key={project.id}>
            <span>{project.outputType || 'STATIC PLAY'}</span>
            <h3>{project.title}</h3>
            <p>{project.prompt}</p>
          </article>
        )) : <p>No playable worlds saved yet. Generate one and press Save Playable Concept.</p>}
      </div>
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
  const [lastProject, setLastProject] = useState(null)
  const [projects, setProjects] = useState(() => getProjects().slice(0, 5))
  const timerRef = useRef(null)
  const mode = studioModes[modeIndex]

  useEffect(() => () => window.clearTimeout(timerRef.current), [])
  useEffect(() => subscribeToNetworkUpdates(() => setProjects(getProjects().slice(0, 5))), [])

  function chooseMode(index) {
    setModeIndex(index)
    setPrompt(studioModes[index].prompt)
    setStyle(studioModes[index].style[0])
    setPhase('ready')
    setLastProject(null)
  }

  function generate(event) {
    event.preventDefault()
    setPhase('transmitting')
    setLastProject(null)
    window.clearTimeout(timerRef.current)
    const entity = getCurrentEntity()
    const projectInput = {
      type: mode.id,
      title: makeWorldTitle(prompt),
      prompt,
      style,
      outputType: mode.label,
      status: 'Studio concept saved',
      route: '/studio',
      entityId: entity?.id || '',
      entityName: entity?.name || '',
      meta: mode.meta,
      visual: mode.visual,
    }
    timerRef.current = window.setTimeout(() => {
      setPhase('complete')
      const project = saveProject(projectInput)
      if (mode.id === 'world' && entity) {
        saveWorld({
          entityId: entity.id,
          title: project.title,
          setting: prompt,
          mood: style,
          visualStyle: entity.visualStyle || 'Cinematic',
          contentTypes: 'Series, game, live room, drops',
          projectId: project.id,
        })
      }
      setLastProject(project)
      setProjects(getProjects().slice(0, 5))
    }, 1700)
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
      <PreviewModeStrip detail="Studio generation currently creates approved-preview project records only. Real provider jobs stay blocked until a server adapter and owner approval are added." />
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
            <p>{lastProject ? `Saved as ${lastProject.status}. Backend generation still TODO.` : mode.meta}</p>
          </div>
        </div>
      </div>
      <div className="studio-project-ledger">
        <div className="console-topbar"><span>PROJECT LEDGER</span><span>{projects.length} SYNC READY</span></div>
        {projects.length ? projects.map((project) => (
          <article key={project.id}>
            <span>{project.outputType || project.type}</span>
            <h3>{project.title}</h3>
            <p>{project.entityName ? `${project.entityName} / ` : ''}{project.prompt}</p>
            <small>{project.status}</small>
          </article>
        )) : <p>Generated Studio concepts will save here as local projects.</p>}
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
  const { session, user } = useAuth()
  const liveCapability = useBackendCapability('livekit')
  const [reminders, setReminders] = useState(() => getReminders())
  const [localLiveEntity, setLocalLiveEntity] = useState(() => {
    const entity = getCurrentEntity()
    return entity?.live ? entity : null
  })
  const [active, setActive] = useState(0)
  const [liveActive, setLiveActive] = useState(false)
  const [liveSignalEarned, setLiveSignalEarned] = useState(0)
  const [aiViewerCount, setAiViewerCount] = useState(3)
  const [cohostCount, setCohostCount] = useState(1)
  const [liveRoomStatus, setLiveRoomStatus] = useState('')
  const [liveRoomTokenReady, setLiveRoomTokenReady] = useState(false)
  const videoRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const [localPreviewActive, setLocalPreviewActive] = useState(false)
  const [deviceStatus, setDeviceStatus] = useState('')
  const events = useMemo(() => {
    const localEvent = localLiveEntity ? [{
      id: `entity-live-${localLiveEntity.id}`,
      title: `${localLiveEntity.name.toUpperCase()} IS LIVE`,
      creator: localLiveEntity.name,
      format: localLiveEntity.liveFormat || 'Entity broadcast',
      time: 'LIVE NOW',
      viewers: 'Local room open',
      visual: 'event--zero',
      live: true,
      local: true,
    }] : []
    return [...localEvent, ...liveEvents]
  }, [localLiveEntity])
  const event = events[Math.min(active, events.length - 1)]
  const aiViewers = socialBotCreators.slice(0, aiViewerCount)

  useEffect(() => subscribeToNetworkUpdates(() => {
    const entity = getCurrentEntity()
    setLocalLiveEntity(entity?.live ? entity : null)
    setReminders(getReminders())
  }), [])

  useEffect(() => {
    if (active >= events.length) setActive(0)
  }, [active, events.length])

  useEffect(() => {
    if (!liveActive) return undefined
    const timer = window.setInterval(() => {
      setAiViewerCount((current) => Math.min(socialBotCreators.length, current + 1))
    }, 3800)
    return () => window.clearInterval(timer)
  }, [liveActive])

  useEffect(() => {
    if (!liveActive || !user) return undefined
    const timer = window.setInterval(() => {
      addCreatorSignalPoints(1, 'Signal Live watch-time reward')
      setLiveSignalEarned((current) => current + 1)
    }, 30000)
    return () => window.clearInterval(timer)
  }, [liveActive, user])

  useEffect(() => () => {
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((track) => track.stop())
  }, [])

  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) videoRef.current.srcObject = mediaStreamRef.current
  }, [localPreviewActive])

  async function startLocalPreview() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setDeviceStatus('Camera and microphone are not available in this browser.')
      return false
    }
    try {
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      })
      mediaStreamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      const videoReady = stream.getVideoTracks().some((track) => track.readyState === 'live')
      const audioReady = stream.getAudioTracks().some((track) => track.readyState === 'live')
      setLocalPreviewActive(videoReady || audioReady)
      setDeviceStatus(`${videoReady ? 'Camera online' : 'Camera unavailable'} / ${audioReady ? 'mic online' : 'mic unavailable'}`)
      return true
    } catch (error) {
      setLocalPreviewActive(false)
      setDeviceStatus(error.name === 'NotAllowedError' ? 'Camera/mic permission was blocked.' : error.message || 'Camera/mic could not start.')
      return false
    }
  }

  function stopLocalPreview() {
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setLocalPreviewActive(false)
  }

  async function toggleReminder(id) {
    const selected = events.find((item) => item.id === id)
    await toggleSocialReminder(user, id, {
      kind: 'live',
      title: selected?.title || id,
      detail: selected ? `${selected.creator} / ${selected.format}` : '',
      route: '/live',
    }).catch(() => null)
    setReminders(getReminders())
  }

  async function toggleLiveRoom() {
    if (liveActive) {
      setLiveActive(false)
      setLiveRoomTokenReady(false)
      stopLocalPreview()
      setLiveRoomStatus(liveRoomTokenReady ? 'Signal Live ended.' : 'Preview room closed.')
      return
    }

    setLiveActive(true)
    setLiveRoomTokenReady(false)
    await startLocalPreview()
    if (!liveActive) {
      setAiViewerCount(3)
      setLiveSignalEarned(0)
      setCohostCount(1)
    }

    if (!user) {
      setLiveRoomStatus('Preview mode active. Log in to request a real live-room token.')
      return
    }

    if (!liveCapability.validated) {
      setLiveRoomStatus(liveCapability.loading
        ? 'Checking LiveKit before opening a real room.'
        : 'Preview mode active. LiveKit is not validated in this environment yet.')
      return
    }

    try {
      if (!session?.access_token) throw new Error('Log in again to start a real Signal Live room.')
      const response = await fetch('/.netlify/functions/create-livekit-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          roomName: `static-social-${user.id.slice(0, 8)}`,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.ok === false) throw new Error(data.error || 'Live token could not be issued.')
      setLiveRoomTokenReady(Boolean(data.token && data.url))
      setLiveRoomStatus('Camera/mic preview is active and a protected LiveKit room token was issued. Remote publishing is ready for the livekit-client package install.')
    } catch (error) {
      setLiveRoomStatus(error.message || 'LiveKit token request failed.')
    }
  }

  function inviteCohost() {
    setLiveActive(true)
    setCohostCount((current) => Math.min(4, current + 1))
  }

  return (
    <div className="live-broadcasts">
      <div className={`live-room ${event.visual}`}>
        <div className="live-room__stage">
          {localPreviewActive ? <video ref={videoRef} muted autoPlay playsInline /> : <SignalMark animated />}
          <span>{localPreviewActive ? 'CAMERA / MIC ACTIVE' : event.live ? 'LIVE TRANSMISSION' : 'PREMIERE ROOM'}</span>
          {deviceStatus && <small>{deviceStatus}</small>}
        </div>
        <div className="live-room__info">
          <LiveIndicator label={liveActive ? 'SIGNAL LIVE' : event.time} />
          <h2>{event.title}</h2>
          <p>{event.creator} / {event.format}</p>
          <span>{event.viewers}</span>
          <div className="live-room__controls">
            <button type="button" onClick={toggleLiveRoom}>{liveActive ? 'End Signal Live' : user && liveCapability.validated ? 'Start Signal Live' : 'Preview Signal Live'}</button>
            <button type="button" onClick={inviteCohost}>{liveActive ? 'Invite Co-Host' : 'Add Guest'}</button>
            <strong>{user ? `+${liveSignalEarned} Signal` : 'Login to earn Signal'}</strong>
            <small>{liveRoomTokenReady ? 'Provider token ready' : liveCapability.validated ? 'LiveKit configured' : 'Preview mode until LiveKit is connected'}</small>
            {!user && <Link to="/login">Log in</Link>}
            {liveRoomStatus && <p className="live-room__status">{liveRoomStatus}</p>}
          </div>
        </div>
        <div className="live-room__chat">
          <span>ROOM SIGNAL</span>
          {(liveActive ? aiViewers.slice(-5) : socialBotCreators.slice(0, 3)).map((viewer, index) => (
            <p key={`${viewer.id}-${index}`}><i /> {viewer.handle.replace('@', '')}: {liveActive ? 'watching now' : 'waiting for the room to open'}</p>
          ))}
          {liveActive && <p><i /> system: AI creator audience is entering one by one</p>}
        </div>
        <div className="live-room__ai-audience">
          <span>AI creators watching</span>
          <div>
            {aiViewers.slice(0, 12).map((viewer) => (
              <img src={viewer.avatarUrl} alt="" title={`${viewer.displayName} is watching`} key={viewer.id} />
            ))}
          </div>
          <strong>{aiViewers.length} watching</strong>
        </div>
        <div className="live-room__cohosts">
          <span>Stream guests</span>
          {socialBotCreators.slice(3, 3 + cohostCount).map((creator) => (
            <article key={creator.id}>
              <img src={creator.avatarUrl} alt="" />
              <div><b>{creator.displayName}</b><small>{creator.handle} {liveActive ? 'is ready to join' : 'can be invited'}</small></div>
            </article>
          ))}
        </div>
      </div>
      <div className="event-rail">
        {events.map((item, index) => (
          <article className={index === active ? 'is-active' : ''} key={item.id}>
            <button className="event-rail__select" type="button" onClick={() => setActive(index)}>
              <span>0{index + 1}</span><div><b>{item.title}</b><small>{item.creator} / {item.format}</small></div><em>{item.time}</em>
            </button>
            {!item.live && (
              <button className={`reminder-button ${reminders[item.id] ? 'is-set' : ''}`} type="button" onClick={() => toggleReminder(item.id)}>
                {reminders[item.id] ? 'Reminder set' : 'Set reminder'}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

export function MarketplaceBrowser({ limit }) {
  const { user } = useAuth()
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [localDrops, setLocalDrops] = useState(() => getDrops())
  const [catalogActions, setCatalogActions] = useState(() => ({}))
  const categories = ['All', 'Worlds', 'Music Packs', 'Skins', 'Templates', 'Character Packs', 'Memberships', 'Creator Drops']
  const entities = getEntities()
  const localMarketDrops = localDrops.map((drop) => {
    const entity = entities.find((item) => item.id === drop.entityId)
    return {
      ...drop,
      id: drop.id,
      name: drop.name,
      creator: entity?.name || 'Your Entity',
      category: 'Creator Drops',
      price: 'ACCESS',
      edition: drop.type || 'Local drop',
      visual: 'drop--signal',
      detail: drop.description,
      local: true,
    }
  })
  const allDrops = [...localMarketDrops, ...marketDrops]
  const visible = (filter === 'All' ? allDrops : allDrops.filter((drop) => drop.category === filter)).slice(0, limit || allDrops.length)

  useEffect(() => subscribeToNetworkUpdates(() => {
    setLocalDrops(getDrops())
    setCatalogActions({})
  }), [])

  async function toggleDropAction(drop, action) {
    const next = await toggleSocialCatalogAction(user, drop, action)
      .then((result) => result.local)
      .catch(() => getCatalogAction(drop.id))
    const dropId = drop.id
    setCatalogActions((current) => ({ ...current, [dropId]: next }))
  }

  function actionFor(dropId) {
    return catalogActions[dropId] || getCatalogAction(dropId)
  }

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
          <div>
            <span>{selected.category}</span>
            <h2>{selected.name}</h2>
            <p>{selected.detail}</p>
            <strong>{selected.price}</strong>
            <div className="drop-action-stack">
              <button className={actionFor(selected.id).saved ? 'button button--primary' : 'button button--glass'} type="button" onClick={() => toggleDropAction(selected, 'saved')}>
                {actionFor(selected.id).saved ? 'Saved To Inventory' : 'Save To Inventory'}
              </button>
              <button className={actionFor(selected.id).requested ? 'button button--primary' : 'button button--glass'} type="button" onClick={() => toggleDropAction(selected, 'requested')}>
                {actionFor(selected.id).requested ? 'Access Requested' : 'Request Drop Access'}
              </button>
              <button className={actionFor(selected.id).followed ? 'button button--primary' : 'button button--glass'} type="button" onClick={() => toggleDropAction(selected, 'followed')}>
                {actionFor(selected.id).followed ? 'Venue Followed' : 'Follow Creator Venue'}
              </button>
            </div>
            <small>{user ? 'Signed-in intent can sync to Supabase. Payments and transactions are still intentionally blocked.' : 'No payment or transaction is wired in this preview. Sign in to sync intent beyond this device.'}</small>
          </div>
        </div>
      )}
    </div>
  )
}
