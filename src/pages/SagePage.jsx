import SageAssistantPanel from '../components/sage/SageAssistantPanel'
import { RouteSEO } from '../components/Router'
import { LiveIndicator } from '../components/UI'

export default function SagePage() {
  return (
    <>
      <RouteSEO path="/sage" title="S.A.G.E. | STATIC Network" description="Meet STATIC Network’s voice-ready 3D concierge, operator, guide, and creative copilot." />
      <section className="sage-page">
        <div className="broadcast-grid" />
        <div className="page-frame sage-page__intro">
          <LiveIndicator label="AI OPERATING LAYER ONLINE" />
          <span>SENTIENT AGENTIC GENERATIVE ENGINE</span>
          <h1>Talk to<br /><em>the network.</em></h1>
          <p>S.A.G.E. understands STATIC’s routes, tools, Entities, and workflows. She can guide, explain, navigate, prefill, and prepare actions while keeping sensitive decisions under your control.</p>
        </div>
        <div className="page-frame"><SageAssistantPanel expanded /></div>
      </section>
    </>
  )
}

