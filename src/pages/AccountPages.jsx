import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { StoredMedia } from '../components/AvatarSystem'
import { Link, RouteSEO, useRouter } from '../components/Router'
import { ArrowIcon, ButtonLink, LiveIndicator, SignalMark } from '../components/UI'
import { generateEntityImages } from '../lib/ai/entityImage/entityImageProvider'
import { buildLaunchReadinessSnapshot } from '../lib/launchSystems'
import {
  getLocalAccount,
  getNetworkStats,
  getSignals,
  saveLocalAccount,
  saveCreatorProfile,
  saveMedia,
  subscribeToNetworkUpdates,
} from '../lib/staticStore'
import { getCloudBackboneStatus, uploadCloudMedia } from '../lib/storage/supabaseStore'
import { getRadioAdminConsole, getStaticWallet, reviewRadioTrack } from '../lib/socialActions'

const accountTypes = ['Fan', 'Creator', 'Studio', 'Brand']

function isMrStoneAccount(user, profile, localAccount = {}) {
  const role = user?.app_metadata?.role || user?.user_metadata?.role
  const values = [
    role,
    profile?.username,
    profile?.display_name,
    user?.user_metadata?.username,
    user?.user_metadata?.display_name,
    localAccount.username,
    localAccount.displayName,
    user?.email,
  ].map((value) => String(value || '').trim().toLowerCase())

  return values.some((value) => (
    value === 'owner'
    || value === 'mrstone'
    || value === 'mr.stone'
    || value === 'mr stone'
    || value === '@mrstone'
    || value === 'thestaticnetwork.com@gmail.com'
  ))
}

