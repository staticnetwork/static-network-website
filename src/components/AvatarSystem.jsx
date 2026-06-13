/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from 'react'
import { avatarCategories, avatarPoseClass, normalizeAvatarConfig } from '../lib/avatarConfig'
import { getMedia, saveEntity } from '../lib/staticStore'
import { ArrowIcon, LiveIndicator, SignalMark } from './UI'

const categoryLabels = {
  base: 'Base',
  face: 'Face',
  hair: 'Hair',
  outfit: 'Outfit',
  shoes: 'Shoes',
  accessories: 'Accessories',
  effects: 'Aura',
  pose: 'Pose',
  background: 'Background',
  card: 'Card Style',
}

const controlLabels = {
  bodyType: 'Body Type',
  presentation: 'Presentation',
  material: 'Skin / Material',
  height: 'Height',
  faceShape: 'Face Shape',
  eyes: 'Eyes',
  eyebrows: 'Eyebrows',
  nose: 'Nose',
  mouth: 'Mouth',
  facialHair: 'Facial Hair',
  marks: 'Scars / Marks',
  expression: 'Expression',
  hairStyle: 'Hair Style',
  hairLength: 'Hair Length',
  outfit: 'Outfit',
  shoes: 'Shoes',
  accessory: 'Accessory',
  effect: 'Aura / Effect',
  pose: 'Pose / Emote',
  background: 'Background',
  cardStyle: 'Avatar Card',
}

const materialColors = {
  Umber: '#5c3525',
  Sienna: '#8f563b',
  Bronze: '#b77750',
  Sand: '#d1a27d',
  Porcelain: '#ead0bd',
  Metallic: '#9099a8',
  Chrome: '#dce8f2',
  Shadow: '#1b2130',
  Hologram: '#83eaff',
  Alien: '#7fc6a4',
  Synthetic: '#c1b8ff',
}

const backgroundStyles = {
  Studio: ['#111827', '#27364e'],
  City: ['#060910', '#182c4a'],
  'Luxury Office': ['#120e10', '#513a2c'],
  'Digital Realm': ['#07101d', '#203d72'],
  Stage: ['#100918', '#482d6c'],
  'Broadcast Room': ['#080b0f', '#19344b'],
  Space: ['#03040a', '#171f48'],
  Street: ['#0b0b0d', '#2f3440'],
  Arena: ['#110b0b', '#5a2f3c'],
  'Custom Gradient': ['#0b1020', '#352766'],
}

export function useStoredMedia(ref) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let objectUrl = ''
    let active = true
    if (ref) {
      getMedia(ref).then((record) => {
        if (!active || !record?.blob) return
        objectUrl = URL.createObjectURL(record.blob)
        setUrl(objectUrl)
      })
    } else {
      setUrl('')
    }
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [ref])

  return url
}

export function StoredMedia({ mediaRef, as = 'img', className = '', alt = '', controls = false }) {
  const url = useStoredMedia(mediaRef)
  if (!url) return null
  if (as === 'video') return <video className={className} src={url} controls={controls} autoPlay={!controls} muted loop playsInline />
  return <img className={className} src={url} alt={alt} />
}

export function EntityAvatar({
  entity,
  size = 'medium',
  pose,
  className = '',
  useProfileImage = true,
}) {
  const config = normalizeAvatarConfig(entity?.avatarConfig, entity)
  const storedProfileUrl = useStoredMedia(useProfileImage ? entity?.profileImageRef : '')
  const profileUrl = storedProfileUrl || (useProfileImage ? entity?.profileImageUrl || entity?.profile_image_url || '' : '')
  const currentPose = pose || config.pose
  const [bgA, bgB] = backgroundStyles[config.background] || backgroundStyles['Digital Realm']
  const skin = materialColors[config.material] || materialColors.Shadow
  const initials = (entity?.name || 'STATIC ENTITY').split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()
  const style = {
    '--avatar-skin': skin,
    '--avatar-hair': config.hairColor,
    '--avatar-outfit': config.outfitColor,
    '--avatar-accent': config.accentColor,
    '--avatar-glow': config.glowColor,
    '--avatar-bg-a': config.backgroundColor || bgA,
    '--avatar-bg-b': bgB,
  }

  if (profileUrl) {
    return (
      <div className={`visual-avatar visual-avatar--${size} visual-avatar--image ${className}`} style={style}>
        <img src={profileUrl} alt={`${entity?.name || 'Entity'} profile`} />
        <div className="visual-avatar__image-frame"><i /><i /></div>
      </div>
    )
  }

  return (
    <div
      className={`visual-avatar visual-avatar--${size} avatar-pose--${avatarPoseClass(currentPose)} avatar-effect--${avatarPoseClass(config.effect)} avatar-card--${avatarPoseClass(config.cardStyle)} ${className}`}
      style={style}
      aria-label={`${entity?.name || 'Entity'} avatar, ${currentPose} pose`}
      role="img"
    >
      <div className="visual-avatar__environment"><i /><i /><i /></div>
      <div className="visual-avatar__signal-ring"><i /><i /></div>
      <div className={`visual-avatar__body body--${avatarPoseClass(config.bodyType)} height--${avatarPoseClass(config.height)}`}>
        <div className="avatar-shadow" />
        <div className="avatar-leg avatar-leg--left"><i /></div>
        <div className="avatar-leg avatar-leg--right"><i /></div>
        <div className={`avatar-torso outfit--${avatarPoseClass(config.outfit)}`}>
          <i className="avatar-lapel avatar-lapel--left" /><i className="avatar-lapel avatar-lapel--right" />
          <span>{initials}</span>
        </div>
        <div className="avatar-arm avatar-arm--left"><i className="avatar-hand" /></div>
        <div className="avatar-arm avatar-arm--right"><i className="avatar-hand" /></div>
        <div className={`avatar-neck material--${avatarPoseClass(config.material)}`} />
        <div className={`avatar-head face--${avatarPoseClass(config.faceShape)} material--${avatarPoseClass(config.material)}`}>
          <div className={`avatar-hair hair--${avatarPoseClass(config.hairStyle)} hair-length--${avatarPoseClass(config.hairLength)}`} />
          <div className={`avatar-eyebrows brows--${avatarPoseClass(config.eyebrows)}`}><i /><i /></div>
          <div className={`avatar-eyes eyes--${avatarPoseClass(config.eyes)}`}><i /><i /></div>
          <div className={`avatar-nose nose--${avatarPoseClass(config.nose)}`} />
          <div className={`avatar-mouth mouth--${avatarPoseClass(config.mouth)} expression--${avatarPoseClass(config.expression)}`} />
          {config.facialHair !== 'None' && <div className={`avatar-facial-hair facial--${avatarPoseClass(config.facialHair)}`} />}
          {config.marks !== 'None' && <div className={`avatar-mark mark--${avatarPoseClass(config.marks)}`} />}
        </div>
        {config.accessory !== 'None' && <div className={`avatar-accessory accessory--${avatarPoseClass(config.accessory)}`}><i /><b /></div>}
      </div>
      <div className="visual-avatar__telemetry"><span>{currentPose}</span><span>{config.outfit}</span></div>
    </div>
  )
}

