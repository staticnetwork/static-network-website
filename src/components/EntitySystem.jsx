import { useEffect, useState } from 'react'
import {
  createEntity,
  getChannelForEntity,
  getDrops,
  getEntities,
  getEntitySignals,
  getMedia,
  getWorlds,
  saveDrop,
  saveMedia,
  saveSignal,
  saveWorld,
  setEntityLive,
  setCurrentEntity,
  subscribeToNetworkUpdates,
} from '../lib/staticStore'
import { avatarCategories, defaultAvatarConfig } from '../lib/avatarConfig'
import { AvatarControlDeck, EntityAvatar, StoredMedia } from './AvatarSystem'
import { Link, useRouter } from './Router'
import { ArrowIcon, LiveIndicator, SignalMark } from './UI'

export { EntityAvatar } from './AvatarSystem'

const roleOptions = ['AI Artist', 'Virtual Host', 'Digital Influencer', 'Game Character', 'Podcast Host', 'Film Character', 'Brand Entity', 'World Narrator', 'CEO / Founder', 'Other']
const genreOptions = ['Music', 'Film', 'Gaming', 'Comedy', 'Fashion', 'Culture', 'News', 'Sports', 'Luxury', 'Sci-Fi', 'Horror', 'Drama', 'Business', 'Other']
const personalityOptions = ['Mysterious', 'Charismatic', 'Villain', 'Hero', 'Comedic', 'Luxury', 'Street', 'Spiritual', 'Corporate', 'Rebel', 'Visionary']
const toneOptions = ['Motivational', 'Funny', 'Dark', 'Savage', 'Elegant', 'Educational', 'Chaotic', 'Calm']
const visualOptions = ['Photoreal', 'Animated', 'Anime', 'Comic', 'Cinematic', 'Luxury Avatar', 'Cyberpunk', 'Streetwear', 'Fantasy', 'Alien', 'Robot', 'Mythic']
const presentationOptions = ['Male', 'Female', 'Nonbinary', 'Creature', 'Robot', 'Unknown', 'Custom']
const wardrobeOptions = ['Streetwear', 'Luxury', 'Futuristic', 'Western', 'Rocker', 'Athletic', 'Royal', 'Tactical', 'Formal', 'Fantasy']
const accessoryOptions = ['Jewelry', 'Mask', 'Glasses', 'Hat', 'Wings', 'Tech Gear', 'Weapon Prop', 'Instrument', 'None']
const voiceOptions = ['Deep', 'Smooth', 'High Energy', 'Calm', 'Robotic', 'Seductive', 'Narrator', 'Comedic', 'Villain', 'Heroic']
const worldOptions = ['City', 'Space Station', 'Fantasy Kingdom', 'Studio', 'Underground Club', 'Arena', 'Island', 'Digital Realm', 'Ranch', 'Luxury Tower', 'Street World', 'Custom']

const initialEntity = {
  name: '',
  handle: '',
  role: 'Virtual Host',
  genre: 'Culture',
  company: '',
  title: '',
  channelName: '',
  channelTagline: '',
  personality: 'Visionary',
  publicTone: 'Motivational',
  backstory: '',
  bio: '',
  visualStyle: 'Cinematic',
  presentation: 'Unknown',
  wardrobe: 'Futuristic',
  signatureColors: 'Black, silver, icy cyan',
  accessories: 'Tech Gear',
  voiceEnergy: 'Narrator',
  musicStyle: '',
  showFormat: '',
  liveFormat: '',
  postingStyle: '',
  homeWorld: '',
  worldType: 'Digital Realm',
  rivalAlly: '',
  fanbase: '',
  futureDrops: '',
  membershipIdea: '',
  merchandiseIdea: '',
  gameConcept: '',
  seriesConcept: '',
  avatarConfig: defaultAvatarConfig,
}

const steps = [
  { label: 'Identity', code: '01' },
  { label: 'Personality', code: '02' },
  { label: 'Appearance', code: '03' },
  { label: 'Voice / Media', code: '04' },
  { label: 'World', code: '05' },
  { label: 'Expansion', code: '06' },
]

function Field({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <label className="entity-field">
      <span>{label}</span>
      {type === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} rows="4" required={required} placeholder={placeholder} />
      ) : (
        <input name={name} value={value} onChange={onChange} type={type} required={required} placeholder={placeholder} />
      )}
    </label>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="entity-field">
      <span>{label}</span>
      <select name={name} value={value} onChange={onChange}>
        {options.map((option) => <option value={option} key={option}>{option}</option>)}
      </select>
    </label>
  )
}

