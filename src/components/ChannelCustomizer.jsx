import { useEffect, useState } from 'react'
import {
  getChannelForEntity,
  saveChannel,
  saveEntity,
  saveMedia,
} from '../lib/staticStore'
import { EntityAvatar, StoredMedia } from './AvatarSystem'
import { ArrowIcon, LiveIndicator, SignalMark } from './UI'

const themes = ['Broadcast', 'Luxury', 'Street', 'Cinematic', 'Sci-Fi', 'Music', 'Gaming', 'Corporate Empire']
const layouts = ['Media Grid', 'Editorial', 'Live First', 'World Showcase', 'Release Timeline']
const modules = ['Signals', 'Videos', 'Live', 'Drops', 'Worlds', 'About']

export function ChannelCustomizer({ entity, onSave }) {
  const existingChannel = getChannelForEntity(entity.id)
  const [channel, setChannel] = useState(existingChannel)
  const [draft, setDraft] = useState(() => ({
    displayName: existingChannel?.displayName || existingChannel?.name || entity.channelName || entity.name,
    tagline: existingChannel?.tagline || entity.channelTagline || '',
    bannerHeadline: existingChannel?.theme?.bannerHeadline || entity.channelTagline || '',
    themeStyle: existingChannel?.theme?.style || 'Broadcast',
    accentColor: existingChannel?.theme?.accentColor || '#78e8ff',
    layoutStyle: existingChannel?.theme?.layoutStyle || 'Media Grid',
    featuredModule: existingChannel?.theme?.featuredModule || 'Signals',
    bio: entity.bio || '',
    company: entity.companyBrand || entity.company || '',
    title: entity.titlePosition || entity.title || '',
    fanbase: entity.fanbaseName || entity.fanbase || '',
    links: Array.isArray(entity.links) ? entity.links.join('\n') : '',
  }))
  const [profileFile, setProfileFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => () => {
    if (profilePreview) URL.revokeObjectURL(profilePreview)
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
  }, [bannerPreview, profilePreview])

  function update(event) {
    const { name, value } = event.target
    setDraft((current) => ({ ...current, [name]: value }))
  }

  function chooseProfile(event) {
    const file = event.target.files?.[0] || null
    if (profilePreview) URL.revokeObjectURL(profilePreview)
    setProfileFile(file)
    setProfilePreview(file ? URL.createObjectURL(file) : '')
  }

  function chooseBanner(event) {
    const file = event.target.files?.[0] || null
    if (bannerPreview) URL.revokeObjectURL(bannerPreview)
    setBannerFile(file)
    setBannerPreview(file ? URL.createObjectURL(file) : '')
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setStatus('')
    try {
      const profileMedia = profileFile
        ? await saveMedia(profileFile, { ownerEntityId: entity.id, channelId: channel?.id, type: 'avatar' })
        : null
      const bannerMedia = bannerFile
        ? await saveMedia(bannerFile, { ownerEntityId: entity.id, channelId: channel?.id, type: 'banner' })
        : null
      const theme = {
        style: draft.themeStyle,
        accentColor: draft.accentColor,
        layoutStyle: draft.layoutStyle,
        featuredModule: draft.featuredModule,
        bannerHeadline: draft.bannerHeadline,
      }
      const updatedEntity = saveEntity({
        ...entity,
        bio: draft.bio,
        company: draft.company,
        companyBrand: draft.company,
        title: draft.title,
        titlePosition: draft.title,
        fanbase: draft.fanbase,
        fanbaseName: draft.fanbase,
        links: draft.links.split('\n').map((item) => item.trim()).filter(Boolean),
        channelName: draft.displayName,
        channelTagline: draft.tagline,
        profileImageRef: profileMedia?.id || entity.profileImageRef || '',
        channelBannerRef: bannerMedia?.id || entity.channelBannerRef || '',
        channelBannerType: bannerMedia?.fileType || entity.channelBannerType || '',
        channelTheme: theme,
      })
      const updatedChannel = saveChannel({
        ...channel,
        displayName: draft.displayName,
        name: draft.displayName,
        tagline: draft.tagline,
        company: draft.company,
        profileImageRef: profileMedia?.id || channel?.profileImageRef || entity.profileImageRef || '',
        bannerRef: bannerMedia?.id || channel?.bannerRef || entity.channelBannerRef || '',
        bannerType: bannerMedia?.fileType || channel?.bannerType || entity.channelBannerType || '',
        theme,
      })
      setChannel(updatedChannel)
      setStatus('Channel identity saved.')
      onSave?.(updatedEntity)
    } catch (error) {
      setStatus(error.message || 'The Channel customization could not be stored.')
    } finally {
      setBusy(false)
    }
  }

  function useGeneratedAvatar() {
    const updatedEntity = saveEntity({ ...entity, profileImageRef: '' })
    const updatedChannel = saveChannel({ ...channel, profileImageRef: '' })
    setChannel(updatedChannel)
    setProfileFile(null)
    if (profilePreview) URL.revokeObjectURL(profilePreview)
    setProfilePreview('')
    setStatus('Generated avatar is now the profile identity.')
    onSave?.(updatedEntity)
  }

  const previewEntity = {
    ...entity,
    name: draft.displayName,
    bio: draft.bio,
    company: draft.company,
    title: draft.title,
    profileImageRef: profilePreview ? '' : entity.profileImageRef,
  }

  return (
    <form className="channel-customizer" onSubmit={save} style={{ '--channel-accent': draft.accentColor }}>
      <section className={`channel-customizer__preview theme--${draft.themeStyle.toLowerCase().replace(/\s+/g, '-')}`}>
        <header><span>CHANNEL DESIGN SIGNAL</span><LiveIndicator label="LIVE PREVIEW" /></header>
        <div className="channel-banner-preview">
          {bannerPreview && bannerFile?.type.startsWith('image/') && <img src={bannerPreview} alt="Channel banner preview" />}
          {bannerPreview && bannerFile?.type.startsWith('video/') && <video src={bannerPreview} autoPlay muted loop playsInline />}
          {!bannerPreview && channel?.bannerRef && <StoredMedia mediaRef={channel.bannerRef} as={channel.bannerType?.startsWith('video/') ? 'video' : 'img'} alt="" />}
          {!bannerPreview && !channel?.bannerRef && channel?.bannerUrl && <img src={channel.bannerUrl} alt="" />}
          {!bannerPreview && !channel?.bannerRef && !channel?.bannerUrl && <div className="channel-banner-preview__generated"><SignalMark animated /><i /><i /></div>}
          <div><span>{draft.themeStyle} / {draft.layoutStyle}</span><h1>{draft.bannerHeadline || draft.displayName}</h1><p>{draft.tagline}</p></div>
        </div>
        <div className="channel-identity-preview">
          {profilePreview ? <img src={profilePreview} alt="Profile preview" /> : <EntityAvatar entity={previewEntity} size="profile" />}
          <div><span>{draft.company || 'INDEPENDENT ENTITY'} / {draft.title || entity.role}</span><h2>{draft.displayName}</h2><p>{entity.handle} · SIGNAL SCORE {entity.signalScore}</p></div>
        </div>
      </section>

      <section className="channel-customizer__controls">
        <div className="console-topbar"><span>CHANNEL CONTROL DECK</span><span>LOCAL + CLOUD READY</span></div>
        <div className="channel-control-grid">
          <label><span>DISPLAY NAME</span><input name="displayName" value={draft.displayName} onChange={update} required /></label>
          <label><span>BANNER HEADLINE</span><input name="bannerHeadline" value={draft.bannerHeadline} onChange={update} /></label>
          <label className="wide"><span>CHANNEL TAGLINE</span><input name="tagline" value={draft.tagline} onChange={update} required /></label>
          <label><span>COMPANY / BRAND</span><input name="company" value={draft.company} onChange={update} /></label>
          <label><span>TITLE / POSITION</span><input name="title" value={draft.title} onChange={update} /></label>
          <label><span>THEME</span><select name="themeStyle" value={draft.themeStyle} onChange={update}>{themes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>LAYOUT</span><select name="layoutStyle" value={draft.layoutStyle} onChange={update}>{layouts.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>FEATURED MODULE</span><select name="featuredModule" value={draft.featuredModule} onChange={update}>{modules.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>ACCENT COLOR</span><input name="accentColor" type="color" value={draft.accentColor} onChange={update} /></label>
          <label className="wide"><span>ENTITY BIO / LORE</span><textarea name="bio" rows="5" value={draft.bio} onChange={update} /></label>
          <label><span>FANBASE NAME</span><input name="fanbase" value={draft.fanbase} onChange={update} /></label>
          <label><span>LINKS (ONE PER LINE)</span><textarea name="links" rows="4" value={draft.links} onChange={update} /></label>
          <label className="channel-file"><span>PROFILE IMAGE</span><input type="file" accept="image/*" onChange={chooseProfile} /><small>PNG, JPG, or WebP stored locally until cloud storage is connected.</small></label>
          <label className="channel-file"><span>BANNER IMAGE / VIDEO</span><input type="file" accept="image/*,video/*" onChange={chooseBanner} /><small>Wide image or short muted loop recommended.</small></label>
        </div>
        <div className="channel-customizer__actions">
          <button className="button button--glass" type="button" onClick={useGeneratedAvatar}>Use Generated Avatar</button>
          <p className="form-status" role="status">{status}</p>
          <button className="button button--primary" type="submit" disabled={busy}>{busy ? 'Saving channel...' : 'Save Channel'} <ArrowIcon /></button>
        </div>
      </section>
    </form>
  )
}
