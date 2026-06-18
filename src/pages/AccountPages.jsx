import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { EntityCard } from '../components/EntitySystem'
import { StoredMedia } from '../components/AvatarSystem'
import { Link, RouteSEO, useRouter } from '../components/Router'
import { ArrowIcon, ButtonLink, LiveIndicator, SignalMark } from '../components/UI'
import {
  getCurrentEntity,
  getEntities,
  getFollows,
  getLocalAccount,
  getNetworkStats,
  getOnboardingProgress,
  saveLocalAccount,
  saveMedia,
  setCurrentEntity,
  subscribeToNetworkUpdates,
} from '../lib/staticStore'
import { importLocalEntityNetwork } from '../lib/storage/storageAdapter'
import { getCloudBackboneStatus, uploadCloudMedia } from '../lib/storage/supabaseStore'

const accountTypes = ['Fan', 'Creator', 'Studio', 'Entity Operator']

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
        saveLocalAccount({
          displayName: form.get('displayName'),
          username: form.get('username'),
          accountType: form.get('accountType'),
          email: form.get('email'),
          mode: 'local',
          createdAt: new Date().toISOString(),
        })
        setStatus('Local operator profile created on this device. Cloud sync can be connected later.')
        window.setTimeout(() => navigate('/account'), 450)
      } else {
        setStatus('Cloud login is not connected yet. Opening local operator mode instead.')
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
        setStatus(result.session ? 'Account online. Opening your district workspace.' : 'Check your email to confirm the account request.')
        if (result.session) window.setTimeout(() => navigate('/account'), 500)
      } else {
        await signIn(form.get('email'), form.get('password'))
        setStatus('Identity confirmed. Opening your district workspace.')
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
          <LiveIndicator label={configured ? 'OPERATOR PASS READY' : 'CONTROLLED ACCESS'} />
          <h1>{signup ? 'Request the operator pass.' : 'Operator entrance console.'}</h1>
          <p>{signup ? 'Approved operators will own Entities, Channels, Signals, Worlds, Drops, and media across STATIC.' : 'Enter with an approved pass to continue building the identities and worlds behind the district.'}</p>
          <div><span>IDENTITY LOCK</span><span>VENUE OWNERSHIP</span><span>ENTITY CONTROL</span></div>
        </div>
        <form className="auth-panel portal-auth-panel" onSubmit={submit}>
          <header><span>STATIC ACCOUNT</span><LiveIndicator label={signup ? 'SIGNUP' : 'LOGIN'} /></header>
          <h2>{signup ? 'Request operator identity' : 'Confirm operator identity'}</h2>
          {!configured && <div className="account-beta-note"><SignalMark /><p><b>LOCAL OPERATOR MODE</b> This creates a device-local STATIC profile. It is not production auth and does not sync until the approved backend is connected.</p></div>}
          {signup && <>
            <label><span>DISPLAY NAME</span><input name="displayName" autoComplete="name" required /></label>
            <label><span>USERNAME</span><input name="username" autoComplete="username" required /></label>
            <label><span>ACCOUNT TYPE</span><select name="accountType">{accountTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          </>}
          <label><span>EMAIL</span><input name="email" type="email" autoComplete="email" required /></label>
          <label><span>PASSWORD</span><input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength="8" required /></label>
          <button className="button button--primary button--wide" type="submit" disabled={busy}>{busy ? 'Checking pass...' : signup ? 'Request Operator Pass' : 'Open Operator Entrance'} <ArrowIcon /></button>
          <p className="form-status" role="status">{status}</p>
          <footer>{signup ? 'Already have account access?' : 'New to the operator district?'} <Link to={signup ? '/login' : '/signup'}>{signup ? 'Login' : 'Create account'}</Link></footer>
        </form>
      </section>
    </>
  )
}