export function EntityCard({ entity, preview = false }) {
  return (
    <article className={`entity-card ${preview ? 'entity-card--preview' : ''}`}>
      <div className="entity-card__status">
        <LiveIndicator label={entity.live ? 'ENTITY LIVE' : entity.status || 'ENTITY PREVIEW'} />
        <span>{entity.rank || 'RANK PENDING'}</span>
      </div>
      <EntityAvatar entity={entity} size="medium" />
      <div className="entity-card__identity">
        <span>{entity.role || 'SELECT ARCHETYPE'} / {entity.genre || 'SELECT LANE'}</span>
        <h3>{entity.name || 'YOUR ENTITY'}</h3>
        <p>{entity.handle ? (entity.handle.startsWith('@') ? entity.handle : `@${entity.handle}`) : '@handle'}</p>
      </div>
      <div className="entity-card__world">
        <span>{entity.company || 'COMPANY / WORLD'}</span>
        <b>{entity.channelTagline || 'Build the signal behind the identity.'}</b>
      </div>
      <div className="entity-card__footer">
        <span>{entity.badge || 'ORIGIN AVAILABLE'}</span>
        <span>SIGNAL SCORE {entity.signalScore || 'PENDING'}</span>
      </div>
    </article>
  )
}

export function EntityBuilder() {
  const { navigate } = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialEntity)
  const [saving, setSaving] = useState(false)

  function change(event) {
    const { name, value } = event.target
    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'name' && !current.channelName) next.channelName = value
      if (name === 'name' && !current.handle) next.handle = value.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '')
      return next
    })
  }

  function loadFounderExample() {
    setForm({
      ...initialEntity,
      name: 'Mr Stone',
      handle: 'mrstone',
      role: 'CEO / Founder',
      genre: 'Business',
      company: 'Above All AI',
      title: 'CEO',
      channelName: 'Mr Stone / Above All AI',
      channelTagline: 'Building the future above all.',
      personality: 'Visionary',
      publicTone: 'Motivational',
      bio: 'Founder and CEO of Above All AI. Building the future of AI entertainment, media, and synthetic culture.',
      backstory: 'A founder transmitting from the network origin and building an entertainment world above every existing category.',
      visualStyle: 'Cinematic',
      presentation: 'Male',
      wardrobe: 'Luxury',
      signatureColors: 'Black, silver, icy cyan',
      accessories: 'Jewelry',
      voiceEnergy: 'Deep',
      musicStyle: 'Cinematic future soul',
      showFormat: 'Founder transmissions and future-culture conversations',
      liveFormat: 'Executive broadcast',
      postingStyle: 'Direct, visionary, high signal',
      homeWorld: 'Above All Tower',
      worldType: 'Luxury Tower',
      rivalAlly: 'Allied with builders creating the synthetic future',
      fanbase: 'The Above All',
      futureDrops: 'Origin Signal founder collection',
      membershipIdea: 'Above All inner circle',
      merchandiseIdea: 'Founder uniform and signal hardware',
      gameConcept: 'Build a future media empire',
      seriesConcept: 'The making of synthetic culture',
    })
    setStep(0)
  }

  function submit(event) {
    event.preventDefault()
    if (step < steps.length - 1) {
      setStep((current) => current + 1)
      return
    }
    setSaving(true)
    const entity = createEntity(form)
    window.setTimeout(() => navigate(`/entities/profile?entity=${entity.id}`), 420)
  }

  return (
    <div className="entity-builder">
      <div className="entity-builder__header">
        <div>
          <span>ENTITY BUILDER / LOCAL CREATOR SYSTEM</span>
          <h2>Create the identity.<br />Launch the world.</h2>
        </div>
        <button className="text-action" type="button" onClick={loadFounderExample}>Load Genesis example <ArrowIcon /></button>
      </div>

      <div className="entity-builder__steps" aria-label="Entity creation progress">
        {steps.map((item, index) => (
          <button className={index === step ? 'is-active' : index < step ? 'is-complete' : ''} type="button" onClick={() => index <= step && setStep(index)} key={item.label}>
            <span>{item.code}</span><b>{item.label}</b><i />
          </button>
        ))}
      </div>

      <div className="entity-builder__workspace">
        <form onSubmit={submit}>
          <div className="builder-panel__top">
            <span>STEP {steps[step].code} / 06</span>
            <LiveIndicator label="LIVE PREVIEW" />
          </div>
          <h3>{steps[step].label}</h3>
          <div className="entity-field-grid">
            {step === 0 && <>
              <Field label="Entity Name" name="name" value={form.name} onChange={change} required placeholder="Mr Stone" />
              <Field label="Handle" name="handle" value={form.handle} onChange={change} required placeholder="mrstone" />
              <SelectField label="Role / Archetype" name="role" value={form.role} onChange={change} options={roleOptions} />
              <SelectField label="Genre / Lane" name="genre" value={form.genre} onChange={change} options={genreOptions} />
              <Field label="Company / Brand Name" name="company" value={form.company} onChange={change} placeholder="Above All AI" />
              <Field label="Title / Position" name="title" value={form.title} onChange={change} placeholder="CEO" />
              <Field label="Channel Name" name="channelName" value={form.channelName} onChange={change} required />
              <Field label="Channel Tagline" name="channelTagline" value={form.channelTagline} onChange={change} required />
            </>}
            {step === 1 && <>
              <SelectField label="Personality style" name="personality" value={form.personality} onChange={change} options={personalityOptions} />
              <SelectField label="Public tone" name="publicTone" value={form.publicTone} onChange={change} options={toneOptions} />
              <Field label="Backstory / Lore" name="backstory" value={form.backstory} onChange={change} type="textarea" placeholder="Where did this Entity come from?" />
              <Field label="Entity Bio" name="bio" value={form.bio} onChange={change} type="textarea" required placeholder="Introduce the public identity." />
            </>}
            {step === 2 && <>
              <div className="entity-field-grid__wide">
                <AvatarControlDeck
                  value={form.avatarConfig}
                  onChange={(avatarConfig) => setForm((current) => ({ ...current, avatarConfig }))}
                  compact
                />
              </div>
              <SelectField label="Visual style" name="visualStyle" value={form.visualStyle} onChange={change} options={visualOptions} />
              <SelectField label="Gender / presentation" name="presentation" value={form.presentation} onChange={change} options={presentationOptions} />
              <SelectField label="Wardrobe style" name="wardrobe" value={form.wardrobe} onChange={change} options={wardrobeOptions} />
              <Field label="Signature colors" name="signatureColors" value={form.signatureColors} onChange={change} />
              <SelectField label="Accessories" name="accessories" value={form.accessories} onChange={change} options={accessoryOptions} />
            </>}
            {step === 3 && <>
              <SelectField label="Voice energy" name="voiceEnergy" value={form.voiceEnergy} onChange={change} options={voiceOptions} />
              <Field label="Music style" name="musicStyle" value={form.musicStyle} onChange={change} />
              <Field label="Show format" name="showFormat" value={form.showFormat} onChange={change} />
              <Field label="Live format" name="liveFormat" value={form.liveFormat} onChange={change} />
              <Field label="Posting style" name="postingStyle" value={form.postingStyle} onChange={change} />
            </>}
            {step === 4 && <>
              <Field label="Home world name" name="homeWorld" value={form.homeWorld} onChange={change} required />
              <SelectField label="World type" name="worldType" value={form.worldType} onChange={change} options={worldOptions} />
              <Field label="Rival / ally concept" name="rivalAlly" value={form.rivalAlly} onChange={change} type="textarea" />
              <Field label="Fanbase name" name="fanbase" value={form.fanbase} onChange={change} />
            </>}
            {step === 5 && <>
              <Field label="Future drops" name="futureDrops" value={form.futureDrops} onChange={change} />
              <Field label="Membership idea" name="membershipIdea" value={form.membershipIdea} onChange={change} />
              <Field label="Merchandise idea" name="merchandiseIdea" value={form.merchandiseIdea} onChange={change} />
              <Field label="Game concept" name="gameConcept" value={form.gameConcept} onChange={change} type="textarea" />
              <Field label="Series / show concept" name="seriesConcept" value={form.seriesConcept} onChange={change} type="textarea" />
            </>}
          </div>
          <div className="entity-builder__controls">
            <button className="button button--glass" type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</button>
            <button className="button button--primary" type="submit" disabled={saving}>
              {saving ? 'Initializing Entity...' : step === steps.length - 1 ? 'Create Entity + Channel' : 'Continue'} <ArrowIcon />
            </button>
          </div>
        </form>
        <div className="entity-builder__preview">
          <div className="preview-orbit" aria-hidden="true"><i /><i /><i /></div>
          <span>PUBLIC IDENTITY PREVIEW</span>
          <EntityCard entity={form} preview />
          <p>Changes are rendered locally. Saving initializes the Entity and its Channel together.</p>
        </div>
      </div>
    </div>
  )
}