export function AuthPage({ mode }) {
  const signup = mode === 'signup'
  const { configured, user, signIn, signUp } = useAuth()
  const { navigate } = useRouter()
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate('/account')
  }, [navigate, user])

  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!configured) {
	      if (signup) {
	        const saved = saveLocalAccount({
	          displayName: form.get('displayName'),
	          username: form.get('username'),
	          accountType: form.get('accountType'),
	          email: form.get('email'),
	          mode: 'local',
	          createdAt: new Date().toISOString(),
	        })
	        saveCreatorProfile({
	          displayName: saved.displayName,
	          handle: saved.username,
	        })
	        setStatus('Profile created on this device. Connect cloud sync later when you are ready.')
	        window.setTimeout(() => navigate('/account'), 450)
      } else {
        setStatus('Cloud sign-in is not connected in this environment. Opening local profile mode.')
        window.setTimeout(() => navigate('/account'), 450)
      }
      return
    }
    setBusy(true)
    setStatus('')
    try {
	      if (signup) {
	        const result = await signUp({
	          email: form.get('email'),
	          password: form.get('password'),
	          displayName: form.get('displayName'),
	          username: form.get('username'),
	          accountType: form.get('accountType'),
	        })
	        if (result.session) {
	          saveCreatorProfile({
	            displayName: form.get('displayName'),
	            handle: form.get('username'),
	          })
	        }
	        setStatus(result.session ? 'Account created. Opening your profile.' : 'Check your email to confirm your STATIC account.')
	        if (result.session) window.setTimeout(() => navigate('/account'), 500)
      } else {
        await signIn(form.get('email'), form.get('password'))
        setStatus('Welcome back. Opening your profile.')
        window.setTimeout(() => navigate('/account'), 400)
      }
    } catch (error) {
      setStatus(error.message || 'The account transmission could not be completed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <RouteSEO path={signup ? '/signup' : '/login'} />
      <section className="auth-page portal-auth-page">
        <div className="broadcast-grid" />
        <div className="auth-page__visual">
          <div className="auth-orbit"><i /><i /><i /><SignalMark animated /></div>
          <LiveIndicator label={configured ? 'STATIC SOCIAL SIGNUP' : 'LOCAL PREVIEW'} />
          <h1>{signup ? 'Join STATIC Social.' : 'Log in to STATIC.'}</h1>
          <p>{signup ? 'Create your profile, post AI-made or AI-assisted work, follow creators, and start building Signal.' : 'Log in to post, save, share, report, go live, and keep building your Signal.'}</p>
          <div><span>POST AI WORK</span><span>BUILD SIGNAL</span><span>FOLLOW CREATORS</span></div>
        </div>
        <form className="auth-panel portal-auth-panel" onSubmit={submit}>
          <header><span>STATIC ACCOUNT</span><LiveIndicator label={signup ? 'SIGNUP' : 'LOGIN'} /></header>
          <h2>{signup ? 'Create your account' : 'Welcome back'}</h2>
          {!configured && <div className="account-beta-note"><SignalMark /><p><b>LOCAL PROFILE MODE</b> This creates a device-local STATIC profile. It does not sync until the account cloud is connected.</p></div>}
          {signup && <>
            <label><span>DISPLAY NAME</span><input name="displayName" autoComplete="name" required /></label>
            <label><span>USERNAME</span><input name="username" autoComplete="username" required /></label>
            <label><span>ACCOUNT TYPE</span><select name="accountType">{accountTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          </>}
          <label><span>EMAIL</span><input name="email" type="email" autoComplete="email" required /></label>
          <label><span>PASSWORD</span><input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength="8" required /></label>
          <button className="button button--primary button--wide" type="submit" disabled={busy}>{busy ? 'Working...' : signup ? 'Create Account' : 'Log In'} <ArrowIcon /></button>
          <p className="form-status" role="status">{status}</p>
          <footer>
            <span>Posting rule: AI-made or AI-assisted work only.</span>
            {signup ? ' Already have an account?' : ' New to STATIC Social?'} <Link to={signup ? '/login' : '/signup'}>{signup ? 'Log in' : 'Create account'}</Link>
          </footer>
        </form>
      </section>
    </>
  )
}

export function AccountPage() {
  const { configured, session, user, profile, loading, signOut, updateProfile, cloudSync, syncNow } = useAuth()
  const [status, setStatus] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [artPrompt, setArtPrompt] = useState('')
  const [artTarget, setArtTarget] = useState('avatar')
  const [confirmAiSpend, setConfirmAiSpend] = useState(false)
  const [generatingArt, setGeneratingArt] = useState(false)
  const [localAccount, setLocalAccount] = useState(() => getLocalAccount() || {})
  const [stats, setStats] = useState(() => getNetworkStats())
  const [walletState, setWalletState] = useState({ loading: false, ready: false, wallet: null, ledger: [], message: '' })
  const [radioAdmin, setRadioAdmin] = useState({ loading: false, ready: false, queue: [], approved: [], schedule: [], stats: {}, message: '' })
  const [backendStatus, setBackendStatus] = useState({ ready: false, mode: 'checking' })
  const ownerAccount = isMrStoneAccount(user, profile, localAccount)

  useEffect(() => subscribeToNetworkUpdates(() => {
    setStats(getNetworkStats())
  }), [])

  useEffect(() => {
    if (!user || !session?.access_token) {
      setWalletState({ loading: false, ready: false, wallet: null, ledger: [], message: 'Log in to activate Static Coins.' })
      return undefined
    }
    let active = true
    setWalletState((current) => ({ ...current, loading: true, message: 'Reading Static Coin wallet...' }))
    getStaticWallet(session)
      .then((data) => {
        if (!active) return
        setWalletState({
          loading: false,
          ready: Boolean(data.ready),
          wallet: data.wallet,
          ledger: data.ledger || [],
          message: data.ready ? 'Wallet ready.' : data.error || 'Wallet migration pending.',
        })
      })
      .catch((error) => {
        if (!active) return
        setWalletState({
          loading: false,
          ready: false,
          wallet: null,
          ledger: [],
          message: error.message || 'Wallet service is not available in this preview.',
        })
      })
    return () => {
      active = false
    }
  }, [session, user])

  const loadRadioAdmin = useCallback(async (shouldCommit = () => true) => {
    setRadioAdmin((current) => ({ ...current, loading: true, message: current.message || 'Loading STATIC Radio review queue...' }))
    try {
      const data = await getRadioAdminConsole(session)
      if (!shouldCommit()) return
      setRadioAdmin({
        loading: false,
        ready: true,
        queue: data.queue || [],
        approved: data.approved || [],
        schedule: data.schedule || [],
        stats: data.stats || {},
        message: data.queue?.length ? 'Radio submissions need review.' : 'Radio queue clear.',
      })
    } catch (error) {
      if (!shouldCommit()) return
      setRadioAdmin({ loading: false, ready: false, queue: [], approved: [], schedule: [], stats: {}, message: error.message || 'Radio admin unavailable.' })
    }
  }, [session])

  useEffect(() => {
    if (!ownerAccount || !session?.access_token) {
      setRadioAdmin({ loading: false, ready: false, queue: [], approved: [], schedule: [], stats: {}, message: ownerAccount ? 'Owner login required for radio review.' : '' })
      return undefined
    }
    let active = true
    loadRadioAdmin(() => active)
    return () => {
      active = false
    }
  }, [loadRadioAdmin, ownerAccount, session?.access_token])

  useEffect(() => {
    let active = true
    if (!user) {
      setBackendStatus({ ready: false, mode: 'signed-out' })
      return undefined
    }
    getCloudBackboneStatus(user.id)
      .then((status) => {
        if (active) setBackendStatus(status)
      })
      .catch((error) => {
        if (active) setBackendStatus({ ready: false, mode: 'error', error: error.message || 'Backend status unavailable.' })
      })
    return () => {
      active = false
    }
  }, [user])

  async function handleRadioReview(trackId, action) {
    setRadioAdmin((current) => ({ ...current, loading: true, message: `${action === 'approve' ? 'Approving' : action === 'reject' ? 'Rejecting' : action === 'unschedule' ? 'Removing' : 'Scheduling'} track...` }))
    try {
      const data = await reviewRadioTrack(session, {
        trackId,
        action,
        schedule: action === 'approve',
      })
      setRadioAdmin({
        loading: false,
        ready: true,
        queue: data.queue || [],
        approved: data.approved || [],
        schedule: data.schedule || [],
        stats: data.stats || {},
        message: action === 'approve' ? 'Track approved and added to STATIC Radio rotation.' : action === 'reject' ? 'Track rejected and removed from rotation.' : action === 'unschedule' ? 'Track removed from station rotation.' : 'Track scheduled.',
      })
    } catch (error) {
      setRadioAdmin((current) => ({ ...current, loading: false, message: error.message || 'Radio review failed.' }))
    }
  }

	  async function saveProfile(event) {
	    event.preventDefault()
	    const form = new FormData(event.currentTarget)
	    if (!user) {
	      const saved = saveLocalAccount({
        ...localAccount,
        displayName: form.get('displayName'),
	        username: form.get('username'),
	        accountType: form.get('accountType'),
	        email: localAccount.email || '',
        bio: form.get('bio'),
        websiteUrl: form.get('websiteUrl'),
	        mode: 'local',
	        updatedAt: new Date().toISOString(),
	      })
	      saveCreatorProfile({
	        displayName: saved.displayName,
	        handle: saved.username,
	        avatarRef: saved.avatarRef,
	        bannerRef: saved.bannerRef,
	        bannerUrl: saved.bannerUrl,
	      })
	      setLocalAccount(saved)
	      setStatus('Local profile updated.')
	      return
	    }
	    try {
	      const savedProfile = await updateProfile({
	        displayName: form.get('displayName'),
	        username: form.get('username'),
	        accountType: form.get('accountType'),
	        avatarUrl: profile?.avatar_url,
        bannerUrl: profile?.banner_url || localAccount.bannerUrl || '',
        bio: form.get('bio'),
        websiteUrl: form.get('websiteUrl'),
	      })
	      saveCreatorProfile({
	        displayName: savedProfile?.display_name || form.get('displayName'),
	        handle: savedProfile?.username || form.get('username'),
	        avatarUrl: savedProfile?.avatar_url || profile?.avatar_url || '',
	        bannerUrl: savedProfile?.banner_url || localAccount.bannerUrl || '',
	        bannerRef: localAccount.bannerRef || '',
        bio: savedProfile?.bio || '',
        websiteUrl: savedProfile?.website_url || '',
	      })
	      setStatus('Account profile updated.')
	    } catch (error) {
	      setStatus(error.message)
	    }
  }

  async function storeProfileImage(file) {
    try {
      if (user && configured) {
        const uploaded = await uploadCloudMedia({ bucket: 'avatars', ownerId: user.id, file })
	        await updateProfile({
	          displayName: profile?.display_name,
	          username: profile?.username,
	          accountType: profile?.account_type,
	          avatarUrl: uploaded.publicUrl,
          bannerUrl: profile?.banner_url || localAccount.bannerUrl || '',
          bio: profile?.bio || localAccount.bio || '',
          websiteUrl: profile?.website_url || localAccount.websiteUrl || '',
	        })
	        saveCreatorProfile({
	          displayName: profile?.display_name,
	          handle: profile?.username,
	          avatarUrl: uploaded.publicUrl,
	          bannerUrl: profile?.banner_url || localAccount.bannerUrl || '',
	          bannerRef: localAccount.bannerRef || '',
          bio: profile?.bio || localAccount.bio || '',
          websiteUrl: profile?.website_url || localAccount.websiteUrl || '',
		        })
		        setStatus('Cloud profile image updated.')
		      } else {
		        const media = await saveMedia(file, { type: 'account-avatar' })
	        const saved = saveLocalAccount({ ...localAccount, avatarRef: media.id })
	        saveCreatorProfile({ avatarRef: media.id, bannerRef: saved.bannerRef, bannerUrl: saved.bannerUrl })
	        setLocalAccount(saved)
	        setStatus('Local profile image updated.')
	      }
	    } catch (error) {
	      setStatus(error.message || 'The profile image could not be stored.')
		    }
		  }

  async function uploadProfileImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setStatus('Storing profile image...')
    await storeProfileImage(file)
  }

  async function storeProfileBanner(file) {
		    try {
		      if (user && configured) {
		        const uploaded = await uploadCloudMedia({
	          bucket: 'banners',
	          ownerId: user.id,
	          file,
	          metadata: { type: 'profile-banner', source: 'account-profile' },
	        })
        await updateProfile({
          displayName: profile?.display_name || localAccount.displayName,
          username: profile?.username || localAccount.username,
          accountType: profile?.account_type || localAccount.accountType,
          avatarUrl: profile?.avatar_url || localAccount.avatarUrl || '',
          bannerUrl: uploaded.publicUrl,
          bio: profile?.bio || localAccount.bio || '',
          websiteUrl: profile?.website_url || localAccount.websiteUrl || '',
        })
	        const saved = saveLocalAccount({
	          ...localAccount,
	          bannerUrl: uploaded.publicUrl,
	          bannerRef: '',
	          updatedAt: new Date().toISOString(),
	        })
	        saveCreatorProfile({
	          displayName: profile?.display_name || localAccount.displayName,
	          handle: profile?.username || localAccount.username,
	          avatarUrl: profile?.avatar_url || '',
	          bannerUrl: uploaded.publicUrl,
	          bannerRef: '',
          bio: profile?.bio || localAccount.bio || '',
          websiteUrl: profile?.website_url || localAccount.websiteUrl || '',
	        })
	        setLocalAccount(saved)
	        setStatus(uploaded.metadataError ? `Banner updated. Media metadata still needs backend migration: ${uploaded.metadataError}` : 'Profile banner updated.')
	      } else {
	        const media = await saveMedia(file, { type: 'account-banner' })
	        const saved = saveLocalAccount({
	          ...localAccount,
	          bannerRef: media.id,
	          bannerUrl: '',
	          updatedAt: new Date().toISOString(),
	        })
	        saveCreatorProfile({ bannerRef: media.id, bannerUrl: '', avatarRef: saved.avatarRef })
	        setLocalAccount(saved)
	        setStatus('Local profile banner updated.')
	      }
		    } catch (error) {
		      setStatus(error.message || 'The profile banner could not be stored.')
		    }
		  }

		  async function uploadProfileBanner(event) {
		    const file = event.target.files?.[0]
		    if (!file) return
		    if (!String(file.type || '').startsWith('image/')) {
		      setStatus('Profile banners need to be image files.')
		      event.currentTarget.value = ''
		      return
		    }
		    setStatus('Storing profile banner...')
		    await storeProfileBanner(file)
		  }

  async function fileFromGeneratedImage(image, target) {
    const response = await fetch(image.dataUrl)
    const blob = await response.blob()
    const extension = blob.type.includes('jpeg') ? 'jpg' : blob.type.includes('webp') ? 'webp' : 'png'
    const handle = (profile?.username || localAccount.username || 'static-profile').replace(/^@/, '') || 'static-profile'
    return new File([blob], `${handle}-${target}-${Date.now()}.${extension}`, { type: blob.type || 'image/png' })
  }

  async function generateAccountArt() {
    const prompt = artPrompt.trim()
    if (!prompt) {
      setStatus('Describe the profile art you want first.')
      return
    }
    if (!confirmAiSpend) {
      setStatus('Confirm the provider credit request before generating profile art.')
      return
    }
    setGeneratingArt(true)
    setStatus(artTarget === 'banner' ? 'Generating profile banner...' : 'Generating profile image...')
    try {
      const [image] = await generateEntityImages('google', {
        prompt: `${prompt}\n\nCreate polished STATIC Social profile art. Premium, cinematic, clean, safe for public social profile use. ${artTarget === 'banner' ? 'Wide profile banner composition, room for avatar overlay, no tiny unreadable UI text.' : 'Square profile image composition, strong center subject, clear at small avatar size.'}`,
        outputType: artTarget === 'banner' ? 'profile-banner' : 'profile-image',
        confirmPaid: true,
      })
      if (!image?.dataUrl) throw new Error('The image provider returned no usable image.')
      const file = await fileFromGeneratedImage(image, artTarget)
      if (artTarget === 'banner') {
        await storeProfileBanner(file)
      } else {
        await storeProfileImage(file)
      }
      setStatus(artTarget === 'banner' ? 'Generated banner saved to your profile.' : 'Generated profile image saved to your profile.')
    } catch (error) {
      setStatus(error.message || 'Profile art generation failed.')
    } finally {
      setGeneratingArt(false)
    }
  }

  async function manualCloudSync() {
    setSyncing(true)
    setStatus('')
    try {
      const result = await syncNow('manual')
      if (result) {
        setStatus(`Cloud saved: ${result.importedEntities} identities, ${result.syncedProjects} projects, ${result.syncedMarketplaceActions} saved items, ${result.syncedFollows || 0} follows, and ${result.syncedReminders} reminders.`)
      } else {
        setStatus('Log in before syncing this device.')
      }
    } catch (error) {
      setStatus(error.message || 'Cloud sync could not finish.')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return <AccountLoading />

  return (
    <>
      <RouteSEO path="/account" />
      <section className="account-hero">
        <div className="broadcast-grid" />
        <div className="page-frame">
          <LiveIndicator label={ownerAccount ? 'FOUNDER ACCOUNT' : user ? 'ACCOUNT ONLINE' : configured ? 'LOGIN REQUIRED' : 'LOCAL PROFILE MODE'} />
          <h1>{ownerAccount ? 'Mr. Stone' : profile?.display_name || localAccount.displayName || user?.email?.split('@')[0] || 'STATIC Creator'}</h1>
          <p>{ownerAccount ? 'Founder account controls, content posting, Signal status, and site stats live here.' : user ? 'Your STATIC Social account for posting, following, saving, reporting, and building Signal.' : 'Local creator mode is active on this device. Log in to synchronize across phone and computer.'}</p>
          <div className="button-row">
            {!user && <ButtonLink to="/login">Login <ArrowIcon /></ButtonLink>}
            {!user && <ButtonLink to="/signup" variant="glass">Create Account</ButtonLink>}
            {user && <button className="button button--glass" type="button" onClick={signOut}>Logout</button>}
          </div>
        </div>
      </section>
      <section className="section account-page">
        <div className="page-frame account-grid">
	          <form className="account-profile-card" onSubmit={saveProfile}>
	            <header><span>PROFILE</span><span>{user ? 'CLOUD' : 'LOCAL'}</span></header>
	            <div className="account-banner-preview">
	              {localAccount.bannerRef ? (
	                <StoredMedia mediaRef={localAccount.bannerRef} alt="" />
	              ) : profile?.banner_url || localAccount.bannerUrl ? (
	                <img src={profile?.banner_url || localAccount.bannerUrl} alt="" />
	              ) : (
	                <div><SignalMark animated /><span>Profile banner</span></div>
	              )}
	            </div>
		            <label className="account-avatar-upload account-banner-upload"><span>BANNER IMAGE</span><input type="file" accept="image/*" onChange={uploadProfileBanner} /></label>
		            <div className="account-avatar">
		              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : localAccount.avatarRef ? <StoredMedia mediaRef={localAccount.avatarRef} alt="" /> : profile?.display_name?.slice(0, 2).toUpperCase() || localAccount.displayName?.slice(0, 2).toUpperCase() || 'ST'}
		              <SignalMark animated />
	            </div>
	            <label className="account-avatar-upload"><span>PROFILE PICTURE</span><input type="file" accept="image/*" onChange={uploadProfileImage} /></label>
	            <div className="account-ai-art-lab">
	              <header><span>CREATE PROFILE ART</span><b>GOOGLE AI</b></header>
	              <select value={artTarget} onChange={(event) => setArtTarget(event.target.value)}>
	                <option value="avatar">Profile picture</option>
	                <option value="banner">Banner image</option>
	              </select>
	              <textarea rows="3" value={artPrompt} onChange={(event) => setArtPrompt(event.target.value)} placeholder="Describe the profile image or banner you want." />
	              <label className="account-ai-art-lab__confirm">
	                <input type="checkbox" checked={confirmAiSpend} onChange={(event) => setConfirmAiSpend(event.target.checked)} />
	                <span>Use provider credits for this generation</span>
	              </label>
	              <button className="button button--glass button--wide" type="button" onClick={generateAccountArt} disabled={generatingArt}>
	                {generatingArt ? 'Generating...' : 'Generate And Save'}
	              </button>
	            </div>
	            <label><span>DISPLAY NAME</span><input name="displayName" defaultValue={profile?.display_name || localAccount.displayName || ''} /></label>
            <label><span>USERNAME</span><input name="username" defaultValue={profile?.username || localAccount.username || ''} /></label>
            <label><span>BIO</span><textarea name="bio" rows="3" defaultValue={profile?.bio || localAccount.bio || ''} placeholder="Tell people what you create." /></label>
            <label><span>WEBSITE</span><input name="websiteUrl" type="url" defaultValue={profile?.website_url || localAccount.websiteUrl || ''} placeholder="https://" /></label>
            <label><span>EMAIL</span><input value={user?.email || 'Not logged in'} readOnly /></label>
            <label><span>ACCOUNT TYPE</span><select name="accountType" defaultValue={profile?.account_type || localAccount.accountType || 'Creator'}>{accountTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <button className="button button--primary button--wide" type="submit">Save Account</button>
          </form>
          <div className="account-network">
            <div className="account-mode-card">
              <div><LiveIndicator label={ownerAccount ? 'OWNER VIEW' : user ? 'CLOUD ACCOUNT' : 'LOCAL PROFILE'} /><span>{configured ? 'ACCOUNT CLOUD READY' : 'LOCAL PREVIEW'}</span></div>
              <h2>{ownerAccount ? 'Founder stats and posting are ready.' : user ? 'Your profile can travel.' : 'Browse now. Log in to participate.'}</h2>
              <p>{ownerAccount ? 'Use this account for official posts, music drops, music videos, founder updates, and private site stats.' : user ? 'This account is ready to post AI work, save posts, follow creators, and keep Signal attached to your profile.' : 'Visitors can browse STATIC Social. Accounts unlock posting, following, comments, saves, reports, and future creator tools.'}</p>
              <StaticWalletPanel walletState={walletState} />
              <div className={`cloud-sync-panel cloud-sync-panel--${cloudSync?.status || 'local-only'}`}>
                <span>CLOUD SYNC</span>
                <strong>{cloudSync?.status === 'synced' ? 'Cloud saved' : cloudSync?.status === 'syncing' ? 'Syncing now' : cloudSync?.status === 'queued' ? 'Save queued' : cloudSync?.status === 'error' ? 'Needs attention' : user ? 'Ready' : 'Sign in required'}</strong>
                <p>{cloudSync?.message || 'Cloud sync status will appear here.'}</p>
                {cloudSync?.lastSyncedAt && <small>Last sync: {new Date(cloudSync.lastSyncedAt).toLocaleString()}</small>}
                <button className="button button--glass" type="button" onClick={manualCloudSync} disabled={!user || syncing || cloudSync?.status === 'syncing'}>
                  {syncing || cloudSync?.status === 'syncing' ? 'Syncing...' : 'Sync Device To Cloud'}
                </button>
              </div>
              <p className="form-status">{status}</p>
            </div>
            <div className="account-stats-grid">
              {[
                ['Posts', stats.publicSignals],
                ['Channels', stats.channels],
                ['Follows', stats.follows],
                ['Saved', stats.savedCatalog],
                ['Projects', stats.projects],
                ['Reminders', stats.reminders],
              ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
            </div>
            {ownerAccount && <OwnerStatsPanel stats={stats} cloudSync={cloudSync} />}
            {ownerAccount && <OwnerRadioPanel radioAdmin={radioAdmin} onRefresh={() => loadRadioAdmin()} onReview={handleRadioReview} />}
            {ownerAccount && <LaunchReadinessPanel configured={configured} user={user} backendStatus={backendStatus} />}
            {ownerAccount && <BackendPhasePanel status={backendStatus} configured={configured} user={user} />}
            <div className="account-quick-links">
              <ButtonLink to="/feed#create-post">Create Post <ArrowIcon /></ButtonLink>
              <ButtonLink to="/feed" variant="glass">Open Feed</ButtonLink>
              <ButtonLink to="/studio" variant="glass">Create Tools</ButtonLink>
              <ButtonLink to={ownerAccount ? '/profile/mrstone' : '/profile'} variant="glass">View Profile</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function LaunchReadinessPanel({ configured, user, backendStatus }) {
  const snapshot = buildLaunchReadinessSnapshot({
    configured,
    user,
    backend: backendStatus,
    signals: getSignals(),
  })
  const readyCount = snapshot.filter(([, status]) => status === 'Active v1' || status === 'Cloud ready' || status === 'PWA ready').length

  return (
    <section className="launch-readiness-panel" aria-label="STATIC Social launch readiness">
      <div className="launch-readiness-panel__top">
        <LiveIndicator label="META-LEVEL INFRA" />
        <h2>Launch systems board.</h2>
        <p>This is the owner-only checklist for the infrastructure that separates a real social platform from a brochure: ranking, live, media, moderation, analytics, money, search, app install, messaging, and operations.</p>
        <strong>{readyCount}/{snapshot.length} systems active or cloud-ready</strong>
      </div>
      <div className="launch-readiness-panel__grid">
        {snapshot.map(([title, status, detail]) => (
          <article className={`is-${status.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} key={title}>
            <span>{status}</span>
            <h3>{title}</h3>
            <p>{detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function StaticWalletPanel({ walletState }) {
  const wallet = walletState.wallet || {}
  const balance = Number(wallet.balance || 0).toLocaleString()
  const lifetime = Number(wallet.lifetime_earned || 0).toLocaleString()

  return (
    <section className={`static-wallet-card ${walletState.ready ? 'is-ready' : ''}`} aria-label="Static Coin wallet">
      <div>
        <span>STATIC COINS</span>
        <strong>{walletState.loading ? '...' : balance}</strong>
        <p>{walletState.message}</p>
      </div>
      <div>
        <span>Lifetime earned</span>
        <b>{walletState.loading ? '...' : lifetime}</b>
      </div>
      {walletState.ledger?.length > 0 && (
        <ul>
          {walletState.ledger.slice(0, 3).map((entry) => (
            <li key={entry.id}>
              <span>{entry.reason?.replaceAll('_', ' ') || 'wallet event'}</span>
              <b>{entry.delta > 0 ? '+' : ''}{Number(entry.delta || 0).toLocaleString()}</b>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function OwnerStatsPanel({ stats, cloudSync }) {
  const ownerStats = [
    ['Public posts', stats.publicSignals],
    ['Local projects', stats.projects],
    ['Saved items', stats.savedCatalog],
    ['Follows', stats.follows],
    ['Cloud status', cloudSync?.status || 'local'],
    ['Signal level', '1T'],
  ]

  return (
    <section className="owner-stats-panel" aria-label="Mr. Stone owner stats">
      <div>
        <LiveIndicator label="MR. STONE / OWNER" />
        <h2>Founder control surface.</h2>
        <p>This is the private owner view for official posting, content drops, profile shaping, and site-level signal checks. Public users do not see this panel.</p>
      </div>
      <div>
        {ownerStats.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}

function radioTrackKind(track = {}) {
  const mime = String(track.media_asset?.mime_type || track.data?.mimeType || track.data?.fileType || '').toLowerCase()
  const mode = String(track.data?.mediaMode || track.data?.mediaKind || '').toLowerCase()
  const url = String(track.audio_url || track.media_asset?.public_url || track.data?.mediaUrl || '').toLowerCase()
  if (mode.includes('video') || mime.startsWith('video/') || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return 'Music video'
  return 'Audio'
}

function radioTrackUrl(track = {}) {
  return track.audio_url || track.media_asset?.public_url || track.data?.mediaUrl || ''
}

function OwnerRadioPanel({ radioAdmin, onRefresh, onReview }) {
  const queue = radioAdmin.queue || []
  const approved = radioAdmin.approved || []
  const schedule = radioAdmin.schedule || []
  const stats = radioAdmin.stats || {}

  return (
    <section className="owner-radio-panel" aria-label="STATIC Radio owner review">
      <div className="owner-radio-panel__top">
        <div>
          <LiveIndicator label="STATIC RADIO OPS" />
          <h2>Radio review and rotation.</h2>
          <p>Approve creator-owned songs and audio uploads into public STATIC Radio. Music videos belong to STATIC TV. Rejected tracks are blocked from rotation. Pending tracks stay private until reviewed.</p>
        </div>
        <button className="button button--glass" type="button" onClick={onRefresh} disabled={radioAdmin.loading}>{radioAdmin.loading ? 'Syncing...' : 'Refresh Queue'}</button>
      </div>
      <div className="owner-radio-panel__stats">
        <article><span>Needs review</span><strong>{stats.queue ?? queue.length}</strong></article>
        <article><span>Approved</span><strong>{stats.approved ?? approved.length}</strong></article>
        <article><span>In rotation</span><strong>{stats.scheduled ?? schedule.length}</strong></article>
      </div>
      <p className="form-status">{radioAdmin.message}</p>
      <div className="owner-radio-panel__columns">
        <div>
          <h3>Review queue</h3>
          {queue.length ? queue.slice(0, 8).map((track) => (
            <article className="owner-radio-track" key={track.id}>
              <div>
                <span>{radioTrackKind(track)} / {track.rights_status}</span>
                <h4>{track.title}</h4>
                <p>{track.artist || track.data?.artist || 'Unknown creator'} · {track.media_asset?.file_name || track.source_type}</p>
              </div>
              <div className="owner-radio-track__actions">
                {radioTrackUrl(track) && <a href={radioTrackUrl(track)} target="_blank" rel="noreferrer">Preview</a>}
                <button type="button" onClick={() => onReview(track.id, 'approve')} disabled={radioAdmin.loading}>Approve</button>
                <button type="button" onClick={() => onReview(track.id, 'reject')} disabled={radioAdmin.loading}>Reject</button>
              </div>
            </article>
          )) : <p className="owner-radio-panel__empty">No pending radio submissions.</p>}
        </div>
        <div>
          <h3>Public rotation</h3>
          {schedule.length ? schedule.slice(0, 10).map((item) => (
            <article className="owner-radio-track owner-radio-track--scheduled" key={item.id}>
              <div>
                <span>#{item.position} / {radioTrackKind(item.track || {})}</span>
                <h4>{item.track?.title || 'Scheduled track'}</h4>
                <p>{item.track?.artist || 'STATIC Creator'} · public approved</p>
              </div>
              <div className="owner-radio-track__actions">
                {radioTrackUrl(item.track) && <a href={radioTrackUrl(item.track)} target="_blank" rel="noreferrer">Open</a>}
                {item.track?.id && <button type="button" onClick={() => onReview(item.track.id, 'unschedule')} disabled={radioAdmin.loading}>Remove</button>}
              </div>
            </article>
          )) : (
            <>
              {approved.slice(0, 8).map((track) => (
                <article className="owner-radio-track owner-radio-track--approved" key={track.id}>
                  <div>
                    <span>{radioTrackKind(track)} / approved</span>
                    <h4>{track.title}</h4>
                    <p>{track.artist || 'STATIC Creator'} · ready for rotation</p>
                  </div>
                  <div className="owner-radio-track__actions">
                    <button type="button" onClick={() => onReview(track.id, 'schedule')} disabled={radioAdmin.loading}>Schedule</button>
                  </div>
                </article>
              ))}
              {!approved.length && <p className="owner-radio-panel__empty">Approve tracks to start the station rotation.</p>}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function BackendPhasePanel({ status, configured, user }) {
  const phaseReady = {
    social: Boolean(user && configured && status?.presence?.ready),
    interactions: Boolean(status?.signalEvents?.ready && status?.reactions?.ready && status?.savedItems?.ready),
    media: Boolean(status?.providerJobs?.ready),
    liveEconomy: Boolean(status?.liveRooms?.ready && status?.orders?.ready && status?.reports?.ready),
    worldSpine: Boolean(status?.platformLinks?.ready && status?.entityLoadouts?.ready && status?.companions?.ready && status?.companionSlots?.ready && status?.vehicleBuilds?.ready && status?.properties?.ready && status?.worldSessions?.ready),
    sportsArena: Boolean(status?.sportsEvents?.ready && status?.teamRosters?.ready && status?.arenaSessions?.ready),
  }
  const phases = [
    ['01', 'Social spine', 'Auth, profiles, presence, Entities, Channels, Signals, follows, saves.', phaseReady.social, phaseReady.social ? 'Presence online' : user ? 'Presence migration needed' : 'Sign in required'],
    ['02', 'Interaction layer', 'Signal ledger, reactions, comments, notifications, saved-item graph.', phaseReady.interactions, phaseReady.interactions ? 'Tables ready' : 'Run social_backbone.sql + signal_backbone.sql'],
    ['03', 'Media + provider cloud', 'Media metadata, processing jobs, generation job queue.', phaseReady.media, phaseReady.media ? 'Job shell ready' : 'Storage/job migration needed'],
    ['04', 'Live + economy gates', 'Live rooms, order intent, moderation reports, no fake payments.', phaseReady.liveEconomy, phaseReady.liveEconomy ? 'Gates ready' : 'Run migration before scale'],
    ['05', 'World spine', 'STATIC ID links, Entity loadouts, companions, vehicles, property/spawn, sessions.', phaseReady.worldSpine, phaseReady.worldSpine ? 'World tables ready' : 'Run static_id_world_spine.sql'],
    ['06', 'Sports / arena spine', 'Basketball events, arena sessions, creator teams, watch-party state.', phaseReady.sportsArena, phaseReady.sportsArena ? 'Arena tables ready' : 'Run static_id_world_spine.sql'],
  ]

  return (
    <section className="backend-phase-panel" aria-label="STATIC backend phase readiness">
      <div className="backend-phase-panel__intro">
        <LiveIndicator label={status?.ready ? 'BACKEND SPINE READY' : 'BACKEND SPINE CHECK'} />
        <h2>Six phases. One honest backend path.</h2>
        <p>{configured ? 'Supabase is configured. This board checks whether the social backbone migration exists and which platform gates can write real cloud records.' : 'Supabase is not configured in this environment, so these phases run in local preview mode.'}</p>
        {status?.error && <small>{status.error}</small>}
      </div>
      <div className="backend-phase-panel__grid">
        {phases.map(([code, title, copy, ready, detail]) => (
          <article className={ready ? 'is-ready' : ''} key={title}>
            <span>{code}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <b>{detail}</b>
          </article>
        ))}
      </div>
    </section>
  )
}

function DistrictOSPanel({ stats, entity, follows, onboarding, cloudSync, user }) {
  const steps = [
    {
      id: 'entity',
      label: 'Create the Entity',
      complete: stats.entities > 0 || Boolean(onboarding.entity),
      route: entity ? `/channels/${entity.handle.replace('@', '')}` : '/entities/create',
      action: entity ? 'Open Entity Channel' : 'Create Entity',
      detail: 'The public identity that owns the venue.',
    },
    {
      id: 'signal',
      label: 'Transmit the first Signal',
      complete: stats.publicSignals > 0 || Boolean(onboarding.signal),
      route: '/feed',
      action: 'Open Feed',
      detail: 'The first post that starts the network history.',
    },
    {
      id: 'follow',
      label: 'Follow one venue',
      complete: Object.keys(follows).length > 0 || Boolean(onboarding.follow),
      route: '/discover',
      action: 'Discover Venues',
      detail: 'The start of the social graph.',
    },
    {
      id: 'studio',
      label: 'Save a Studio or PLAY project',
      complete: stats.projects > 0 || stats.worlds > 0,
      route: '/studio',
      action: 'Open Studio',
      detail: 'The creator loop beyond posting.',
    },
    {
      id: 'cloud',
      label: 'Cloud-save the network',
      complete: Boolean(user && cloudSync?.status === 'synced'),
      route: user ? '/account' : '/login',
      action: user ? 'Sync Cloud' : 'Login',
      detail: 'The account layer that makes the network portable.',
    },
  ]
  const completeCount = steps.filter((step) => step.complete).length

  return (
    <div className="district-os-panel">
      <div className="district-os-panel__hero">
        <LiveIndicator label="CITY OS V1" />
        <h2>{completeCount === steps.length ? 'The first loop is alive.' : 'Build the first killer loop.'}</h2>
        <p>STATIC becomes dangerous when arrival turns into identity, identity turns into a Channel, the Channel transmits, people follow, creation compounds, and the city has a reason to remember you.</p>
      </div>
      <div className="district-os-panel__steps">
        {steps.map((step, index) => (
          <article className={step.complete ? 'is-complete' : ''} key={step.id}>
            <span>0{index + 1}</span>
            <div>
              <h3>{step.label}</h3>
              <p>{step.detail}</p>
            </div>
            <Link className="button button--glass" to={step.route}>{step.complete ? 'Review' : step.action}</Link>
          </article>
        ))}
      </div>
    </div>
  )
}

function AccountLoading() {
  return <section className="account-loading"><SignalMark animated /><LiveIndicator label="READING ACCOUNT" /><h1>Opening your profile.</h1></section>
}
