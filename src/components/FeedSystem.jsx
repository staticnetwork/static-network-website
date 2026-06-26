import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addCreatorSignalPoints,
  addSocialNotification,
  getEntities,
  getCreatorProfile,
  getSignals,
  normalizeHandle,
  saveMedia,
  saveCreatorProfile,
  saveSignal,
  subscribeToNetworkUpdates,
  updateSignal,
} from '../lib/staticStore'
import { StoredMedia } from './AvatarSystem'
import { LocalSignalMedia } from './EntitySystem'
import { RadioPlayer } from './NetworkDemos'
import { Link } from './Router'
import { ArrowIcon, LiveIndicator, SignalMark, StaticBrandMark } from './UI'
import { useAuth } from '../context/AuthContext'
import { officialFounderPosts, officialFounderProfile, previewSocialSignals, socialBotCreators } from '../data/socialBots'
import { signalBarLabel, signalBarsForScore, unlockedSignalMilestones } from '../data/signalMilestones'
import { useBackendCapability } from '../lib/backendReadiness'
import { getForYouReason, rankForYouSignals, recordFeedEngagement, recordFeedImpression } from '../lib/launchSystems'
import { addSocialComment, assistSocialPost, createRadioTrackShell, recordSocialActivity, reportSocialContent, toggleSignalReaction, uploadSocialMedia } from '../lib/socialActions'

const postTypes = ['Text', 'Image', 'Video', 'Music Video', 'Music', 'Audio', 'Link', 'Live Announcement', 'Asset Drop', 'World Concept']
const MAX_CAROUSEL_MEDIA = 10
const carouselPostTypes = new Set(['Image', 'Video'])
const aiContributionOptions = [
  'AI generated the main asset',
  'AI helped create or edit it',
  'AI wrote, mixed, animated, or designed part of it',
  'Human-made concept, AI-assisted execution',
]

const signalRewards = {
  post: 100,
  comment: 10,
  reaction: 10,
  share: 20,
}