export function LocalSignalMedia({ signal, compact = false }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let active = true
    let objectUrl = ''
    if (signal.mediaId) {
      getMedia(signal.mediaId).then((record) => {
        if (!active || !record?.blob) return
        objectUrl = URL.createObjectURL(record.blob)
        setUrl(objectUrl)
      })
    }
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [signal.mediaId])

  const cloudUrl = signal.mediaUrls?.[0] || signal.media_urls?.[0]
  const cloudType = signal.fileType || signal.postType || signal.type || ''
  if (cloudUrl && /video/i.test(cloudType)) return <video className="local-signal-media" src={cloudUrl} controls playsInline preload="metadata" />
  if (cloudUrl && /audio/i.test(cloudType)) return <div className="local-audio"><SignalMark animated /><audio src={cloudUrl} controls preload="metadata" /></div>
  if (cloudUrl) return <img className="local-signal-media" src={cloudUrl} alt="" />
  if (url && signal.fileType?.startsWith('video/')) return <video className="local-signal-media" src={url} controls playsInline preload="metadata" />
  if (url && signal.fileType?.startsWith('image/')) return <img className="local-signal-media" src={url} alt="" />
  if (url && signal.fileType?.startsWith('audio/')) return <div className="local-audio"><SignalMark animated /><audio src={url} controls preload="metadata" /></div>

  return (
    <div className={`local-signal-visual ${compact ? 'local-signal-visual--compact' : ''}`}>
      <SignalMark animated />
      <span>{signal.type || 'TEXT SIGNAL'}</span>
      <b>{signal.entityName?.slice(0, 2).toUpperCase() || 'ST'}</b>
    </div>
  )
}

