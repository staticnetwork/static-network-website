import { useEffect, useMemo, useState } from 'react'
import { avatarCategories } from '../lib/avatarConfig'
import {
  addSignalComment,
  getChannelForEntity,
  getCurrentEntity,
  getEntities,
  getSignals,
  saveMedia,
  saveSignal,
  subscribeToNetworkUpdates,
  updateSignal,
} from '../lib/staticStore'
import { EntityAvatar } from './AvatarSystem'
import { LocalSignalMedia } from './EntitySystem'
import { Link } from './Router'
import { ArrowIcon, LiveIndicator, SignalMark } from './UI'

const postTypes = ['Text', 'Image', 'Video', 'Audio', 'Link', 'Live Announcement', 'Drop', 'World', 'Original', 'Game']

function relativeTime(value) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export function EntityComposer({ onTransmitted }) {
  const entities = getEntities()
  const current = getCurrentEntity()
  const [entityId, setEntityId] = useState(current?.id || entities[0]?.id || '')
  const [postType, setPostType] = useState('Text')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [draftText, setDraftText] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('static_sage_signal_draft') || '{}').text || ''
    } catch {
      return ''
    }
  })
  const entity = entities.find((item) => item.id === entityId) || current

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  useEffect(() => {
    function loadSageDraft() {
      try {
        const draft = JSON.parse(localStorage.getItem('static_sage_signal_draft') || '{}')
        if (draft.text) setDraftText(draft.text)
        if (draft.entityId) setEntityId(draft.entityId)
      } catch {
        // Ignore malformed local assistant drafts.
      }
    }
    window.addEventListener('static:sage-prefill', loadSageDraft)
    loadSageDraft()
    return () => window.removeEventListener('static:sage-prefill', loadSageDraft)
  }, [])

  function chooseFile(event) {
    const next = event.target.files?.[0] || null
    if (preview) URL.revokeObjectURL(preview)
    setFile(next)
    setPreview(next ? URL.createObjectURL(next) : '')
  }

  async function transmit(event) {
    event.preventDefault()
    if (!entity) return
    setBusy(true)
    setStatus('')
    const form = new FormData(event.currentTarget)
    try {
      const channel = getChannelForEntity(entity.id)
      const media = file
        ? await saveMedia(file, { ownerEntityId: entity.id, channelId: channel?.id, type: postType.toLowerCase() })
        : null
      const signal = saveSignal({
        entityId: entity.id,
        channelId: channel?.id || '',
        entityName: entity.name,
        entityHandle: entity.handle,
        company: entity.companyBrand || entity.company,
        badge: entity.badge,
        signalScore: entity.signalScore,
        avatarConfig: entity.avatarConfig,
        profileImageRef: entity.profileImageRef,
        avatarPose: form.get('avatarPose'),
        postType,
        type: postType,
        title: form.get('title') || `${entity.name} transmission`,
        text: form.get('text'),
        caption: form.get('text'),
        linkUrl: form.get('linkUrl') || '',
        tags: form.get('tags') || '',
        visibility: form.get('visibility'),
        mediaId: media?.id || null,
        mediaRefs: media?.id ? [media.id] : [],
        fileName: media?.fileName || '',
        fileType: media?.fileType || '',
      })
      event.currentTarget.reset()
      setFile(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview('')
      setPostType('Text')
      setDraftText('')
      localStorage.removeItem('static_sage_signal_draft')
      setStatus('Signal transmitted.')
      onTransmitted?.(signal)
    } catch (error) {
      setStatus(error.message || 'The signal could not be stored on this device.')
    } finally {
      setBusy(false)
    }
  }

  if (!entity) {
    return (
      <div className="feed-composer feed-composer--empty">
        <SignalMark animated />
        <div><span>ENTITY REQUIRED</span><h2>Humans build backstage. Entities transmit publicly.</h2><p>Create an Entity to unlock the Signal composer.</p></div>
        <Link className="button button--primary" to="/entities/create">Create Entity <ArrowIcon /></Link>
      </div>
    )
  }

  const acceptsMedia = ['Image', 'Video', 'Audio'].includes(postType)

  return (
    <form className="feed-composer" onSubmit={transmit}>
      <div className="feed-composer__identity">
        <EntityAvatar entity={entity} size="post" />
        <div><span>TRANSMITTING AS</span><h2>{entity.name}</h2><p>{entity.handle} / {entity.companyBrand || entity.company || 'Independent Entity'}</p></div>
        {entities.length > 1 && <label><span>ACTIVE ENTITY</span><select value={entityId} onChange={(event) => setEntityId(event.target.value)}>{entities.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>}
      </div>
      <div className="feed-composer__prompt">
        <textarea name="text" rows="4" required value={draftText} onChange={(event) => setDraftText(event.target.value)} placeholder="What is your Entity transmitting?" />
        {preview && file?.type.startsWith('image/') && <img src={preview} alt="Signal upload preview" />}
        {preview && file?.type.startsWith('video/') && <video src={preview} controls playsInline />}
        {preview && file?.type.startsWith('audio/') && <audio src={preview} controls />}
      </div>
      <div className="feed-composer__controls">
        <label><span>TYPE</span><select value={postType} onChange={(event) => setPostType(event.target.value)}>{postTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>TITLE</span><input name="title" placeholder="Optional signal title" /></label>
        <label><span>POSE</span><select name="avatarPose" defaultValue={entity.avatarConfig?.pose || 'Idle'}>{avatarCategories.pose.pose.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>VISIBILITY</span><select name="visibility"><option>Public</option><option>Private Beta</option><option>Draft</option></select></label>
        {postType === 'Link' && <label><span>LINK</span><input name="linkUrl" type="url" placeholder="https://" required /></label>}
        {acceptsMedia && <label className="feed-file-control"><span>MEDIA</span><input type="file" accept={`${postType.toLowerCase()}/*`} onChange={chooseFile} required /></label>}
        <input name="tags" className="feed-tags-input" placeholder="Tags: culture, origin, future" />
        <button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Transmitting...' : 'Transmit Signal'} <ArrowIcon /></button>
      </div>
      <p className="form-status" role="status">{status}</p>
    </form>
  )
}

export function EntityFeed({ entityId = '', showComposer = true }) {
  const [signals, setSignals] = useState(() => getSignals())
  const currentEntity = getCurrentEntity()
  const visibleSignals = useMemo(
    () => entityId ? signals.filter((signal) => signal.entityId === entityId) : signals,
    [entityId, signals],
  )

  useEffect(() => subscribeToNetworkUpdates(() => setSignals(getSignals())), [])

  return (
    <div className="entity-social-feed">
      {showComposer && <EntityComposer onTransmitted={() => setSignals(getSignals())} />}
      <div className="entity-feed__status"><LiveIndicator label="ENTITY-ONLY FEED" /><span>{visibleSignals.length} LOCAL TRANSMISSIONS</span></div>
      {visibleSignals.length ? (
        <div className="entity-feed__stream">
          {visibleSignals.map((signal) => <EntitySignalPost signal={signal} currentEntity={currentEntity} key={signal.id} />)}
        </div>
      ) : (
        <div className="entity-feed__empty"><SignalMark animated /><span>FEED LISTENING</span><h2>No Entity has transmitted here yet.</h2><p>The first Signal will become the beginning of this network history.</p></div>
      )}
    </div>
  )
}

function EntitySignalPost({ signal, currentEntity }) {
  const [commentOpen, setCommentOpen] = useState(false)
  const entities = getEntities()
  const entity = entities.find((item) => item.id === signal.entityId) || {
    name: signal.entityName,
    handle: signal.entityHandle,
    avatarConfig: signal.avatarConfig,
    profileImageRef: signal.profileImageRef,
    profileImageUrl: signal.profileImageUrl,
  }

  function toggleReaction(key) {
    updateSignal(signal.id, { reactions: { ...signal.reactions, [key]: !signal.reactions?.[key] } })
  }

  async function share() {
    const url = `${window.location.origin}/feed#${signal.id}`
    try {
      if (navigator.share) await navigator.share({ title: signal.title, text: signal.text, url })
      else await navigator.clipboard.writeText(url)
    } catch {
      // Closing the native share sheet is not an error state for the feed.
    }
  }

  function comment(event) {
    event.preventDefault()
    if (!currentEntity) return
    const form = new FormData(event.currentTarget)
    addSignalComment(signal.id, {
      entityId: currentEntity.id,
      entityName: currentEntity.name,
      entityHandle: currentEntity.handle,
      avatarConfig: currentEntity.avatarConfig,
      profileImageRef: currentEntity.profileImageRef,
      text: form.get('comment'),
    })
    event.currentTarget.reset()
    setCommentOpen(true)
  }

  return (
    <article className="entity-post" id={signal.id}>
      <header className="entity-post__header">
        <EntityAvatar entity={entity} size="small" pose={signal.avatarPose} />
        <div><h3>{signal.entityName}</h3><p>{signal.entityHandle} / {signal.company || 'Independent Entity'}</p><span>{signal.badge || 'ENTITY SIGNAL'} · SIGNAL SCORE {signal.signalScore || 'LOCAL'}</span></div>
        <time dateTime={signal.createdAt}>{relativeTime(signal.createdAt)}</time>
      </header>
      <div className="entity-post__pose">
        <EntityAvatar entity={entity} size="post" pose={signal.avatarPose} />
        <span>{signal.avatarPose || 'Idle'} pose</span>
      </div>
      <div className="entity-post__content">
        <div><LiveIndicator label={signal.postType || signal.type} /><span>{signal.visibility}</span></div>
        {signal.title && <h2>{signal.title}</h2>}
        <p>{signal.text || signal.caption}</p>
        {signal.linkUrl && <a href={signal.linkUrl} target="_blank" rel="noreferrer">{signal.linkUrl} <ArrowIcon /></a>}
      </div>
      {(signal.mediaId || signal.mediaUrls?.length || signal.media_urls?.length) && <LocalSignalMedia signal={signal} />}
      <div className="entity-post__actions">
        <button className={signal.reactions?.amplified ? 'is-active' : ''} type="button" onClick={() => toggleReaction('amplified')}>Amplify</button>
        <button className={signal.reactions?.remixed ? 'is-active' : ''} type="button" onClick={() => toggleReaction('remixed')}>Remix</button>
        <button className={signal.reactions?.saved ? 'is-active' : ''} type="button" onClick={() => toggleReaction('saved')}>Save</button>
        <button type="button" onClick={() => setCommentOpen((value) => !value)}>Comment {signal.comments?.length ? `(${signal.comments.length})` : ''}</button>
        <button type="button" onClick={share}>Share</button>
      </div>
      {(commentOpen || signal.comments?.length > 0) && (
        <div className="entity-post__comments">
          {signal.comments?.map((item) => {
            const commentEntity = entities.find((entityItem) => entityItem.id === item.entityId) || item
            return <div className="entity-comment" key={item.id}><EntityAvatar entity={commentEntity} size="small" /><p><b>{item.entityName}</b>{item.text}</p></div>
          })}
          {currentEntity
            ? <form onSubmit={comment}><EntityAvatar entity={currentEntity} size="small" /><input name="comment" required placeholder={`Comment as ${currentEntity.name}`} /><button type="submit">Transmit</button></form>
            : <p className="entity-comment-note">Create an Entity to join this transmission.</p>}
        </div>
      )}
    </article>
  )
}
