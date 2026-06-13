import { useState } from 'react'
import { ArrowIcon } from './UI'

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
    setStatus('Transmission received. You’re on the access list.')
    event.currentTarget.reset()
  }

  return (
    <form className={`waitlist-form ${compact ? 'waitlist-form--compact' : ''}`} onSubmit={handleSubmit}>
      <div className="form-header">
        <span>ACCESS REQUEST</span>
        <span>FORM//001</span>
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
        Your access request is saved to this browser for the network demonstration.
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
    setStatus('Transmission prepared. Use the direct network email for immediate delivery.')
  }

  return (
    <form className="waitlist-form contact-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <span>DIRECT TRANSMISSION</span>
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