export function LocalSignalCard({ signal, onOpen }) {
  const entity = getEntities().find((item) => item.id === signal.entityId) || {
    name: signal.entityName,
    handle: signal.entityHandle,
    avatarConfig: signal.avatarConfig,
    profileImageRef: signal.profileImageRef,
    profileImageUrl: signal.profileImageUrl,
  }

  return (
    <article className="local-signal-card">
      <button type="button" onClick={() => onOpen?.(signal)}>
        <LocalSignalMedia signal={signal} compact />
        <div className="local-signal-card__body">
          <div><LiveIndicator label="ENTITY SIGNAL" /><span>{signal.visibility}</span></div>
          <div className="local-signal-card__author">
            <EntityAvatar entity={entity} size="small" pose={signal.avatarPose} />
            <p>{signal.entityName} <span>{signal.entityHandle}</span></p>
          </div>
          <h3>{signal.title}</h3>
          <small>{signal.caption}</small>
          <footer><span>{signal.type}</span><span>{signal.tags || 'LOCAL TRANSMISSION'}</span><b>Open signal <ArrowIcon /></b></footer>
        </div>
      </button>
    </article>
  )
}

function ModalFrame({ title, code, onClose, children, wide = false }) {
  return (
    <div className="entity-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button className="entity-modal__backdrop" type="button" onClick={onClose} aria-label="Close" />
      <section className={wide ? 'entity-modal__panel entity-modal__panel--wide' : 'entity-modal__panel'}>
        <header><span>{code}</span><LiveIndicator label="LOCAL TRANSMISSION" /><button type="button" onClick={onClose} aria-label="Close">×</button></header>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  )
}

