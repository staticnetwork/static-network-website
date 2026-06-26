import { useEffect, useMemo, useState } from 'react'
import { StoredMedia, useStoredMedia } from '../components/AvatarSystem'
import { RouteSEO } from '../components/Router'
import { ArrowIcon, LiveIndicator, PageHero, SignalMark } from '../components/UI'
import {
  approveSageFile,
  getSageIdentity,
  officialSageNegativePrompt,
  officialSagePrompt,
  officialSageSlots,
  saveOfficialSageAsset,
  saveSageIdentity,
  uploadPublicMedia,
} from '../lib/sageIdentity'

const labScript = 'Hello. I’m S.A.G.E. Welcome to STATIC — the home of AI entertainment. If you’d like, I can show you around.'

async function providerStatus(endpoint) {
  try {
    const response = await fetch(`/.netlify/functions/${endpoint}`)
    return await response.json()
  } catch {
    return { configured: false, validated: false, unavailable: true }
  }
}

function AssetVisual({ asset, alt, as = 'img' }) {
  if (!asset) return <div className="sage-asset-empty"><SignalMark /><span>NO APPROVED ASSET</span></div>
  if (asset.mediaRef) return <StoredMedia mediaRef={asset.mediaRef} as={as} controls={as === 'video'} alt={alt} />
  if (asset.publicUrl && as === 'video') return <video src={asset.publicUrl} controls playsInline />
  if (asset.publicUrl) return <img src={asset.publicUrl} alt={alt} />
  return <div className="sage-asset-empty"><SignalMark /><span>ASSET REFERENCE UNAVAILABLE</span></div>
}

function OwnerAccessNotice() {
  return (
    <>
      <RouteSEO path="/owner-access" title="Owner Access Required | STATIC Network" description="Restricted STATIC Network owner workspace." />
      <PageHero compact code="OWNER//LOCKED" eyebrow="RESTRICTED WORKSPACE" title="Owner authorization required." copy="This route is reserved for local development or an authenticated account with the owner role." status="ACCESS BLOCKED" />
    </>
  )
}

export function OwnerOnlyPage({ allowed, children }) {
  return allowed ? children : <OwnerAccessNotice />
}

