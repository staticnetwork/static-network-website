import SageAssistantPanel from '../components/sage/SageAssistantPanel'
import { RouteSEO } from '../components/Router'
import { ButtonLink, LiveIndicator } from '../components/UI'

export default function SagePage() {
  return (
    <>
      <RouteSEO path="/sage" title="S.A.G.E. | STATIC Network" description="Meet STATIC Network’s provider-aware concierge, operator, guide, and creative copilot." />
      <section className="sage-page">
        <div className="broadcast-grid" />
        <div className="page-frame sage-page__intro">
          <LiveIndicator label="AI OPERATING LAYER" />
          <span>SENTIENT AGENTIC GENERATIVE ENGINE</span>
          <h1>Talk to<br /><em>the network.</em></h1>
          <p>S.A.G.E. understands STATIC’s routes, tools, Entities, and workflows. Text guidance works now. Premium speech is available only when ElevenLabs is connected, and visual presence is official only after owner-approved assets exist.</p>
          <div className="sage-page__actions"><ButtonLink to="/sage-identity">Open Identity Workspace</ButtonLink><ButtonLink to="/sage-lab" variant="glass">Open Talking Lab</ButtonLink></div>
        </div>
        <div className="page-frame"><SageAssistantPanel expanded /></div>
      </section>
    </>
  )
}