export function UploadSignalModal({ entity, onClose, initialType = 'Text Signal', firstSignal = false }) {
  const [type, setType] = useState(firstSignal ? 'Status' : initialType)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [status, setStatus] = useState('')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl])

  function chooseFile(event) {
    const selected = event.target.files?.[0] || null
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(selected)
    setPreviewUrl(selected ? URL.createObjectURL(selected) : '')
  }

  async function publish(event) {
    event.preventDefault()
    setPublishing(true)
    const form = new FormData(event.currentTarget)
    let media = null
    if (file) media = await saveMedia(file, { ownerEntityId: entity.id, channelId: getChannelForEntity(entity.id)?.id })
    saveSignal({
      entityId: entity.id,
      entityName: entity.name,
      entityHandle: entity.handle,
      company: entity.company,
      badge: entity.badge,
      signalScore: entity.signalScore,
      avatarConfig: entity.avatarConfig,
      profileImageRef: entity.profileImageRef,
      avatarPose: form.get('avatarPose'),
      type,
      postType: type,
      title: form.get('title'),
      caption: form.get('caption'),
      text: form.get('caption'),
      tags: form.get('tags'),
      visibility: form.get('visibility'),
      mediaId: media?.id || null,
      mediaRefs: media?.id ? [media.id] : [],
      fileName: media?.fileName || '',
      fileType: media?.fileType || '',
    })
    setPublishing(false)
    setStatus('Signal transmitted.')
    window.setTimeout(onClose, 850)
  }

  const acceptsMedia = ['Video', 'Image', 'Audio'].includes(type)

  return (
    <ModalFrame title={firstSignal ? 'Post First Signal' : 'Upload Signal'} code="SIGNAL//COMPOSER" onClose={onClose} wide>
      <form className="signal-composer" onSubmit={publish}>
        <div className="signal-composer__form">
          <label><span>CONTENT TYPE</span><select value={type} onChange={(event) => setType(event.target.value)}>
            {(firstSignal
              ? ['Status', 'Music Drop', 'Video Clip', 'Live Announcement', 'Game World', 'Marketplace Drop', 'Original Series']
              : ['Text Signal', 'Video', 'Image', 'Audio', 'Link', 'Drop Announcement', 'Live Announcement', 'Game World', 'Original Series']
            ).map((option) => <option key={option}>{option}</option>)}
          </select></label>
          <label><span>TITLE</span><input name="title" required placeholder="Name the transmission" /></label>
          <label><span>CAPTION / SIGNAL TEXT</span><textarea name="caption" rows="5" required placeholder="What is the Entity transmitting?" /></label>
          <label><span>TAGS</span><input name="tags" placeholder="culture, future, origin" /></label>
          <label><span>VISIBILITY</span><select name="visibility"><option>Public</option><option>Private Beta</option><option>Draft</option></select></label>
          <label><span>AVATAR POSE</span><select name="avatarPose" defaultValue={entity.avatarConfig?.pose || 'Idle'}>
            {avatarCategories.pose.pose.map((option) => <option key={option}>{option}</option>)}
          </select></label>
          {acceptsMedia && <label className="file-field"><span>UPLOAD {type.toUpperCase()}</span><input type="file" accept={`${type.toLowerCase()}/*`} onChange={chooseFile} required /></label>}
          {type === 'Video' && <label className="file-field"><span>OPTIONAL THUMBNAIL</span><input type="file" accept="image/*" /></label>}
          <button className="button button--primary button--wide" type="submit" disabled={publishing}>
            {publishing ? 'Transmitting...' : 'Transmit Signal'} <ArrowIcon />
          </button>
          <p className="form-status" role="status">{status}</p>
        </div>
        <div className="signal-composer__preview">
          <span>TRANSMISSION PREVIEW</span>
          {previewUrl && file?.type.startsWith('video/') && <video src={previewUrl} controls playsInline />}
          {previewUrl && file?.type.startsWith('image/') && <img src={previewUrl} alt="Upload preview" />}
          {previewUrl && file?.type.startsWith('audio/') && <audio src={previewUrl} controls />}
          {!previewUrl && <div><EntityAvatar entity={entity} size="post" /><b>{entity.name}</b><small>{type}</small></div>}
        </div>
      </form>
    </ModalFrame>
  )
}