export function SageIdentityPage() {
  const [identity, setIdentity] = useState(getSageIdentity)
  const [slot, setSlot] = useState('officialSagePortrait')
  const [prompt, setPrompt] = useState(identity.prompt || officialSagePrompt)
  const [negativePrompt, setNegativePrompt] = useState(identity.negativePrompt || officialSageNegativePrompt)
  const [provider, setProvider] = useState('google')
  const [providers, setProviders] = useState({})
  const [candidate, setCandidate] = useState(null)
  const [confirmPaid, setConfirmPaid] = useState(false)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState('No candidate is awaiting approval.')

  useEffect(() => {
    Promise.all([
      providerStatus('test-google-ai'),
      providerStatus('test-openai'),
      providerStatus('upload-media'),
    ]).then(([google, openai, storage]) => setProviders({ google, openai, storage }))
  }, [])

  useEffect(() => () => {
    if (candidate?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(candidate.previewUrl)
  }, [candidate])

  function setFileCandidate(file, source) {
    if (!file) return
    setCandidate({ file, source, previewUrl: URL.createObjectURL(file) })
    setMessage('Candidate loaded locally. Review it before approval.')
  }

  async function generateCandidate() {
    if (!confirmPaid) {
      setMessage('Explicit paid-credit confirmation is required before generation.')
      return
    }
    setWorking(true)
    setMessage('Generating one owner-approved candidate...')
    try {
      const response = await fetch('/.netlify/functions/generate-entity-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          prompt: `${prompt}\n\nNegative prompt: ${negativePrompt}`,
          confirmPaid: true,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Image generation failed.')
      const blob = await (await fetch(`data:${data.mimeType};base64,${data.base64}`)).blob()
      setFileCandidate(new File([blob], `sage-${slot}-${Date.now()}.png`, { type: data.mimeType }), `generated-${provider}`)
      setMessage('A real provider candidate returned. It is not official until you approve it.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setWorking(false)
    }
  }

  async function approveCandidate() {
    if (!candidate?.file) return
    setWorking(true)
    setMessage('Saving the approved official asset...')
    try {
      const next = await approveSageFile(slot, candidate.file, candidate.source)
      setIdentity(next)
      setCandidate(null)
      setMessage(providers.storage?.validated
        ? 'Official asset approved. Public media storage was requested for talking-avatar use.'
        : 'Official asset approved locally. Talking-video generation remains blocked until public R2 media storage is connected.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setWorking(false)
    }
  }

  function savePrompts() {
    setIdentity(saveSageIdentity({ ...identity, prompt, negativePrompt }))
    setMessage('Official prompt configuration saved locally.')
  }

  const activeProvider = providers[provider]
  const activeCount = Object.keys(identity.assets || {}).length

  return (
    <>
      <RouteSEO path="/sage-identity" title="S.A.G.E. Identity | STATIC Network" description="Owner workspace for generating and approving the official S.A.G.E. visual identity." />
      <PageHero compact code="SAGE//IDENTITY" eyebrow="OWNER VISUAL WORKSPACE" title="Generate her. Approve her. Make her official." copy="Every visual remains a candidate until the owner explicitly approves it into a named S.A.G.E. asset slot." status={`${activeCount}/10 SLOTS ACTIVE`} />
      <section className="section sage-owner-page">
        <div className="page-frame sage-owner-grid">
          <div className="sage-owner-console">
            <div className="sage-owner-status">
              <LiveIndicator label={activeProvider?.validated ? `${provider.toUpperCase()} CONNECTED` : 'IMAGE PROVIDER BLOCKED'} />
              <span>{providers.storage?.validated ? 'R2 PUBLIC STORAGE CONNECTED' : 'R2 PUBLIC STORAGE NOT CONNECTED'}</span>
            </div>
            <label><span>Official asset slot</span><select value={slot} onChange={(event) => setSlot(event.target.value)}>{officialSageSlots.filter(([id]) => !id.endsWith('Video')).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label><span>Official prompt</span><textarea rows="8" value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
            <label><span>Negative prompt</span><textarea rows="5" value={negativePrompt} onChange={(event) => setNegativePrompt(event.target.value)} /></label>
            <div className="sage-owner-actions">
              <button className="button button--glass" type="button" onClick={savePrompts}>Save Prompt</button>
              <label className="sage-file-button">Upload Candidate<input type="file" accept="image/*" onChange={(event) => setFileCandidate(event.target.files?.[0], 'owner-upload')} /></label>
            </div>
            <div className="sage-provider-choice">
              <label><span>Image provider</span><select value={provider} onChange={(event) => setProvider(event.target.value)}><option value="google">Google AI</option><option value="openai">OpenAI</option></select></label>
              <label className="sage-confirm"><input type="checkbox" checked={confirmPaid} onChange={(event) => setConfirmPaid(event.target.checked)} /><span>I approve one provider generation that may consume paid credits.</span></label>
              <button className="button button--signal" type="button" onClick={generateCandidate} disabled={working || !activeProvider?.validated}>{working ? 'Working...' : 'Generate One Candidate'} <ArrowIcon /></button>
            </div>
            {!activeProvider?.validated && <p className="sage-blocked">Blocked by provider activation. Run <code>npm run activate-image-provider</code>, import the environment into Netlify, and redeploy.</p>}
          </div>

          <aside className="sage-candidate-stage">
            <div className="sage-candidate-stage__meta"><span>CANDIDATE//{slot}</span><span>{candidate ? 'AWAITING OWNER APPROVAL' : 'NO CANDIDATE'}</span></div>
            {candidate ? <img src={candidate.previewUrl} alt="S.A.G.E. candidate awaiting approval" /> : <div className="sage-candidate-empty"><SignalMark animated /><h2>Official identity begins with approval.</h2><p>Generate one real image or upload an owner-selected asset.</p></div>}
            {candidate && <button className="button button--signal" type="button" onClick={approveCandidate} disabled={working}>Approve As Official <ArrowIcon /></button>}
            <p role="status">{message}</p>
          </aside>
        </div>
        <div className="page-frame sage-slot-grid">
          {officialSageSlots.map(([id, label]) => {
            const asset = identity.assets?.[id]
            const video = id.endsWith('Video')
            return <article className={asset ? 'is-active' : ''} key={id}><div><span>{label}</span><small>{asset ? 'ACTIVE / OWNER APPROVED' : 'REQUIRES ASSET'}</small></div><div className="sage-slot-visual"><AssetVisual asset={asset} as={video ? 'video' : 'img'} alt={`Official S.A.G.E. ${label}`} /></div><code>{id}</code></article>
          })}
        </div>
      </section>
    </>
  )
}

function SelectedSageImage({ asset }) {
  const localUrl = useStoredMedia(asset?.mediaRef)
  const url = localUrl || asset?.publicUrl || ''
  if (!url) return <div className="sage-asset-empty"><SignalMark /><span>SELECT AN APPROVED IMAGE</span></div>
  return <img src={url} alt="Selected official S.A.G.E." />
}

export function SageLabPage() {
  const [identity, setIdentity] = useState(getSageIdentity)
  const imageAssets = useMemo(() => Object.entries(identity.assets || {}).filter(([, asset]) => asset.mimeType?.startsWith('image/')), [identity])
  const [selectedSlot, setSelectedSlot] = useState(imageAssets[0]?.[0] || '')
  const [script, setScript] = useState(labScript)
  const [audio, setAudio] = useState(null)
  const [imageUrlOverride, setImageUrlOverride] = useState('')
  const [audioUrlOverride, setAudioUrlOverride] = useState('')
  const [talk, setTalk] = useState(null)
  const [providers, setProviders] = useState({})
  const [confirmAudio, setConfirmAudio] = useState(false)
  const [confirmVideo, setConfirmVideo] = useState(false)
  const [clipSlot, setClipSlot] = useState('officialSageTalkingVideo')
  const [working, setWorking] = useState('')
  const [message, setMessage] = useState('The lab has not generated audio or video yet.')
  const selectedAsset = identity.assets?.[selectedSlot]

  useEffect(() => {
    Promise.all([
      providerStatus('test-elevenlabs'),
      providerStatus('test-talking-avatar'),
      providerStatus('upload-media'),
    ]).then(([voice, avatar, storage]) => setProviders({ voice, avatar, storage }))
  }, [])

  async function generateAudio() {
    if (!confirmAudio) {
      setMessage('Approve the ElevenLabs credit request before generating audio.')
      return
    }
    setWorking('audio')
    setMessage('Generating real ElevenLabs audio...')
    try {
      const response = await fetch('/.netlify/functions/generate-sage-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, confirmPaid: true }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ElevenLabs generation failed.')
      const remote = await uploadPublicMedia({
        base64: data.audioBase64,
        fileName: `sage-lab-${Date.now()}.mp3`,
        contentType: data.mimeType,
      })
      setAudio({ ...data, dataUrl: `data:${data.mimeType};base64,${data.audioBase64}`, publicUrl: remote.publicUrl })
      setMessage(remote.publicUrl
        ? 'ElevenLabs audio is working and stored at a public media URL for talking-video generation.'
        : 'ElevenLabs audio is working. Talking-video generation remains blocked until R2 exposes a public audio URL.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setWorking('')
    }
  }

  async function pollTalk(id) {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000))
      const response = await fetch('/.netlify/functions/generate-talking-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Talking-video status check failed.')
      setTalk(data)
      if (data.status === 'done' && data.resultUrl) return data
      if (data.status === 'error' || data.status === 'rejected') throw new Error(data.error || 'Talking-video generation failed.')
    }
    throw new Error('Talking-video generation is still processing. Use the returned D-ID ID to check again later.')
  }

  async function generateTalkingVideo() {
    const sourceUrl = imageUrlOverride.trim() || selectedAsset?.publicUrl || ''
    const audioUrl = audioUrlOverride.trim() || audio?.publicUrl || ''
    if (!sourceUrl || !audioUrl) {
      setMessage('A public image URL and public ElevenLabs audio URL are required. Connect R2 or provide owner-controlled public URLs.')
      return
    }
    if (!confirmVideo) {
      setMessage('Approve the talking-avatar credit request before generating video.')
      return
    }
    setWorking('video')
    setMessage('Creating a real D-ID talking-video job...')
    try {
      const response = await fetch('/.netlify/functions/generate-talking-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', sourceUrl, audioUrl, confirmPaid: true }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Talking-video generation failed.')
      setTalk(data)
      const completed = await pollTalk(data.id)
      setTalk(completed)
      setMessage('A real talking video returned. Inspect mouth movement and audio sync before approval.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setWorking('')
    }
  }

  function approveVideo() {
    if (!talk?.resultUrl) return
    const next = saveOfficialSageAsset(clipSlot, {
      publicUrl: talk.resultUrl,
      source: 'did-talking-avatar',
      providerId: talk.id,
      mimeType: 'video/mp4',
      fileName: `${clipSlot}.mp4`,
      storage: 'provider-hosted',
    })
    setIdentity(next)
    setMessage(`Owner approved the visibly reviewed result as ${clipSlot}.`)
  }

  return (
    <>
      <RouteSEO path="/sage-lab" title="S.A.G.E. Lab | STATIC Network" description="Owner lab for testing real S.A.G.E. voice, talking video, lip sync, and movement." />
      <PageHero compact code="SAGE//LAB" eyebrow="OWNER TRANSFORMATION LAB" title="Image plus voice, transformed into presence." copy="This lab reports each provider boundary honestly. A talking state is active only after a real synchronized video is returned and approved." status={talk?.resultUrl ? 'RESULT READY FOR REVIEW' : 'PIPELINE CHECK'} />
      <section className="section sage-owner-page">
        <div className="page-frame sage-lab-status">
          <div className={providers.voice?.validated ? 'is-active' : ''}><span>01</span><strong>ElevenLabs</strong><small>{providers.voice?.validated ? 'CONNECTED' : 'BLOCKED BY ACTIVATION'}</small></div>
          <div className={providers.storage?.validated ? 'is-active' : ''}><span>02</span><strong>Public media</strong><small>{providers.storage?.validated ? 'R2 CONNECTED' : 'PUBLIC URL REQUIRED'}</small></div>
          <div className={providers.avatar?.validated && providers.avatar?.generationSupported ? 'is-active' : ''}><span>03</span><strong>Talking avatar</strong><small>{providers.avatar?.validated ? `${providers.avatar.provider} ${providers.avatar.generationSupported ? 'CONNECTED' : 'ADAPTER REQUIRED'}` : 'BLOCKED BY ACTIVATION'}</small></div>
        </div>
        <div className="page-frame sage-lab-grid">
          <div className="sage-lab-controls">
            <label><span>Approved official image</span><select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)}><option value="">Select an approved image</option>{imageAssets.map(([id]) => <option value={id} key={id}>{id}</option>)}</select></label>
            <div className="sage-lab-image"><SelectedSageImage asset={selectedAsset} /></div>
            <label><span>Public image URL override</span><input type="url" value={imageUrlOverride} onChange={(event) => setImageUrlOverride(event.target.value)} placeholder="https:// owner-controlled image URL" /></label>
            <label><span>S.A.G.E. script</span><textarea rows="6" value={script} onChange={(event) => setScript(event.target.value)} /></label>
            <label className="sage-confirm"><input type="checkbox" checked={confirmAudio} onChange={(event) => setConfirmAudio(event.target.checked)} /><span>I approve one ElevenLabs generation that may consume credits.</span></label>
            <button className="button button--signal" type="button" onClick={generateAudio} disabled={working || !providers.voice?.validated}>{working === 'audio' ? 'Generating Audio...' : 'Generate ElevenLabs Audio'} <ArrowIcon /></button>
            {audio?.dataUrl && <audio src={audio.dataUrl} controls />}
            <label><span>Public audio URL override</span><input type="url" value={audioUrlOverride} onChange={(event) => setAudioUrlOverride(event.target.value)} placeholder="https:// owner-controlled ElevenLabs audio URL" /></label>
            <label className="sage-confirm"><input type="checkbox" checked={confirmVideo} onChange={(event) => setConfirmVideo(event.target.checked)} /><span>I approve one talking-avatar job that may consume trial or paid credits.</span></label>
            <button className="button button--signal" type="button" onClick={generateTalkingVideo} disabled={working || !providers.avatar?.validated || !providers.avatar?.generationSupported}>{working === 'video' ? 'Rendering + Checking Sync...' : 'Generate Talking Video'} <ArrowIcon /></button>
            <p className="sage-blocked" role="status">{message}</p>
          </div>
          <aside className="sage-lab-result">
            <div><span>TALKING OUTPUT</span><span>{talk?.status?.toUpperCase() || 'NO JOB'}</span></div>
            {talk?.resultUrl ? <video src={talk.resultUrl} controls playsInline /> : <div className="sage-candidate-empty"><SignalMark animated /><h2>No synchronized result yet.</h2><p>Voice, public media, and D-ID must all validate before this stage can produce a reviewable clip.</p></div>}
            {talk?.resultUrl && <>
              <label><span>Approve as</span><select value={clipSlot} onChange={(event) => setClipSlot(event.target.value)}>{officialSageSlots.filter(([id]) => id.endsWith('Video')).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
              <button className="button button--signal" type="button" onClick={approveVideo}>Approve Visible Lip Sync <ArrowIcon /></button>
            </>}
          </aside>
        </div>
      </section>
    </>
  )
}