const mediaRules = {
  Image: {
    accept: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.heif'],
    maxBytes: 12 * 1024 * 1024,
  },
  Video: {
    accept: ['video/mp4', 'video/webm', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.mov', '.m4v'],
    maxBytes: 120 * 1024 * 1024,
  },
  Audio: {
    accept: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/flac', 'audio/aiff', 'audio/x-aiff'],
    extensions: ['.mp3', '.wav', '.wave', '.m4a', '.aac', '.ogg', '.flac', '.aiff', '.aif'],
    maxBytes: 40 * 1024 * 1024,
  },
}

mediaRules.Music = mediaRules.Audio
mediaRules['Music Video'] = mediaRules.Video

function signalBoostForType() {
  return signalRewards.post
}

function formatBytes(value) {
  if (value >= 1024 * 1024) return `${Math.round(value / (1024 * 1024))} MB`
  if (value >= 1024) return `${Math.round(value / 1024)} KB`
  return `${value} bytes`
}

function extensionFromName(name = '') {
  const clean = String(name).toLowerCase()
  const index = clean.lastIndexOf('.')
  return index >= 0 ? clean.slice(index) : ''
}

function fileMatchesRule(file, rule) {
  if (!file || !rule) return true
  const mime = String(file.type || '').toLowerCase()
  const extension = extensionFromName(file.name)
  return Boolean(
    (mime && rule.accept.includes(mime))
    || (extension && rule.extensions?.includes(extension))
  )
}

function acceptedFileLabel(rule) {
  const extensions = rule?.extensions || []
  return extensions.length ? extensions.join(', ') : rule?.accept?.join(', ') || 'supported'
}

function revokePreviewUrls(previews = []) {
  previews.forEach((item) => {
    if (item?.url) URL.revokeObjectURL(item.url)
  })
}

function mediaKindForFile(file, fallbackType = '') {
  const mime = String(file?.type || '').toLowerCase()
  const extension = extensionFromName(file?.name)
  if (mime.startsWith('image/') || mediaRules.Image.extensions.includes(extension)) return 'image'
  if (mime.startsWith('video/') || mediaRules.Video.extensions.includes(extension)) return 'video'
  if (mime.startsWith('audio/') || mediaRules.Audio.extensions.includes(extension)) return 'audio'
  return fallbackType.toLowerCase()
}

function isRadioEligiblePostType(type = '') {
  const value = String(type || '').toLowerCase()
  return value.includes('music') || value.includes('audio')
}

function radioMediaModeForPostType(type = '') {
  return String(type || '').toLowerCase().includes('video') ? 'music_video' : 'audio'
}

function genresFromTags(value = '') {
  return String(value || '')
    .split(/[\s,]+/)
    .map((item) => item.replace(/^#/, '').trim())
    .filter(Boolean)
    .slice(0, 8)
}

function relativeTime(value) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function formatSocialCount(value = 0) {
  const number = Number(value || 0)
  if (number >= 1_000_000) return `${Number((number / 1_000_000).toFixed(1))}M`
  if (number >= 1_000) return `${Number((number / 1_000).toFixed(1))}K`
  return String(number)
}

function creatorFallbackFromAuth(profile, user) {
  return {
    id: user?.id || '',
    displayName: profile?.display_name || profile?.displayName || user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
    username: profile?.username || user?.user_metadata?.username || '',
    email: user?.email || '',
    avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || '',
    signal_score: profile?.signal_score,
  }
}

function profileRouteForHandle(handle = '', currentCreator = null) {
  const rawHandle = String(handle || '').trim()
  if (!rawHandle) return '/profile'
  const normalized = normalizeHandle(rawHandle)
  const currentHandles = [currentCreator?.handle, currentCreator?.username]
    .filter(Boolean)
    .map((value) => normalizeHandle(value))
  if (currentHandles.includes(normalized)) return '/profile'
  if (normalized === 'mrstone') return '/profile/mrstone'
  const seededCreator = socialBotCreators.find((creator) => normalizeHandle(creator.handle) === normalized)
  if (seededCreator || normalizeHandle(officialFounderProfile.handle) === normalized) return `/profile/${normalized}`
  return `/search?mention=${encodeURIComponent(normalized)}`
}

function tagRouteForToken(token = '') {
  const tag = String(token).replace(/^#/, '').trim()
  return `/search?tag=${encodeURIComponent(tag)}`
}

function socialTagTokens(tags = '') {
  const seen = new Set()
  return String(tags || '')
    .split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.startsWith('#') ? tag : `#${tag}`)
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 8)
}

function RichSocialText({ text = '' }) {
  const value = String(text || '')
  if (!value) return null
  const parts = value.split(/([#@][a-zA-Z0-9._-]+)/g)
  return parts.map((part, index) => {
    if (!part) return null
    if (part.startsWith('#') && part.length > 1) {
      return <Link className="social-token-link social-token-link--tag" to={tagRouteForToken(part)} key={`${part}-${index}`}>{part}</Link>
    }
    if (part.startsWith('@') && part.length > 1) {
      return <Link className="social-token-link social-token-link--mention" to={profileRouteForHandle(part)} key={`${part}-${index}`}>{part}</Link>
    }
    return <span key={`${part}-${index}`}>{part}</span>
  })
}

export function CreatorAvatar({ creator, size = 'small' }) {
  const image = creator?.avatarUrl || creator?.profileImageUrl || '/assets/brand/static-mark-official-working.png'
  return (
    <span className={`creator-profile-avatar creator-profile-avatar--${size}`} aria-hidden="true">
      {creator?.avatarRef ? <StoredMedia mediaRef={creator.avatarRef} alt="" /> : <img src={image} alt="" />}
    </span>
  )
}

export function SignalStrengthBadge({ score = 0, compact = false }) {
  const bars = signalBarsForScore(score)
  const label = signalBarLabel(score)

  return (
    <span className={`signal-strength-badge ${compact ? 'signal-strength-badge--compact' : ''}`} title={`${label}: ${score || 0}`} aria-label={`${label}: ${score || 0}`}>
      <span className="signal-strength-badge__bars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((bar) => <i className={bar <= bars ? 'is-active' : ''} key={bar} />)}
      </span>
      {!compact && <b>{bars}/5 Signal</b>}
    </span>
  )
}

function FeedInlineSignalBadges({ milestones }) {
  if (!milestones.length) return null
  return (
    <span className="inline-signal-badges inline-signal-badges--feed" aria-label="Unlocked Signal badges">
      {milestones.map((milestone) => (
        <span className={`inline-signal-badge inline-signal-badge--${milestone.tier}`} title={`${milestone.score} ${milestone.label}`} key={milestone.id}>
          <StaticBrandMark className="static-brand-mark" />
          <b>{milestone.score}</b>
        </span>
      ))}
    </span>
  )
}

export function EntityComposer({ onTransmitted }) {
  const { configured, user, profile, session } = useAuth()
  const mediaCapability = useBackendCapability('media')
  const formRef = useRef(null)
  const [creator, setCreator] = useState(() => getCreatorProfile(creatorFallbackFromAuth(profile, user)))
  const [postType, setPostType] = useState('Text')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [busy, setBusy] = useState(false)
  const [assistBusy, setAssistBusy] = useState(false)
  const [assistMeta, setAssistMeta] = useState(null)
  const [status, setStatus] = useState('')
  const [draftText, setDraftText] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('static_sage_signal_draft') || '{}').text || ''
    } catch {
      return ''
    }
  })
  useEffect(() => {
    setCreator((current) => getCreatorProfile({
      ...creatorFallbackFromAuth(profile, user),
      ...current,
    }))
  }, [profile, user])

  useEffect(() => () => revokePreviewUrls(previews), [previews])

  useEffect(() => {
    function loadSageDraft() {
      try {
        const draft = JSON.parse(localStorage.getItem('static_sage_signal_draft') || '{}')
        if (draft.text) setDraftText(draft.text)
      } catch {
        // Ignore malformed local assistant drafts.
      }
    }
    window.addEventListener('static:sage-prefill', loadSageDraft)
    loadSageDraft()
    return () => window.removeEventListener('static:sage-prefill', loadSageDraft)
  }, [])

  function chooseFile(event) {
    const selected = Array.from(event.target.files || [])
    const carouselEnabled = carouselPostTypes.has(postType)
    const nextFiles = carouselEnabled ? selected.slice(0, MAX_CAROUSEL_MEDIA) : selected.slice(0, 1)
    const rule = mediaRules[postType]
    if (selected.length > nextFiles.length) {
      setStatus(`Posts support up to ${MAX_CAROUSEL_MEDIA} images or videos. The first ${MAX_CAROUSEL_MEDIA} files were kept.`)
    }
    for (const next of nextFiles) {
      if (!rule) continue
      const supported = fileMatchesRule(next, rule)
      if (!supported) {
        setFiles([])
        setPreviews([])
        event.currentTarget.value = ''
        setStatus(`${postType} uploads must be ${acceptedFileLabel(rule)} files. ${next.name || 'That file'} was not recognized as a supported ${postType.toLowerCase()} file.`)
        return
      }
      if (next.size > rule.maxBytes) {
        setFiles([])
        setPreviews([])
        event.currentTarget.value = ''
        setStatus(`${postType} uploads must stay under ${formatBytes(rule.maxBytes)} for this launch build.`)
        return
      }
    }
    setFiles(nextFiles)
    setPreviews(nextFiles.map((next) => ({
      url: URL.createObjectURL(next),
      kind: mediaKindForFile(next, postType),
      name: next.name,
    })))
    if (nextFiles.length && selected.length <= nextFiles.length) setStatus('')
  }

  function changePostType(nextType) {
    setPostType(nextType)
    setFiles([])
    setPreviews([])
    setStatus('')
  }

  async function transmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    setBusy(true)
    setStatus('')
    const form = new FormData(formElement)
    try {
      const savedCreator = saveCreatorProfile({
        ...creator,
        displayName: form.get('creatorName'),
        handle: form.get('creatorHandle'),
      })
      setCreator(savedCreator)
      let mediaRecords = []
      if (files.length) {
        mediaRecords = await Promise.all(files.map((item) => saveMedia(item, { ownerEntityId: savedCreator.id, channelId: '', type: postType.toLowerCase() })))
      }
      const reward = signalBoostForType(postType)
      const signal = saveSignal({
        entityId: '',
        channelId: '',
        creatorProfile: true,
        creatorId: savedCreator.id,
        entityName: savedCreator.displayName,
        entityHandle: savedCreator.handle,
        company: 'AI Creator',
        badge: 'AI CREATOR',
        signalScore: savedCreator.signalScore,
        avatarConfig: {},
        profileImageUrl: savedCreator.avatarUrl,
        avatarPose: 'Human Creator',
        postType,
        type: postType,
        title: form.get('title') || `${savedCreator.displayName} post`,
        text: form.get('text'),
        caption: form.get('text'),
        linkUrl: form.get('linkUrl') || '',
        tags: form.get('tags') || '',
        visibility: form.get('visibility'),
        mediaId: mediaRecords[0]?.id || null,
        mediaRefs: mediaRecords.map((item) => item.id),
        mediaUrls: [],
        cloudUploadStatus: files.length && user ? 'uploading' : files.length ? 'local-only' : '',
        cloudMediaPath: '',
        cloudMediaAssetId: '',
        fileName: mediaRecords[0]?.fileName || '',
        fileNames: mediaRecords.map((item) => item.fileName),
        fileType: mediaRecords[0]?.fileType || '',
        fileTypes: mediaRecords.map((item) => item.fileType),
        mediaCount: mediaRecords.length,
        aiAssisted: true,
        aiContribution: form.get('aiContribution'),
        aiTools: form.get('aiTools'),
        aiProcess: form.get('aiProcess'),
        rightsConfirmed: form.get('rightsConfirmed') === 'on',
        signalReward: reward,
      })
      const nextCreator = addCreatorSignalPoints(reward, `Posted ${postType} post`)
      onTransmitted?.(signal)
      const notification = {
        type: 'post',
        title: 'Post published',
        text: `${signal.title || 'Your post'} is live on STATIC Social.`,
        actorName: savedCreator.displayName,
        actorHandle: savedCreator.handle,
        actorAvatarUrl: savedCreator.avatarUrl,
        signalDelta: reward,
        route: `/feed#${signal.id}`,
      }
      addSocialNotification(notification)
      await recordSocialActivity(user, {
        points: reward,
        reason: `Posted ${postType} post`,
        eventType: 'post',
        targetId: signal.id,
        targetType: 'signal',
        route: `/feed#${signal.id}`,
        data: { localId: signal.id, postType, title: signal.title },
        notification,
      }).catch(() => null)
      setCreator(nextCreator || savedCreator)
      formElement.reset()
      setFiles([])
      setPreviews([])
      setPostType('Text')
      setDraftText('')
      localStorage.removeItem('static_sage_signal_draft')
      setStatus(`Post published. +${signal.signalReward} Signal.${files.length && user ? ' Uploading media to cloud...' : ''}`)
      setBusy(false)
      if (files.length && user) {
        try {
          const cloudMediaItems = await Promise.all(files.map((item) => uploadSocialMedia(user, {
            bucket: 'media',
            entityId: '',
            channelId: '',
            file: item,
            metadata: {
              type: postType.toLowerCase(),
              source: 'ai-social-composer',
              creatorProfileId: savedCreator.id,
            },
          })))
          const uploaded = cloudMediaItems.filter(Boolean)
          const mediaUrls = uploaded.map((item) => item.publicUrl).filter(Boolean)
          updateSignal(signal.id, {
            mediaUrls,
            cloudUploadStatus: mediaUrls.length ? 'uploaded' : 'local-only',
            cloudMediaPath: uploaded[0]?.path || '',
            cloudMediaAssetId: uploaded[0]?.asset?.id || '',
            cloudMediaPaths: uploaded.map((item) => item.path).filter(Boolean),
            cloudMediaAssetIds: uploaded.map((item) => item.asset?.id).filter(Boolean),
            mediaDerivativeJobs: uploaded.flatMap((item) => item.derivativeJobs || []),
            mediaDerivativeStatus: uploaded.some((item) => item.derivativeJobs?.length) ? 'queued' : '',
            mediaDerivativeError: uploaded.find((item) => item.derivativeError)?.derivativeError || '',
          })
          let radioTrackIds = []
          let radioTrackError = ''
          if (isRadioEligiblePostType(postType) && uploaded.length) {
            const mediaMode = radioMediaModeForPostType(postType)
            const submitted = await Promise.allSettled(uploaded.map((item, index) => createRadioTrackShell(user, {
              title: signal.title || mediaRecords[index]?.fileName || `${savedCreator.displayName} upload`,
              artist: savedCreator.displayName,
              sourceType: 'creator_upload',
              audioUrl: item.publicUrl,
              mediaAssetId: item.asset?.id || '',
              genres: genresFromTags(signal.tags),
              rightsStatus: 'needs_review',
              visibility: 'private',
              data: {
                mediaMode,
                signalId: signal.id,
                signalTitle: signal.title,
                creatorProfileId: savedCreator.id,
                postType,
                publicUrl: item.publicUrl,
              },
            }, {
              ownsMaster: true,
              ownsPublishing: true,
              containsThirdPartySamples: false,
              commercialUseConfirmed: true,
              aiGenerated: true,
              declaration: 'Submitted from STATIC Social as AI-made or AI-assisted creator media.',
              status: 'pending_review',
            })))
            radioTrackIds = submitted.filter((item) => item.status === 'fulfilled' && item.value?.id).map((item) => item.value.id)
            radioTrackError = submitted.find((item) => item.status === 'rejected')?.reason?.message || ''
            if (radioTrackIds.length || radioTrackError) {
              updateSignal(signal.id, {
                radioSubmittedAt: radioTrackIds.length ? new Date().toISOString() : '',
                radioTrackIds,
                radioMediaMode: mediaMode,
                radioTrackStatus: radioTrackIds.length ? 'submitted_for_review' : 'local_player_only',
                radioTrackError,
              })
            }
          }
          const metadataError = uploaded.find((item) => item.metadataError)?.metadataError
          const derivativeError = uploaded.find((item) => item.derivativeError)?.derivativeError
          const radioCopy = isRadioEligiblePostType(postType)
            ? radioTrackIds.length
              ? ' Added to the STATIC media player queue and submitted to the radio library.'
              : radioTrackError
                ? ' Added to the local player queue; cloud radio review needs a schema check.'
                : ' Added to the STATIC media player queue.'
            : ''
          setStatus(metadataError
            ? `Post published. +${signal.signalReward} Signal. Media uploaded, but metadata needs migration: ${metadataError}`
            : derivativeError
              ? `Post published. +${signal.signalReward} Signal. Media uploaded. Processing queue needs migration: ${derivativeError}${radioCopy}`
              : `Post published. +${signal.signalReward} Signal. Media uploaded and queued for processing.${radioCopy}`)
        } catch (uploadError) {
          updateSignal(signal.id, { cloudUploadStatus: 'failed', cloudUploadError: uploadError.message || 'Cloud media upload failed.' })
          setStatus(`Post published locally. +${signal.signalReward} Signal. Cloud media upload needs retry.`)
        }
      }
    } catch (error) {
      setStatus(error.message || 'The post could not be stored on this device.')
    } finally {
      setBusy(false)
    }
  }

  async function improveWithAi() {
    const form = formRef.current
    if (!form) return
    setAssistBusy(true)
    setStatus('')
    try {
      const data = await assistSocialPost(session, {
        postType,
        title: form.elements.title?.value || '',
        text: draftText,
        tags: form.elements.tags?.value || '',
        aiTools: form.elements.aiTools?.value || '',
        aiProcess: form.elements.aiProcess?.value || '',
      })
      const result = data.result || {}
      if (result.caption) setDraftText(result.caption)
      if (result.title && form.elements.title && !form.elements.title.value) form.elements.title.value = result.title
      if (result.tags?.length && form.elements.tags) form.elements.tags.value = result.tags.map((tag) => tag.startsWith('#') ? tag : `#${tag}`).join(' ')
      if (result.aiDisclosure && form.elements.aiProcess && !form.elements.aiProcess.value) form.elements.aiProcess.value = result.aiDisclosure
      setAssistMeta({ used: data.used, limit: data.limit, resetAt: data.resetAt, category: result.category, eligible: result.signalEligible })
      setStatus(`AI assist applied. ${data.used}/${data.limit} free weekly assists used${result.signalEligible === false ? '. This draft still needs clearer AI-made or AI-assisted proof.' : '.'}`)
    } catch (error) {
      setStatus(error.detail?.upgrade || error.message || 'AI assistant is unavailable.')
    } finally {
      setAssistBusy(false)
    }
  }

  const acceptsMedia = ['Image', 'Video', 'Music Video', 'Music', 'Audio'].includes(postType)
  const carouselEnabled = carouselPostTypes.has(postType)
  const activeMediaRule = mediaRules[postType]
  const mediaLimit = carouselEnabled ? MAX_CAROUSEL_MEDIA : 1
  const mediaReadinessLabel = mediaCapability.loading
    ? 'Checking media storage...'
    : mediaCapability.validated
      ? 'Public media bridge ready'
      : configured
        ? 'Cloud account ready; public media bridge pending'
        : 'Local preview only'

  if (!user) {
    return (
      <section className="feed-composer feed-composer--social feed-composer--locked" id="create-post" aria-label="Create a STATIC Social post">
        <div className="feed-composer__identity">
          <CreatorAvatar creator={{ displayName: 'STATIC Social', avatarUrl: '/assets/brand/static-mark-official-working.png' }} size="post" />
          <div>
            <h2>Post on STATIC Social</h2>
            <p>Log in or create an account to share AI-made work.</p>
          </div>
        </div>
        <div className="feed-composer__locked-actions">
          <Link className="button button--primary" to="/login">Log In <ArrowIcon /></Link>
          <Link className="button button--glass" to="/signup">Create Account</Link>
        </div>
      </section>
    )
  }

  return (
    <form className="feed-composer feed-composer--social" id="create-post" onSubmit={transmit} ref={formRef}>
      <input name="creatorName" type="hidden" value={creator.displayName} readOnly />
      <input name="creatorHandle" type="hidden" value={creator.handle.replace('@', '')} readOnly />
      <input name="visibility" type="hidden" value="Public" readOnly />
      <input name="aiContribution" type="hidden" value={aiContributionOptions[1]} readOnly />
      <div className="feed-composer__identity">
        <CreatorAvatar creator={creator} size="post" />
        <div><h2>{creator.displayName}</h2><p>{creator.handle}</p></div>
      </div>
      <div className="feed-composer__prompt">
        <textarea name="text" rows="3" required value={draftText} onChange={(event) => setDraftText(event.target.value)} placeholder="Share AI-made or AI-assisted work..." />
        {previews.length > 0 && (
          <div className={`feed-media-preview-grid ${previews.length === 1 ? 'feed-media-preview-grid--single' : ''}`} aria-label={`${previews.length} selected media item${previews.length === 1 ? '' : 's'}`}>
            {previews.map((item, index) => (
              <figure className="feed-media-preview" key={item.url}>
                {item.kind === 'image' && <img src={item.url} alt={`Post upload preview ${index + 1}`} />}
                {item.kind === 'video' && <video src={item.url} controls playsInline />}
                {item.kind === 'audio' && <audio src={item.url} controls />}
                <figcaption>{index + 1}/{previews.length}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
      <div className="feed-composer__controls">
        <label><span>Type</span><select value={postType} onChange={(event) => changePostType(event.target.value)}>{postTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Title</span><input name="title" placeholder="Optional" /></label>
        {postType === 'Link' && <label><span>LINK</span><input name="linkUrl" type="url" placeholder="https://" required /></label>}
        {acceptsMedia && <label className="feed-file-control"><span>{carouselEnabled ? `Media (up to ${mediaLimit})` : 'Media'}</span><input type="file" accept={[...(activeMediaRule?.accept || []), ...(activeMediaRule?.extensions || [])].join(',') || `${postType.toLowerCase()}/*`} onChange={chooseFile} required multiple={carouselEnabled} /></label>}
        {acceptsMedia && (
          <div className={`feed-media-readiness ${mediaCapability.validated ? 'is-ready' : ''}`}>
            <span>{configured ? 'Cloud upload' : 'Upload preview'}</span>
            <small>{mediaReadinessLabel}</small>
          </div>
        )}
        <label><span>AI tool</span><input name="aiTools" required placeholder="ChatGPT, Runway, Suno..." /></label>
        <label className="feed-composer__wide"><span>Process</span><input name="aiProcess" placeholder="Prompt, edit, remix, animate..." /></label>
        <input name="tags" className="feed-tags-input" placeholder="#tags" />
        <label className="feed-composer__check"><input name="rightsConfirmed" type="checkbox" required /><span>AI-made or AI-assisted</span></label>
        <button className="button button--glass feed-ai-assist-button" type="button" onClick={improveWithAi} disabled={assistBusy || busy}>
          {assistBusy ? 'Assisting...' : 'AI Assist'}
        </button>
        <button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Posting...' : 'Post'} <ArrowIcon /></button>
      </div>
      {assistMeta && (
        <div className="feed-ai-assist-status" aria-label="AI assist usage">
          <span>Google AI</span>
          <b>{assistMeta.used}/{assistMeta.limit} weekly assists</b>
          <small>{assistMeta.category || 'Post'} helper active</small>
        </div>
      )}
      <p className="form-status" role="status">{status}</p>
    </form>
  )
}

export function EntityFeed({ entityId = '', showComposer = true }) {
  const [signals, setSignals] = useState(() => getSignals())
  const { user, profile } = useAuth()
  const currentCreator = getCreatorProfile(creatorFallbackFromAuth(profile, user))
  const visibleSignals = useMemo(
    () => entityId ? signals.filter((signal) => signal.entityId === entityId) : signals,
    [entityId, signals],
  )
  const networkSignals = useMemo(
    () => entityId ? visibleSignals : rankForYouSignals([...officialFounderPosts, ...visibleSignals, ...previewSocialSignals]),
    [entityId, visibleSignals],
  )

  useEffect(() => subscribeToNetworkUpdates(() => setSignals(getSignals())), [])

  useEffect(() => {
    if (!window.location.hash) return undefined
    const timer = window.setTimeout(() => {
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [networkSignals.length])

  return (
    <div className="entity-social-feed">
      {!entityId && <SocialStoryRail />}
      {!entityId && !user && <SignedOutComposerTeaser />}
      {!entityId && <FeedInlineRadioCard />}
      {showComposer && <EntityComposer onTransmitted={() => setSignals(getSignals())} />}
      {networkSignals.length ? (
        <div className="entity-feed__stream">
          {networkSignals.map((signal) => <EntitySignalPost signal={signal} currentCreator={currentCreator} key={signal.id} />)}
        </div>
      ) : (
        <div className="entity-feed__empty"><SignalMark animated /><span>FEED LISTENING</span><h2>No AI work has been posted here yet.</h2><p>The first post starts building Signal.</p></div>
      )}
    </div>
  )
}

function useMobileViewport(maxWidth = 760) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches
      : false
  ))

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const query = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const update = () => setMatches(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [maxWidth])

  return matches
}

function FeedInlineRadioCard() {
  const showMobileRadio = useMobileViewport()
  if (!showMobileRadio) return null

  return (
    <section className="feed-radio-card" aria-label="STATIC Radio">
      <div className="feed-radio-card__backdrop" aria-hidden="true" />
      <div className="feed-radio-card__header">
        <LiveIndicator label="STATIC RADIO" />
        <div>
          <span>Creator station</span>
          <h2>Music and music videos from inside the network.</h2>
          <p>Approved creator uploads move into the station rotation.</p>
        </div>
      </div>
      <RadioPlayer mini />
    </section>
  )
}

function SignedOutComposerTeaser() {
  return (
    <section className="feed-join-card" id="create-post" aria-label="Join STATIC Social to post">
      <div className="feed-join-card__avatars" aria-hidden="true">
        {socialBotCreators.slice(0, 5).map((creator) => <CreatorAvatar creator={creator} size="small" key={creator.id} />)}
      </div>
      <div>
        <span>Start building Signal</span>
        <h2>Post AI-made work. Earn Signal. Get discovered.</h2>
        <p>Browse freely. Create a profile when you are ready to post images, videos, audio, music, links, drops, and AI-assisted work.</p>
      </div>
      <div className="feed-join-card__actions">
        <Link to="/signup">Create profile <ArrowIcon /></Link>
        <Link to="/login">Log in</Link>
      </div>
      <div className="feed-join-card__rules">
        <b>+100 Post</b>
        <b>+100 Follow</b>
        <b>+10 Comment</b>
        <b>+20 Share</b>
      </div>
    </section>
  )
}

function SocialStoryRail() {
  return (
    <section className="social-story-rail" aria-label="Creator stories">
      {socialBotCreators.slice(0, 14).map((creator) => (
        <Link to={`/profile/${normalizeHandle(creator.handle)}`} key={creator.id}>
          <CreatorAvatar creator={creator} size="small" />
          <b>{creator.displayName.split(' ')[0]}</b>
        </Link>
      ))}
    </section>
  )
}

function EntitySignalPost({ signal, currentCreator }) {
  const { user } = useAuth()
  const [previewReactions, setPreviewReactions] = useState(() => signal.reactions || {})
  const [previewComments, setPreviewComments] = useState(() => signal.comments || [])
  const [previewShares, setPreviewShares] = useState(() => signal.previewShareCount || 0)
  const [commentOpen, setCommentOpen] = useState(false)
  const [actionStatus, setActionStatus] = useState('')
  const entities = getEntities()
  const entity = entities.find((item) => item.id === signal.entityId) || {
    displayName: signal.entityName,
    handle: signal.entityHandle,
    profileImageUrl: signal.profileImageUrl,
  }
  const reactions = signal.preview ? previewReactions : (signal.reactions || {})
  const comments = signal.preview ? previewComments : (signal.comments || [])

  useEffect(() => {
    recordFeedImpression(signal)
    const startedAt = Date.now()
    return () => {
      recordFeedEngagement(signal, 'dwell', { seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) })
    }
  }, [signal])

  function requireAccount(action) {
    if (user) return false
    setActionStatus(`${action} requires a STATIC account. You can still browse the feed.`)
    return true
  }

  function notifyActivity(type, title, text, signalDelta = 0) {
    const notification = {
      type,
      title,
      text,
      actorName: creatorName,
      actorHandle: creatorHandle,
      actorAvatarUrl: signal.profileImageUrl || entity.profileImageUrl || '',
      signalDelta,
      route: `/feed#${signal.id}`,
    }
    addSocialNotification(notification)
    recordSocialActivity(user, {
      points: signalDelta,
      reason: title,
      eventType: type,
      targetId: signal.cloudId || signal.id,
      targetType: 'signal',
      route: `/feed#${signal.id}`,
      data: { localId: signal.id, signalTitle: signal.title },
      notification,
    }).catch(() => null)
  }

  async function toggleReaction(key) {
    if (requireAccount(key === 'saved' ? 'Saving posts' : 'Liking posts')) return
    const shouldReward = !reactions?.[key]
    if (signal.preview) {
      setPreviewReactions((current) => ({ ...current, [key]: !current[key] }))
      if (shouldReward) {
        recordFeedEngagement(signal, key === 'saved' ? 'save' : 'like')
        addCreatorSignalPoints(signalRewards.reaction, `Reacted to a preview post: ${key}`)
        notifyActivity(key === 'saved' ? 'save' : 'like', key === 'saved' ? 'Post saved' : 'Post liked', `${key === 'saved' ? 'Saved' : 'Liked'} ${creatorName}'s post.`, signalRewards.reaction)
      }
      if (key === 'saved') setActionStatus(shouldReward ? 'Saved to your STATIC folder.' : 'Removed from your STATIC folder.')
      return
    }
    try {
      await toggleSignalReaction(user, signal, key)
      if (shouldReward) {
        recordFeedEngagement(signal, key === 'saved' ? 'save' : 'like')
        addCreatorSignalPoints(signalRewards.reaction, `Reacted to a post: ${key}`)
        notifyActivity(key === 'saved' ? 'save' : 'like', key === 'saved' ? 'Post saved' : 'Post liked', `${key === 'saved' ? 'Saved' : 'Liked'} ${creatorName}'s post.`, signalRewards.reaction)
      }
      if (key === 'saved') setActionStatus(shouldReward ? 'Saved to your STATIC folder.' : 'Removed from your STATIC folder.')
    } catch {
      // The local reaction is already saved by the social bridge. Cloud retry
      // happens through the account sync loop.
    }
  }

  async function share() {
    if (requireAccount('Sharing posts')) return
    const url = `${window.location.origin}/feed#${signal.id}`
    let shareHandled = false
    let shareStatus = 'Share link ready.'
    try {
      if (navigator.share) {
        await navigator.share({ title: signal.title, text: signal.text, url })
        shareHandled = true
      }
    } catch {
      // Fall back to a visible/clipboard link when the native share sheet is
      // unavailable, dismissed, or blocked by the browser.
    }
    if (!shareHandled) {
      try {
        await navigator.clipboard?.writeText(url)
        shareHandled = true
      } catch {
        shareStatus = `Share link: ${url}`
        shareHandled = true
      }
    }
    if (shareHandled) {
      recordFeedEngagement(signal, 'share')
      addCreatorSignalPoints(signalRewards.share, 'Shared a post')
      notifyActivity('share', 'Post shared', `Shared ${creatorName}'s post.`, signalRewards.share)
      if (signal.preview) setPreviewShares((current) => current + 1)
      setActionStatus(shareStatus)
    }
  }

  async function comment(event) {
    event.preventDefault()
    if (requireAccount('Commenting')) return
    const form = new FormData(event.currentTarget)
    if (signal.preview) {
      setPreviewComments((current) => [
        ...current,
        {
          id: `preview-user-comment-${Date.now()}`,
          entityId: currentCreator.id,
          entityName: currentCreator.displayName,
          entityHandle: currentCreator.handle,
          text: form.get('comment'),
          createdAt: new Date().toISOString(),
        },
      ])
      recordFeedEngagement(signal, 'comment')
      addCreatorSignalPoints(signalRewards.comment, 'Commented on a preview post')
      notifyActivity('comment', 'Comment posted', `Commented on ${creatorName}'s post.`, signalRewards.comment)
      event.currentTarget.reset()
      setCommentOpen(true)
      return
    }
    try {
      await addSocialComment(user, signal, {
        entityId: currentCreator.id,
        entityName: currentCreator.displayName,
        entityHandle: currentCreator.handle,
        avatarConfig: {},
        profileImageUrl: currentCreator.avatarUrl,
        text: form.get('comment'),
      })
      recordFeedEngagement(signal, 'comment')
      addCreatorSignalPoints(signalRewards.comment, 'Commented on a post')
      notifyActivity('comment', 'Comment posted', `Commented on ${creatorName}'s post.`, signalRewards.comment)
    } catch {
      // Local comment is saved first. Cloud sync can retry after migration or sign-in.
    }
    event.currentTarget.reset()
    setCommentOpen(true)
  }

  async function reportPost() {
    if (requireAccount('Reporting posts')) return
    try {
      await reportSocialContent(user, {
        ...signal,
        targetType: 'signal',
        route: `/feed#${signal.id}`,
      }, {
        reason: 'User report',
        detail: `Reported from STATIC Social feed: ${signal.title || signal.text || signal.id}`,
      })
      recordFeedEngagement(signal, 'report')
      const notification = {
        type: 'moderation',
        title: 'Report submitted',
        text: 'Thanks. This post was sent to moderation review.',
        route: '/notifications',
      }
      addSocialNotification(notification)
      await recordSocialActivity(user, { notification }).catch(() => null)
      setActionStatus('Report submitted for review.')
    } catch (error) {
      setActionStatus(error.message || 'Report could not be submitted.')
    }
  }

  function toggleCommentComposer() {
    if (requireAccount('Commenting')) return
    setCommentOpen((value) => !value)
  }

  const postType = signal.postType || signal.type || 'Post'
  const postTypeSlug = String(postType).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'post'
	  const creatorName = signal.entityName || entity.displayName || 'STATIC Creator'
	  const creatorHandle = signal.entityHandle || entity.handle || '@static'
  const creatorRoute = profileRouteForHandle(creatorHandle, currentCreator)
  const company = signal.company || 'AI Creator'
  const captionText = signal.text || signal.caption || ''
  const tagTokens = socialTagTokens(signal.tags)
  const previewAddedComments = signal.preview ? Math.max(0, comments.length - (signal.comments?.length || 0)) : 0
  const milestoneBadges = unlockedSignalMilestones(signal.signalScore)
  const commentsCount = signal.preview ? (signal.previewCommentCount || 0) + previewAddedComments : comments.length
  const reactionCount = signal.preview ? (signal.previewReactionCount || 0) + Object.values(reactions || {}).filter(Boolean).length : Object.values(reactions || {}).filter(Boolean).length
  const shareCount = signal.preview ? previewShares : 0
  const signalReward = signal.signalReward || signalBoostForType(postType)
  const hasMedia = Boolean(signal.mediaId || signal.mediaRefs?.length || signal.mediaUrls?.length || signal.media_urls?.length)
  const visibleComments = commentOpen ? comments : comments.slice(0, 2)
  const hiddenCommentCount = Math.max(0, comments.length - visibleComments.length)
  const proofLine = [signal.aiTools, signal.aiProcess].filter(Boolean).join(' / ') || 'AI workflow declared'

  return (
    <article className={`entity-post entity-post--${postTypeSlug} ${hasMedia ? 'entity-post--with-media' : ''} ${signal.preview ? 'entity-post--preview' : ''}`} id={signal.id}>
      <header className="entity-post__header">
        <Link className="entity-post__profile-link" to={creatorRoute} aria-label={`View ${creatorName}'s profile`}>
          <CreatorAvatar creator={entity} size="small" />
        </Link>
        <div className="entity-post__creator">
          <span>{signal.badge || 'AI CREATOR'} / SIGNAL {signal.signalScore || 'LOCAL'}</span>
          <div className="entity-post__name-row">
            <h3><Link className="entity-post__identity-link" to={creatorRoute}>{creatorName}</Link></h3>
            <SignalStrengthBadge score={signal.signalScore} compact />
            <FeedInlineSignalBadges milestones={milestoneBadges} />
          </div>
          <p><Link className="entity-post__identity-link entity-post__handle-link" to={creatorRoute}>{creatorHandle}</Link><em>{company}</em></p>
        </div>
	        <div className="entity-post__header-actions">
	          <time dateTime={signal.createdAt}>{relativeTime(signal.createdAt)}</time>
	          <Link to={creatorRoute}>Profile</Link>
            <button className="entity-post__more" type="button" onClick={reportPost} aria-label="Report post">•••</button>
	        </div>
	      </header>
      <div className="entity-post__content">
        <div className="entity-post__meta">
          <LiveIndicator label={postType} />
          <span>{signal.visibility || 'Public'}</span>
          <span className="entity-post__recommendation">{getForYouReason(signal)}</span>
          <span>{commentsCount} comments</span>
          <span>{reactionCount} reactions</span>
        </div>
	        {hasMedia && <LocalSignalMedia signal={signal} />}
          {signal.cloudUploadStatus && signal.cloudUploadStatus !== 'uploaded' && (
            <small className={`entity-post__upload-state is-${signal.cloudUploadStatus}`}>
              {signal.cloudUploadStatus === 'uploading' ? 'Media syncing to cloud...' : signal.cloudUploadStatus === 'failed' ? 'Media saved locally. Cloud sync needs retry.' : 'Media saved locally.'}
            </small>
          )}
          {signal.mediaDerivativeStatus === 'queued' && !signal.mediaDerivativeError && (
            <small className="entity-post__upload-state is-processing">Media optimized for the STATIC player.</small>
          )}
          {signal.mediaDerivativeError && (
            <small className="entity-post__upload-state is-local-only">Media live. Player optimization will retry.</small>
          )}
	        {signal.title && <h2>{signal.title}</h2>}
	        <p><RichSocialText text={captionText} /></p>
	        {tagTokens.length > 0 && (
	          <div className="entity-post__tags" aria-label="Post hashtags">
	            {tagTokens.map((tag) => <Link to={tagRouteForToken(tag)} key={tag}>{tag}</Link>)}
	          </div>
	        )}
	        {signal.linkUrl && <a href={signal.linkUrl} target="_blank" rel="noreferrer">{signal.linkUrl} <ArrowIcon /></a>}
	      </div>
      <div className="entity-post__metrics">
        <span><b>{formatSocialCount(reactionCount)}</b> likes</span>
        <span><b>{formatSocialCount(commentsCount)}</b> comments</span>
        {signal.preview && <span><b>{formatSocialCount(shareCount)}</b> shares</span>}
        {!signal.preview && <span><b>+{signalReward}</b> Signal</span>}
      </div>
      <div className="entity-post__ai-proof">
        <span>{signal.aiContribution || 'AI-assisted'}</span>
        <p>{proofLine}</p>
      </div>
      <div className="entity-post__actions">
        <button className={reactions?.amplified ? 'is-active' : ''} type="button" onClick={() => toggleReaction('amplified')}><span>Like</span></button>
        <button type="button" onClick={toggleCommentComposer}><span>Comment</span></button>
        <button type="button" onClick={share}><span>Share</span></button>
        <button className={reactions?.saved ? 'is-active' : ''} type="button" onClick={() => toggleReaction('saved')}><span>{reactions?.saved ? 'Saved' : 'Save'}</span></button>
      </div>
      {actionStatus && (
        <div className="entity-post__action-status" role="status">
          <span>{actionStatus}</span>
          {!user && <Link to="/login">Log in</Link>}
        </div>
      )}
      {(commentOpen || comments.length > 0) && (
	        <div className="entity-post__comments">
	          {visibleComments.map((item) => {
	            const commentCreator = entities.find((entityItem) => entityItem.id === item.entityId) || item
            const commentName = item.entityName || commentCreator.displayName || 'STATIC Creator'
            const commentRoute = profileRouteForHandle(item.entityHandle || commentCreator.handle || commentName, currentCreator)
	            return (
              <div className="entity-comment" key={item.id}>
                <Link className="entity-comment__profile-link" to={commentRoute} aria-label={`View ${commentName}'s profile`}>
                  <CreatorAvatar creator={commentCreator} size="small" />
                </Link>
                <p><Link className="entity-comment__author" to={commentRoute}>{commentName}</Link><RichSocialText text={item.text} /></p>
              </div>
            )
	          })}
          {hiddenCommentCount > 0 && <button className="entity-post__view-comments" type="button" onClick={() => setCommentOpen(true)}>View all {formatSocialCount(comments.length)} comments</button>}
          {user && <form onSubmit={comment}><CreatorAvatar creator={currentCreator} size="small" /><input name="comment" required placeholder={`Comment as ${currentCreator.displayName}`} /><button type="submit">Post</button></form>}
        </div>
      )}
    </article>
  )
}