export function LiveEntityMode({ entity, onClose, onEntityChange }) {
  const [started, setStarted] = useState(Boolean(entity.live))
  const chat = ['signal_origin: identity locked', 'worldbuilder: broadcast looks unreal', 'static_one: transmission received']

  function toggle() {
    const next = !started
    setStarted(next)
    const updated = setEntityLive(entity, next)
    onEntityChange?.(updated)
    if (next) {
      saveSignal({
        entityId: entity.id,
        entityName: entity.name,
        entityHandle: entity.handle,
        company: entity.company,
        badge: entity.badge,
        signalScore: entity.signalScore,
        type: 'Live Announcement',
        title: `${entity.name.toUpperCase()} IS LIVE`,
        caption: `${entity.channelTagline || 'A new Entity transmission has started.'}`,
        tags: 'live, entity broadcast',
        visibility: 'Public',
      })
    }
  }

  return (
    <ModalFrame title="Go Live As Entity" code="LIVE//ENTITY-FILTER" onClose={onClose} wide>
      <div className={`entity-live ${started ? 'is-live' : ''}`}>
        <div className="entity-live__frame">
          <div className="entity-filter"><EntityAvatar entity={entity} size="live" pose="Live Host" /><i /><i /></div>
          <div className="entity-live__status"><LiveIndicator label={started ? 'TRANSMISSION LIVE' : 'BROADCAST STANDBY'} /><span>ENTITY FILTER ACTIVE</span></div>
          <div className="entity-live__identity"><h3>{entity.name}</h3><p>{entity.handle} / {entity.liveFormat || 'Entity broadcast'}</p></div>
        </div>
        <aside>
          <div className="console-topbar"><span>LIVE CHAT</span><span>LOCAL ROOM</span></div>
          {chat.map((message) => <p key={message}><i />{message}</p>)}
          <div className="filter-stack">
            <span>IDENTITY TRANSFORMATION</span>
            <b>Face replacement</b><b>Avatar overlay</b><b>Style presets</b><b>World effects</b>
          </div>
          <button className="button button--primary button--wide" type="button" onClick={toggle}>{started ? 'End Transmission' : 'Transmission Started'} <ArrowIcon /></button>
        </aside>
      </div>
    </ModalFrame>
  )
}

export function WorldBuilderModal({ entity, onClose }) {
  const [status, setStatus] = useState('')
  function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    saveWorld({
      entityId: entity.id,
      title: form.get('title'),
      setting: form.get('setting'),
      mood: form.get('mood'),
      visualStyle: form.get('visualStyle'),
      contentTypes: form.get('contentTypes'),
    })
    setStatus('World saved to the Entity network.')
    window.setTimeout(onClose, 800)
  }
  return (
    <ModalFrame title="Build World" code="WORLD//COMPOSER" onClose={onClose}>
      <form className="entity-tool-form" onSubmit={submit}>
        <label><span>WORLD TITLE</span><input name="title" required /></label>
        <label><span>SETTING</span><input name="setting" required placeholder="A luxury tower above a permanent storm" /></label>
        <label><span>MOOD</span><input name="mood" required placeholder="Cinematic, ambitious, mysterious" /></label>
        <label><span>VISUAL STYLE</span><input name="visualStyle" required placeholder={entity.visualStyle} /></label>
        <label><span>RELATED CONTENT</span><input name="contentTypes" placeholder="Shows, music, games, live broadcasts" /></label>
        <button className="button button--primary button--wide" type="submit">Save World <ArrowIcon /></button>
        <p className="form-status">{status}</p>
      </form>
    </ModalFrame>
  )
}

export function DropBuilderModal({ entity, onClose }) {
  const [status, setStatus] = useState('')
  function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    saveDrop({ entityId: entity.id, name: form.get('name'), type: form.get('type'), description: form.get('description') })
    setStatus('Drop saved to the Entity network.')
    window.setTimeout(onClose, 800)
  }
  return (
    <ModalFrame title="Create Drop" code="MARKET//DROP-BUILDER" onClose={onClose}>
      <form className="entity-tool-form" onSubmit={submit}>
        <label><span>DROP NAME</span><input name="name" required /></label>
        <label><span>DROP TYPE</span><select name="type">{['Skin', 'Music Pack', 'Poster', 'Membership', 'Game Asset', 'Character Pack'].map((option) => <option key={option}>{option}</option>)}</select></label>
        <label><span>DESCRIPTION</span><textarea name="description" rows="5" required /></label>
        <button className="button button--primary button--wide" type="submit">Save Drop <ArrowIcon /></button>
        <p className="form-status">{status}</p>
      </form>
    </ModalFrame>
  )
}