export function AvatarControlDeck({ value, onChange, compact = false }) {
  const [category, setCategory] = useState('base')
  const config = normalizeAvatarConfig(value)
  const controls = avatarCategories[category]

  function set(key, nextValue) {
    onChange({ ...config, [key]: nextValue })
  }

  return (
    <div className={`avatar-control-deck ${compact ? 'avatar-control-deck--compact' : ''}`}>
      <div className="avatar-category-tabs" role="tablist" aria-label="Avatar categories">
        {Object.keys(avatarCategories).map((item, index) => (
          <button className={category === item ? 'is-active' : ''} type="button" onClick={() => setCategory(item)} key={item}>
            <span>{String(index + 1).padStart(2, '0')}</span>{categoryLabels[item]}
          </button>
        ))}
      </div>
      <div className="avatar-controls">
        <div className="console-topbar"><span>{categoryLabels[category].toUpperCase()} MODULE</span><LiveIndicator label="LIVE RENDER" /></div>
        {Object.entries(controls).map(([key, options]) => (
          <fieldset key={key}>
            <legend>{controlLabels[key]}</legend>
            <div className="avatar-option-grid">
              {options.map((option) => (
                <button className={config[key] === option ? 'is-active' : ''} type="button" onClick={() => set(key, option)} key={option}>
                  <i />{option}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        {category === 'hair' && <ColorControls config={config} set={set} items={[['hairColor', 'Hair Color'], ['facialHairColor', 'Facial Hair']]} />}
        {category === 'outfit' && <ColorControls config={config} set={set} items={[['outfitColor', 'Outfit Color'], ['accentColor', 'Outfit Accent']]} />}
        {category === 'effects' && <ColorControls config={config} set={set} items={[['glowColor', 'Glow Color']]} />}
        {category === 'background' && <ColorControls config={config} set={set} items={[['backgroundColor', 'Custom Color']]} />}
      </div>
    </div>
  )
}

function ColorControls({ config, set, items }) {
  return <div className="avatar-color-controls">{items.map(([key, label]) => <label key={key}><span>{label}</span><input type="color" value={config[key]} onChange={(event) => set(key, event.target.value)} /><b>{config[key]}</b></label>)}</div>
}

export function AvatarStudio({ entity, onSave, embedded = false }) {
  const [config, setConfig] = useState(() => normalizeAvatarConfig(entity?.avatarConfig, entity))
  const [view, setView] = useState('fullBody')
  const [status, setStatus] = useState('')
  const previewEntity = useMemo(() => ({ ...entity, avatarConfig: config }), [config, entity])

  function save() {
    const updated = saveEntity({ ...entity, avatarConfig: config })
    onSave?.(updated)
    setStatus('Avatar signal saved.')
  }

  return (
    <div className={`avatar-studio ${embedded ? 'avatar-studio--embedded' : ''}`}>
      <div className="avatar-studio__stage">
        <header><span>ENTITY AVATAR / VISUAL CORE</span><LiveIndicator label="RENDERING LIVE" /></header>
        <div className="avatar-view-switcher">
          {['profile', 'post', 'fullBody', 'live'].map((item) => <button className={view === item ? 'is-active' : ''} type="button" onClick={() => setView(item)} key={item}>{item}</button>)}
        </div>
        <EntityAvatar entity={previewEntity} size={view} useProfileImage={false} />
        <div className="avatar-stage__identity"><span>{entity?.role || 'ENTITY'}</span><h2>{entity?.name || 'NEW ENTITY'}</h2><p>{config.pose} / {config.outfit} / {config.effect}</p></div>
      </div>
      <div className="avatar-studio__controls">
        <AvatarControlDeck value={config} onChange={setConfig} />
        <div className="avatar-save-bar">
          <p className="form-status">{status}</p>
          <button className="button button--primary" type="button" onClick={save}>Save Avatar <ArrowIcon /></button>
        </div>
      </div>
    </div>
  )
}