export function AccountPage() {
  const { configured, user, profile, loading, signOut, updateProfile, cloudSync, syncNow } = useAuth()
  const [entities, setEntities] = useState(() => getEntities())
  const [entity, setEntity] = useState(() => getCurrentEntity())
  const [status, setStatus] = useState('')
  const [importing, setImporting] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [localAccount, setLocalAccount] = useState(() => getLocalAccount() || {})
  const [stats, setStats] = useState(() => getNetworkStats())
  const [follows, setFollows] = useState(() => getFollows())
  const [onboarding, setOnboarding] = useState(() => getOnboardingProgress())
  const [backboneStatus, setBackboneStatus] = useState(() => ({ ready: false, mode: configured ? 'checking' : 'local-only' }))

  useEffect(() => subscribeToNetworkUpdates(() => {
    setEntities(getEntities())
    setEntity(getCurrentEntity())
    setStats(getNetworkStats())
    setFollows(getFollows())
    setOnboarding(getOnboardingProgress())
  }), [])

  useEffect(() => {
    let active = true
    if (!configured || !user) {
      setBackboneStatus({ ready: false, mode: configured ? 'signed-out' : 'local-only' })
      return () => {
        active = false
      }
    }
    setBackboneStatus((current) => ({ ...current, mode: 'checking' }))
    getCloudBackboneStatus(user.id)
      .then((result) => {
        if (active) setBackboneStatus(result)
      })
      .catch((error) => {
        if (active) setBackboneStatus({ ready: false, mode: 'error', error: error.message })
      })
    return () => {
      active = false
    }
  }, [cloudSync?.lastSyncedAt, configured, user])

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
        mode: 'local',
        updatedAt: new Date().toISOString(),
      })
      setLocalAccount(saved)
      setStatus('Local operator profile updated.')
      return
    }
    try {
      await updateProfile({
        displayName: form.get('displayName'),
        username: form.get('username'),
        accountType: form.get('accountType'),
        avatarUrl: profile?.avatar_url,
      })
      setStatus('Account profile updated.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function uploadProfileImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setStatus('Storing profile image...')
    try {
      if (user && configured) {
        const uploaded = await uploadCloudMedia({ bucket: 'avatars', ownerId: user.id, file })
        await updateProfile({
          displayName: profile?.display_name,
          username: profile?.username,
          accountType: profile?.account_type,
          avatarUrl: uploaded.publicUrl,
        })
        setStatus('Cloud profile image updated.')
      } else {
        const media = await saveMedia(file, { type: 'account-avatar' })
        const saved = saveLocalAccount({ ...localAccount, avatarRef: media.id })
        setLocalAccount(saved)
        setStatus('Local profile image updated.')
      }
    } catch (error) {
      setStatus(error.message || 'The profile image could not be stored.')
    }
  }

  async function importLocal() {
    setImporting(true)
    setStatus('')
    try {
      const result = await importLocalEntityNetwork(user)
      setStatus(`${result.importedEntities} local Entity${result.importedEntities === 1 ? '' : 'ies'} imported to the account.`)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setImporting(false)
    }
  }

  async function manualCloudSync() {
    setSyncing(true)
    setStatus('')
    try {
      const result = await syncNow('manual')
      if (result) {
        setStatus(`Cloud saved: ${result.importedEntities} Entities, ${result.syncedProjects} projects, ${result.syncedMarketplaceActions} marketplace actions, ${result.syncedFollows || 0} follows, and ${result.syncedReminders} reminders.`)
      } else {
        setStatus('Sign in to cloud access before syncing this device.')
      }
    } catch (error) {
      setStatus(error.message || 'Cloud sync could not finish.')
    } finally {
      setSyncing(false)
    }
  }

  function makeActive(entityId) {
    setCurrentEntity(entityId)
    const next = getCurrentEntity()
    setEntity(next)
    setStatus(`${next?.name || 'Entity'} is now the active operator identity.`)
  }

  if (loading) return <AccountLoading />

  return (
    <>
      <RouteSEO path="/account" />
      <section className="account-hero">
        <div className="broadcast-grid" />
        <div className="page-frame">
          <LiveIndicator label={user ? 'ACCOUNT ONLINE' : configured ? 'LOGIN REQUIRED' : 'LOCAL OPERATOR MODE'} />
          <h1>{profile?.display_name || localAccount.displayName || user?.email?.split('@')[0] || 'Network Operator'}</h1>
          <p>{user ? 'Your authenticated control layer for Entities, Channels, media, and account ownership.' : 'Local creator mode is active on this device. Connect account access to synchronize across phone and computer.'}</p>
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
            <header><span>OPERATOR PROFILE</span><span>{user ? 'CLOUD' : 'LOCAL'}</span></header>
            <div className="account-avatar">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : localAccount.avatarRef ? <StoredMedia mediaRef={localAccount.avatarRef} alt="" /> : profile?.display_name?.slice(0, 2).toUpperCase() || localAccount.displayName?.slice(0, 2).toUpperCase() || 'OP'}
              <SignalMark animated />
            </div>
            <label className="account-avatar-upload"><span>PROFILE IMAGE</span><input type="file" accept="image/*" onChange={uploadProfileImage} /></label>
            <label><span>DISPLAY NAME</span><input name="displayName" defaultValue={profile?.display_name || localAccount.displayName || ''} /></label>
            <label><span>USERNAME</span><input name="username" defaultValue={profile?.username || localAccount.username || ''} /></label>
            <label><span>EMAIL</span><input value={user?.email || 'Account access not connected'} readOnly /></label>
            <label><span>ACCOUNT TYPE</span><select name="accountType" defaultValue={profile?.account_type || localAccount.accountType || 'Entity Operator'}>{accountTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
            <button className="button button--primary button--wide" type="submit">Save Account</button>
          </form>
          <div className="account-network">
            <div className="account-mode-card">
              <div><LiveIndicator label={user ? 'CLOUD ACCOUNT' : 'LOCAL CREATOR MODE'} /><span>{configured ? 'SUPABASE CONFIGURED' : 'CLOUD SETUP PENDING'}</span></div>
              <h2>{user ? 'Your network can travel.' : 'Build now. Synchronize when ready.'}</h2>
              <p>{user ? 'This account is ready for cloud-owned Entities after import.' : 'All current Entity tools store data on this device. Cloud mode activates when Supabase is configured and you sign in.'}</p>
              <div className={`cloud-sync-panel cloud-sync-panel--${cloudSync?.status || 'local-only'}`}>
                <span>CLOUD SYNC</span>
                <strong>{cloudSync?.status === 'synced' ? 'Cloud saved' : cloudSync?.status === 'syncing' ? 'Syncing now' : cloudSync?.status === 'queued' ? 'Save queued' : cloudSync?.status === 'error' ? 'Needs attention' : user ? 'Ready' : 'Sign in required'}</strong>
                <p>{cloudSync?.message || 'Cloud sync status will appear here.'}</p>
                {cloudSync?.lastSyncedAt && <small>Last sync: {new Date(cloudSync.lastSyncedAt).toLocaleString()}</small>}
                <button className="button button--glass" type="button" onClick={manualCloudSync} disabled={!user || syncing || cloudSync?.status === 'syncing'}>
                  {syncing || cloudSync?.status === 'syncing' ? 'Syncing...' : 'Sync Device To Cloud'}
                </button>
              </div>
              {user && entity && <button className="button button--primary" type="button" onClick={importLocal} disabled={importing}>{importing ? 'Importing network...' : 'Import Local Entity To Account'} <ArrowIcon /></button>}
              <p className="form-status">{status}</p>
            </div>
            <div className="account-stats-grid">
              {[
                ['Entities', stats.entities],
                ['Signals', stats.publicSignals],
                ['Projects', stats.projects],
                ['Worlds', stats.worlds],
                ['Drops', stats.drops],
                ['Follows', stats.follows],
                ['Reminders', stats.reminders],
              ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
            </div>
            <BackendPhasePanel status={backboneStatus} configured={configured} user={user} />
            <DistrictOSPanel stats={stats} entity={entity} follows={follows} onboarding={onboarding} cloudSync={cloudSync} user={user} />
            <div className="account-quick-links">
              <ButtonLink to="/entities/create">Create Entity <ArrowIcon /></ButtonLink>
              <ButtonLink to="/studio" variant="glass">Open Studio</ButtonLink>
              <ButtonLink to="/feed" variant="glass">Open Feed</ButtonLink>
              <ButtonLink to={entity ? `/channels/${entity.handle.replace('@', '')}` : '/entities/create'} variant="glass">View Channel</ButtonLink>
            </div>
            <div className="owned-entities">
              <div className="section-row"><h2>Owned Entities</h2><span>{entities.length} LOCAL</span></div>
              {entities.length ? <div className="owned-entities__list">{entities.map((item) => (
                <div className={entity?.id === item.id ? 'owned-entity-row is-active' : 'owned-entity-row'} key={item.id}>
                  <EntityCard entity={item} />
                  <button className="button button--glass" type="button" onClick={() => makeActive(item.id)}>{entity?.id === item.id ? 'Active Entity' : 'Set Active'}</button>
                </div>
              ))}</div> : <div className="entity-empty"><SignalMark animated /><h3>No Entity initialized.</h3><ButtonLink to="/entities/create">Create The First Entity</ButtonLink></div>}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function BackendPhasePanel({ status, configured, user }) {
  const phaseReady = {
    social: Boolean(user && configured),
    interactions: Boolean(status?.reactions?.ready && status?.savedItems?.ready),
    media: Boolean(status?.providerJobs?.ready),
    liveEconomy: Boolean(status?.liveRooms?.ready && status?.orders?.ready && status?.reports?.ready),
  }
  const phases = [
    ['01', 'Social spine', 'Auth, profiles, Entities, Channels, Signals, follows, saves.', phaseReady.social, user ? 'Account online' : 'Sign in required'],
    ['02', 'Interaction layer', 'Reactions, comments, notifications, saved-item graph.', phaseReady.interactions, phaseReady.interactions ? 'Tables ready' : 'Run social_backbone.sql'],
    ['03', 'Media + provider cloud', 'Media metadata, processing jobs, generation job queue.', phaseReady.media, phaseReady.media ? 'Job shell ready' : 'Storage/job migration needed'],
    ['04', 'Live + economy gates', 'Live rooms, order intent, moderation reports, no fake payments.', phaseReady.liveEconomy, phaseReady.liveEconomy ? 'Gates ready' : 'Run migration before scale'],
  ]

  return (
    <section className="backend-phase-panel" aria-label="STATIC backend phase readiness">
      <div className="backend-phase-panel__intro">
        <LiveIndicator label={status?.ready ? 'BACKEND SPINE READY' : 'BACKEND SPINE CHECK'} />
        <h2>Four phases. One honest backend path.</h2>
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
        <LiveIndicator label="DISTRICT OS V1" />
        <h2>{completeCount === steps.length ? 'The first loop is alive.' : 'Build the first killer loop.'}</h2>
        <p>STATIC becomes dangerous when arrival turns into identity, identity turns into a Channel, the Channel transmits, people follow, and creation keeps compounding.</p>
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
  return <section className="account-loading"><SignalMark animated /><LiveIndicator label="READING ACCOUNT SIGNAL" /><h1>Opening the operator network.</h1></section>
}
