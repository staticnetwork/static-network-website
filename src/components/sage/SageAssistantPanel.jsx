import { useEffect, useState } from 'react'
import { StoredMedia } from '../AvatarSystem'
import { useSage } from '../../context/SageContext'
import { stopSageVoice } from '../../lib/ai/sageVoice/sageVoiceProvider'
import { getSageIdentity, subscribeToSageIdentity } from '../../lib/sageIdentity'
import SageActivityLog from './SageActivityLog'
import SageCommandBar from './SageCommandBar'
import SageWelcomeState from './SageWelcomeState'

const suggestions = ['Create an Entity', 'Generate Mr Stone', 'Open my Studio', 'Explain Signals', 'Provider status', 'Take the tour']

export default function SageAssistantPanel({ expanded = false }) {
  const sage = useSage()
  const [identity, setIdentity] = useState(getSageIdentity)
  useEffect(() => subscribeToSageIdentity(() => setIdentity(getSageIdentity())), [])
  if (!expanded && !sage.open) return null
  const panelAsset = identity.assets?.officialSagePanelImage || identity.assets?.officialSagePortrait
  return (
    <aside className={`sage-panel ${expanded ? 'sage-panel--expanded' : ''}`} aria-label="S.A.G.E. assistant">
      <header>
        <div><i /><span>S.A.G.E.</span><small>SENTIENT AGENTIC GENERATIVE ENGINE</small></div>
        {!expanded && <button type="button" onClick={() => sage.setOpen(false)} aria-label="Close S.A.G.E.">×</button>}
      </header>
      <div className="sage-panel__identity">
        {panelAsset
          ? <div className="sage-panel__identity-image">{panelAsset.mediaRef ? <StoredMedia mediaRef={panelAsset.mediaRef} alt="Official S.A.G.E." /> : <img src={panelAsset.publicUrl} alt="Official S.A.G.E." />}</div>
          : <div className="sage-panel__identity-mark"><span>S</span><i /></div>}
        <div><span>{sage.voiceConnected ? `${sage.voiceState.toUpperCase()} / ELEVENLABS CONNECTED` : 'TEXT ONLY / PREMIUM VOICE NOT CONNECTED'}</span><h2>Your operating layer inside STATIC.</h2><SageWelcomeState user={sage.user} entity={sage.entity} /></div>
      </div>
      <div className="sage-transcript" aria-live="polite">
        {sage.messages.slice(-10).map((message, index) => <div className={`sage-message sage-message--${message.role}`} key={`${message.role}-${index}`}><span>{message.role === 'sage' ? 'S.A.G.E.' : 'YOU'}</span><p>{message.text}</p></div>)}
      </div>
      {sage.pending && <div className="sage-confirmation"><span>APPROVAL REQUIRED</span><p>{sage.pending.plan.response}</p><div><button type="button" onClick={sage.confirmPending}>Approve action</button><button type="button" onClick={sage.rejectPending}>Cancel</button></div></div>}
      <div className="sage-suggestions">{suggestions.map((item) => <button type="button" onClick={() => sage.runCommand(item)} key={item}>{item}</button>)}</div>
      <SageCommandBar onCommand={sage.runCommand} />
      <details className="sage-settings">
        <summary>Voice + privacy settings</summary>
        <label><input type="checkbox" checked={sage.voiceSettings.enabled} disabled={!sage.voiceConnected} onChange={(event) => sage.updateVoiceSettings({ ...sage.voiceSettings, enabled: event.target.checked })} /> Enable connected ElevenLabs voice</label>
        <label><input type="checkbox" checked={sage.voiceSettings.spokenResponses} disabled={!sage.voiceConnected} onChange={(event) => sage.updateVoiceSettings({ ...sage.voiceSettings, spokenResponses: event.target.checked })} /> Spoken responses may use provider credits</label>
        <label><input type="checkbox" checked={sage.voiceSettings.muted} onChange={(event) => sage.updateVoiceSettings({ ...sage.voiceSettings, muted: event.target.checked })} /> Mute S.A.G.E.</label>
        <label><input type="checkbox" checked={sage.voiceSettings.wakePhraseEnabled} onChange={(event) => sage.updateVoiceSettings({ ...sage.voiceSettings, wakePhraseEnabled: event.target.checked })} /> “Hey S.A.G.E.” preference (framework ready)</label>
        <p>{sage.voiceConnected ? 'ElevenLabs is connected. Spoken responses are opt-in because they may use provider credits.' : 'Premium voice is blocked by ElevenLabs activation. Browser speech is intentionally not used as S.A.G.E.’s public voice.'} Push-to-talk input remains privacy-first; wake phrase listening does not run continuously.</p>
        <button type="button" onClick={stopSageVoice}>Stop speaking</button>
      </details>
      <SageActivityLog activity={sage.activity} />
    </aside>
  )
}
