import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { EntityCard } from '../components/EntitySystem'
import { StoredMedia } from '../components/AvatarSystem'
import { Link, RouteSEO, useRouter } from '../components/Router'
import { ArrowIcon, ButtonLink, LiveIndicator, SignalMark } from '../components/UI'
import { getCurrentEntity, getEntities, getLocalAccount, saveLocalAccount, saveMedia, subscribeToNetworkUpdates } from '../lib/staticStore'
import { importLocalEntityNetwork } from '../lib/storage/storageAdapter'
import { uploadCloudMedia } from '../lib/storage/supabaseStore'

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
    if (!configured) {
      setStatus('Account access is preparing for private beta. Local creator mode remains active.')
      return
    }
    setBusy(true)
    setStatus('')
    const form = new FormData(event.currentTarget)
    try {
      if (signup) {
        const result = await signUp({
          email: form.get('email'),
          password: form.get('password'),
          displayName: form.get('displayName'),
          username: form.get('username'),
          accountType: form.get('accountType'),
        })
        setStatus(result.session ? 'Account online. Opening your network.' : 'Check your email to confirm the account transmission.')
        if (result.session) window.setTimeout(() => navigate('/account'), 500)
      } else {
        await signIn(form.get('email'), form.get('password'))
        setStatus('Identity confirmed. Opening your network.')
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
      <section className="auth-page">
        <div className="broadcast-grid" />
        <div className="auth-page__visual">
          <div className="auth-orbit"><i /><i /><i /><SignalMark animated /></div>
          <LiveIndicator label={configured ? 'ACCOUNT UPLINK READY' : 'LOCAL MODE ACTIVE'} />
          <h1>{signup ? 'Create the operator.' : 'Re-enter the network.'}</h1>
          <p>{signup ? 'One account can own Entities, Channels, Signals, Worlds, Drops, and media across devices.' : 'Sign in to continue building the public identities behind your entertainment worlds.'}</p>
          <div><span>AUTHENTICATED OWNERSHIP</span><span>CROSS-DEVICE ACCESS</span><span>ENTITY CONTROL</span></div>
        </div>
        <form className="auth-panel" onSubmit={submit}>
          <header><span>STATIC ACCOUNT</span><LiveIndicator label={signup ? 'SIGNUP' : 'LOGIN'} /></header>
          <h2>{signup ? 'Initialize account' : 'Confirm identity'}</h2>
          {!configured && <div className="account-beta-note"><SignalMark /><p><b>PRIVATE BETA ACCESS</b> Cloud login activates after the owner connects the STATIC Supabase project. Every local Entity tool continues to work now.</p></div>}
          {signup && <>
            <label><span>DISPLAY NAME</span><input name="displayName" autoComplete="name" required /></label>
            <label><span>USERNAME</span><input name="username" autoComplete="username" required /></label>
            <label><span>ACCOUNT TYPE</span><select name="accountType">{accountTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          </>}
          <label><span>EMAIL</span><input name="email" type="email" autoComplete="email" required /></label>
          <label><span>PASSWORD</span><input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength="8" required /></label>
          <button className="button button--primary button--wide" type="submit" disabled={busy}>{busy ? 'Establishing uplink...' : signup ? 'Create Account' : 'Login'} <ArrowIcon /></button>
          <p className="form-status" role="status">{status}</p>
          <footer>{signup ? 'Already have account access?' : 'New to the operator network?'} <Link to={signup ? '/login' : '/signup'}>{signup ? 'Login' : 'Create account'}</Link></footer>
        </form>
      </section>
    </>
  )
}

export function AccountPage() {
  const { configured, user, profile, loading, signOut, updateProfile } = useAuth()
  const [entities, setEntities] = useState(() => getEntities())
  const [entity, setEntity] = useState(() => getCurrentEntity())
  const [status, setStatus] = useState('')
  const [importing, setImporting] = useState(false)
  const [localAccount, setLocalAccount] = useState(() => getLocalAccount() || {})

  useEffect(() => subscribeToNetworkUpdates(() => {
    setEntities(getEntities())
    setEntity(getCurrentEntity())
  }), [])

  async function saveProfile(event) {
    event.preventDefault()
    if (!user) {
      setStatus('Account sync becomes available after cloud access is connected.')
      return
    }
    const form = new FormData(event.currentTarget)
    if (!user) {
      const saved = saveLocalAccount({
        ...localAccount,
        displayName: form.get('displayName'),
        username: form.get('username'),
        accountType: form.get('accountType'),
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
              {user && entity && <button className="button button--primary" type="button" onClick={importLocal} disabled={importing}>{importing ? 'Importing network...' : 'Import Local Entity To Account'} <ArrowIcon /></button>}
              <p className="form-status">{status}</p>
            </div>
            <div className="account-quick-links">
              <ButtonLink to="/entities/create">Create Entity <ArrowIcon /></ButtonLink>
              <ButtonLink to="/studio" variant="glass">Open Studio</ButtonLink>
              <ButtonLink to="/feed" variant="glass">Open Feed</ButtonLink>
              <ButtonLink to={entity ? `/channels/${entity.handle.replace('@', '')}` : '/entities/create'} variant="glass">View Channel</ButtonLink>
            </div>
            <div className="owned-entities">
              <div className="section-row"><h2>Owned Entities</h2><span>{entities.length} LOCAL</span></div>
              {entities.length ? <div>{entities.map((item) => <EntityCard entity={item} key={item.id} />)}</div> : <div className="entity-empty"><SignalMark animated /><h3>No Entity initialized.</h3><ButtonLink to="/entities/create">Create The First Entity</ButtonLink></div>}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function AccountLoading() {
  return <section className="account-loading"><SignalMark animated /><LiveIndicator label="READING ACCOUNT SIGNAL" /><h1>Opening the operator network.</h1></section>
}