export function EntityActionHub({ entity, compact = false, onEntityChange }) {
  const [tool, setTool] = useState('')
  if (!entity) return null

  const actions = [
    ['Upload Signal', 'upload'],
    ['Post First Signal', 'first'],
    ['Go Live As Entity', 'live'],
    ['Build World', 'world'],
    ['Create Drop', 'drop'],
  ]

  return (
    <>
      <div className={`entity-action-hub ${compact ? 'entity-action-hub--compact' : ''}`}>
        {actions.map(([label, id], index) => (
          <button className={index === 0 ? 'is-primary' : ''} type="button" onClick={() => setTool(id)} key={id}>
            <span>0{index + 1}</span><b>{label}</b><ArrowIcon />
          </button>
        ))}
        <Link to={`/channels/${entity.handle.replace('@', '')}`}><span>06</span><b>View Channel</b><ArrowIcon /></Link>
        <Link to="/entities/avatar"><span>07</span><b>Customize Avatar</b><ArrowIcon /></Link>
        <Link to="/channel/customize"><span>08</span><b>Customize Channel</b><ArrowIcon /></Link>
        <Link to="/feed"><span>09</span><b>Open Entity Feed</b><ArrowIcon /></Link>
        <button type="button" onClick={() => setCurrentEntity(entity.id)}><span>10</span><b>Set As Default Entity</b><ArrowIcon /></button>
        <Link to="/entities/generate"><span>11</span><b>Generate Official Images</b><ArrowIcon /></Link>
      </div>
      {tool === 'upload' && <UploadSignalModal entity={entity} onClose={() => setTool('')} />}
      {tool === 'first' && <UploadSignalModal entity={entity} firstSignal onClose={() => setTool('')} />}
      {tool === 'live' && <LiveEntityMode entity={entity} onEntityChange={onEntityChange} onClose={() => setTool('')} />}
      {tool === 'world' && <WorldBuilderModal entity={entity} onClose={() => setTool('')} />}
      {tool === 'drop' && <DropBuilderModal entity={entity} onClose={() => setTool('')} />}
    </>
  )
}

