import { useState } from 'react'
import { saveBetaRequest } from '../lib/betaRequests'
import { ArrowIcon } from './UI'

export function BetaRequestForm() {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    setBusy(true)
    setStatus('')
    const form = new FormData(formElement)
    const result = await saveBetaRequest({
      name: form.get('name'),
      email: form.get('email'),
      creatorType: form.get('creatorType'),
      buildGoal: form.get('buildGoal'),
      socialLink: form.get('socialLink'),
    })
    setBusy(false)
    if (!result.localSaved && !result.cloudSaved) {
      setStatus('The access request could not be completed. Use the direct STATIC contact channel.')
      return
    }
    setStatus('Access request received. Watch your inbox.')
    formElement.reset()
  }

  return (
    <form className="beta-request-form portal-access-terminal" onSubmit={handleSubmit}>
      <div className="form-header"><span>ARRIVAL CLEARANCE</span><span>DISTRICT//001</span></div>
      <div className="field-grid">
        <label><span>Name</span><input name="name" autoComplete="name" required /></label>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
      </div>
      <label><span>Creator type</span><select name="creatorType" defaultValue="creator" required><option value="creator">Creator / Artist</option><option value="studio">Studio / Production Team</option><option value="developer">Developer / AI Builder</option><option value="brand">Brand / Partner</option><option value="fan">Fan / Early Explorer</option><option value="other">Other</option></select></label>
      <label><span>What are you building?</span><textarea name="buildGoal" rows="5" required placeholder="Describe the Entity, venue, channel, studio, game, or world you want to bring into STATIC." /></label>
      <label><span>Social or portfolio link <em>Optional</em></span><input name="socialLink" type="url" placeholder="https://" /></label>
      <button className="button button--signal button--wide" type="submit" disabled={busy}>{busy ? 'Sending Request...' : 'Request Access'} <ArrowIcon /></button>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
    </form>
  )
}

export function WaitlistForm({ compact = false }) {
  const [status, setStatus] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const entry = {
      name: form.get('name'),
      email: form.get('email'),
      role: form.get('role'),
      message: form.get('message'),
      receivedAt: new Date().toISOString(),
    }

    try {
      const existing = JSON.parse(window.localStorage.getItem('static-access-list') || '[]')
      window.localStorage.setItem('static-access-list', JSON.stringify([...existing, entry].slice(-20)))
    } catch {
      // Local storage can be unavailable in private or restricted browsing modes.
    }

    // TODO: Connect to the approved waitlist provider when credentials and data policy are finalized.
    setStatus('Request received. You’re on the access list.')
    event.currentTarget.reset()
  }

  return (
    <form className={`waitlist-form ${compact ? 'waitlist-form--compact' : ''}`} onSubmit={handleSubmit}>
      <div className="form-header">
        <span>DISTRICT ACCESS</span>
        <span>PASS//001</span>
      </div>
      <div className="field-grid">
        <label>
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" placeholder="Your name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" placeholder="you@email.com" required />
        </label>
      </div>
      <fieldset>
        <legend>I am entering as</legend>
        <div className="role-options">
          {['Creator', 'Fan', 'Studio', 'Partner'].map((role) => (
            <label key={role}>
              <input type="radio" name="role" value={role.toLowerCase()} required />
              <span>{role}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="form-message">
        <span>What do you want to build or discover?</span>
        <textarea name="message" rows="3" placeholder="Optional transmission..." />
      </label>
      <button className="button button--signal button--wide" type="submit">
        Request Access <ArrowIcon />
      </button>
      <p className="form-disclaimer">
        Private beta requests are staged here until the production access system is connected.
      </p>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
    </form>
  )
}

export function ContactForm() {
  const [status, setStatus] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    // TODO: Route approved contact categories to a production support or CRM provider.
    setStatus('Message staged. Use the direct STATIC email for fastest response.')
  }

  return (
    <form className="waitlist-form contact-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <span>DIRECT MESSAGE</span>
        <span>CONTACT//001</span>
      </div>
      <div className="field-grid">
        <label>
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label>
        <span>Department</span>
        <select name="department" defaultValue="creator">
          <option value="creator">Creator access</option>
          <option value="studio">Studio partnership</option>
          <option value="press">Press</option>
          <option value="business">Business</option>
          <option value="general">General</option>
        </select>
      </label>
      <label className="form-message">
        <span>Message</span>
        <textarea name="message" rows="6" required />
      </label>
      <button className="button button--signal button--wide" type="submit">
        Prepare Transmission <ArrowIcon />
      </button>
      <p className="form-status" role="status" aria-live="polite">{status}</p>
    </form>
  )
}
