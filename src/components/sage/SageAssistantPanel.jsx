import { lazy, Suspense } from 'react'
import { useSage } from '../../context/SageContext'
import { stopSageVoice } from '../../lib/ai/sageVoice/sageVoiceProvider'
import SageActivityLog from './SageActivityLog'
import SageCommandBar from './SageCommandBar'
import SageWelcomeState from './SageWelcomeState'

const Sage3DViewport = lazy(() => import('../sage3d/Sage3DViewport'))

const suggestions = ['Create an Entity', 'Generate Mr Stone', 'Open my Studio', 'Explain Signals', 'Provider status', 'Take the tour']

export default function SageAssistantPanel({ expanded = false }) {
  const sage = useSage()
  if (!expanded && !sage.open) return null
  return (
    <aside className={`sage-panel ${expanded ? 'sage-panel--expanded' : ''}`} aria-label="S.A.G.E. assistant">
      <header>
        <div><i /><span>S.A.G.E.</span><small>SENTIENT AGENTIC GENERATIVE ENGINE</small></div>
        {!expanded && <button type="button" onClick={() => sage.setOpen(false)} aria-label="Close S.A.G.E.">×</button>}
      </header>
      <div className="sage-panel__identity">
        <Suspense fallback={<div className="sage-3d-loading">S.A.G.E.</div>}><Sage3DViewport compact gesture={sage.voiceState === 'speaking' ? 'talk' : 'idle'} /></Suspense>
        <div><span>{sage.voiceState.toUpperCase()} / BRITISH EXECUTIVE</span><h2>Your operating layer inside STATIC.</h2><SageWelcomeState user={sage.user} entity={sage.entity} /></div>
      </div>
      <div className="sage-transcript" aria-live="polite">
        {sage.messages.slice(-10).map((message, index) => <div className={`sage-message sage-message--${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'sage' ? 'S.A.G.E.' : 'YOU'}</span><p>{message.text}</p></div>)}
      </div>
      {sage.pending && <div className="sage-confirmation"><span>APPROVAL REQUIRED</span><p>{sage.pending.plan.response}</p><div><button type="button" onClick={sage.confirmPending}>Approve action</button><button type="button" onClick={sage.rejectPending}>Cancel</button></div></div>}
      <div className="sage-suggestions">{suggestions.map((item) => <button type="button" onClick={() => sage.runCommand(item)} key={item}>{item}</button>)}</div>
      <SageCommandBar onCommand={sage.runCommand} />
      <details className="sage-settings">
        <summary>Voice + privacy settings</summary>
        <label><input type="checkbox" checked={sage.voiceSettings.enabled} onChange={(event) => sage.updateVoiceSettings({ ...sage.voiceSettings, enabled: event.target.checked })} /> Enable Voice Mode</label>
        <label><input type="checkbox" checked={sage.voiceSettings.spokenResponses} onChange={(event) => sage.updateVoiceSettings({ ...sage.voiceSettings, spokenResponses: event.target.checked })} /> Spoken responses</label>
        <label><input type="checkbox" checked={sage.voiceSettings.muted} onChange={(event) => sage.updateVoiceSettings({ ...sage.voiceSettings, muted: event.target.checked })} /> Mute S.A.G.E.</label>
        <label><input type="checkbox" checked={sage.voiceSettings.wakePhraseEnabled} onChange={(event) => sage.updateVoiceSettings({ ...sage.voiceSettings, wakePhraseEnabled: event.target.checked })} /> “Hey S.A.G.E.” preference (framework ready)</label>
        <p>Push-to-talk is the active privacy-first mode. Wake phrase listening does not run continuously in this build.</p>
        <button type="button" onClick={stopSageVoice}>Stop speaking</button>
      </details>
      <SageActivityLog activity={sage.activity} />
    </aside>
  )
}