export function EntityProfile({ initialEntity, channelMode = false }) {
  const [entity, setEntity] = useState(initialEntity)
  const [tab, setTab] = useState(channelMode ? 'Feed' : 'Signals')
  const [, setVersion] = useState(0)

  useEffect(() => subscribeToNetworkUpdates(() => setVersion((value) => value + 1)), [])

  const channel = getChannelForEntity(entity.id)
  const signals = getEntitySignals(entity.id)
  const worlds = getWorlds(entity.id)
  const drops = getDrops(entity.id)
  const tabs = channelMode
    ? ['Feed', 'Videos', 'Shorts', 'Live', 'Music', 'Worlds', 'Drops', 'About']
    : ['Signals', 'Channel', 'Videos', 'Music', 'Live', 'Originals', 'Play', 'Marketplace', 'Drops', 'Worlds', 'About']

  const visibleSignals = tab === 'Videos'
    ? signals.filter((signal) => signal.type.includes('Video') || signal.fileType?.startsWith('video/'))
    : tab === 'Shorts'
      ? signals.filter((signal) => signal.type.includes('Clip') || (signal.fileType?.startsWith('video/') && signal.title?.toLowerCase().includes('short')))
    : tab === 'Music'
      ? signals.filter((signal) => signal.type.includes('Music') || signal.fileType?.startsWith('audio/'))
      : tab === 'Live'
        ? signals.filter((signal) => signal.type.includes('Live'))
        : signals

  function renderTab() {
    if (tab === 'About') {
      return <div className="entity-about-grid">
        <article><span>PERSONALITY</span><h3>{entity.personality}</h3><p>{entity.publicTone} public tone. {entity.backstory}</p></article>
        <article><span>APPEARANCE</span><h3>{entity.visualStyle}</h3><p>{entity.presentation}; {entity.wardrobe}; {entity.signatureColors}; {entity.accessories}.</p></article>
        <article><span>VOICE / MEDIA</span><h3>{entity.voiceEnergy}</h3><p>{entity.showFormat || 'Format developing'} / {entity.liveFormat || 'Live identity developing'} / {entity.postingStyle || 'Signal style developing'}.</p></article>
        <article><span>WORLD</span><h3>{entity.homeWorld}</h3><p>{entity.worldType}. {entity.rivalAlly} Fanbase: {entity.fanbase || 'Unassigned'}.</p></article>
      </div>
    }
    if (tab === 'Worlds') return <EntityCollection items={worlds} empty="Build the first world for this Entity." />
    if (tab === 'Drops' || tab === 'Marketplace') return <EntityCollection items={drops} empty="Create the first drop for this Entity." />
    if (tab === 'Channel') return <div className="entity-module-callout"><span>ENTITY CHANNEL</span><h3>{channel?.name}</h3><p>{channel?.tagline}</p><Link className="button button--primary" to={`/channels/${entity.handle.replace('@', '')}`}>Open Channel <ArrowIcon /></Link></div>
    if (['Originals', 'Play'].includes(tab)) return <div className="entity-module-callout"><span>{tab.toUpperCase()} MODULE</span><h3>{tab === 'Play' ? entity.gameConcept || 'Build a playable world.' : entity.seriesConcept || 'Create an original series.'}</h3><p>The Entity carries one identity across every format in its world.</p><Link className="button button--primary" to={tab === 'Play' ? '/play' : '/originals'}>Open {tab} <ArrowIcon /></Link></div>
    return visibleSignals.length ? <div className="entity-signal-grid">{visibleSignals.map((signal) => <LocalSignalCard signal={signal} key={signal.id} />)}</div> : <div className="entity-empty"><SignalMark animated /><h3>No {tab.toLowerCase()} transmitted yet.</h3><p>The next Entity transmission will appear here instantly.</p></div>
  }

  return (
    <div className={`entity-profile ${channelMode ? 'entity-profile--channel' : ''}`} style={{ '--channel-accent': channel?.theme?.accentColor || '#78e8ff' }}>
      {channelMode && (
        <section className={`channel-profile__banner channel-theme--${(channel?.theme?.style || 'broadcast').toLowerCase().replace(/\s+/g, '-')}`}>
          {channel?.bannerRef && <StoredMedia mediaRef={channel.bannerRef} as={channel.bannerType?.startsWith('video/') ? 'video' : 'img'} alt={`${channel.displayName || entity.name} Channel banner`} />}
          {!channel?.bannerRef && channel?.bannerUrl && <img src={channel.bannerUrl} alt={`${channel.displayName || entity.name} Channel banner`} />}
          {!channel?.bannerRef && !channel?.bannerUrl && <div className="channel-profile__generated-banner"><SignalMark animated /><i /><i /><i /></div>}
          <div className="channel-profile__banner-copy">
            <span>{channel?.theme?.style || 'Broadcast'} / {channel?.theme?.layoutStyle || 'Media Grid'}</span>
            <h2>{channel?.theme?.bannerHeadline || channel?.tagline}</h2>
            <LiveIndicator label={entity.live ? 'TRANSMISSION LIVE' : 'CHANNEL ONLINE'} />
          </div>
        </section>
      )}
      <section className="entity-profile__hero">
          <div className="entity-profile__visual"><EntityAvatar entity={entity} size="profile" /><div className="entity-profile__world-grid" /></div>
        <div className="entity-profile__identity">
          <div><LiveIndicator label={entity.live ? 'ENTITY LIVE' : entity.status} /><span>{entity.rank}</span><span>{entity.badge}</span></div>
          <p>{entity.role} / {entity.genre}</p>
          <h1>{channelMode ? channel?.name || entity.name : entity.name}</h1>
          <h2>{entity.handle}</h2>
          <blockquote>{channelMode ? channel?.tagline : entity.bio}</blockquote>
          {channelMode && <div className="button-row channel-profile__actions">
            <button className="button button--primary" type="button">Follow / Request Access</button>
            <Link className="button button--glass" to="/channel/customize">Customize Channel</Link>
          </div>}
          <div className="entity-profile__meta">
            <span><b>{entity.signalScore}</b>SIGNAL SCORE</span>
            <span><b>{entity.company || 'INDEPENDENT'}</b>COMPANY / BRAND</span>
            <span><b>{entity.title || entity.role}</b>POSITION</span>
            <span><b>{entity.fanbase || 'FORMING'}</b>FANBASE</span>
          </div>
        </div>
      </section>
      <EntityActionHub entity={entity} onEntityChange={setEntity} />
      <nav className="entity-profile__tabs" aria-label="Entity content">
        {tabs.map((item) => <button className={tab === item ? 'is-active' : ''} type="button" onClick={() => setTab(item)} key={item}>{item}</button>)}
      </nav>
      <section className="entity-profile__content">{renderTab()}</section>
    </div>
  )
}

function EntityCollection({ items, empty }) {
  if (!items.length) return <div className="entity-empty"><SignalMark animated /><h3>{empty}</h3><p>Use the Entity controls above to initialize this module.</p></div>
  return <div className="entity-collection">{items.map((item) => <article key={item.id}><span>{item.type || item.worldType || 'ENTITY WORLD'}</span><h3>{item.name || item.title}</h3><p>{item.description || item.setting}</p><small>{new Date(item.createdAt).toLocaleDateString()}</small></article>)}</div>
}
