import { useState } from 'react'
import { ArrowIcon } from './UI'

export function WaitlistForm({ compact = false }) {
  const [status, setStatus] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    // TODO: Connect to the approved waitlist provider when credentials and data policy are finalized.
    setStatus('Preview received locally. No information was transmitted or stored.')
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
        Preview form only. Submission is not connected to a database or email service.
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
    setStatus('Preview only. Please use the direct email address until contact routing is connected.')
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
