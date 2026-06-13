import { useSage } from '../../context/SageContext'

export default function SagePersistentLauncher() {
  const sage = useSage()
  return (
    <button className={`sage-launcher ${sage.open ? 'is-open' : ''}`} type="button" onClick={() => sage.setOpen(!sage.open)} aria-label="Open S.A.G.E. assistant">
      <span><i /><i /><i /></span>
      <div><strong>S.A.G.E.</strong><small>{sage.voiceState === 'listening' ? 'LISTENING' : 'ONLINE / ASK ANYTHING'}</small></div>
    </button>
  )
}

