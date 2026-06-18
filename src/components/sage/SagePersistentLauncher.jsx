import { useEffect, useState } from 'react'
import { StoredMedia } from '../AvatarSystem'
import { useSage } from '../../context/SageContext'
import { getSageIdentity, subscribeToSageIdentity } from '../../lib/sageIdentity'

export default function SagePersistentLauncher() {
  const sage = useSage()
  const [identity, setIdentity] = useState(getSageIdentity)
  useEffect(() => subscribeToSageIdentity(() => setIdentity(getSageIdentity())), [])
  const launcherAsset = identity.assets?.officialSageLauncherImage
    || identity.assets?.officialSagePortrait
    || identity.assets?.officialSageIdleStill
  if (sage.showIntro || sage.path === '/') return null
  return (
    <button className={`sage-launcher ${sage.open ? 'is-open' : ''}`} type="button" onClick={sage.summonIntro} aria-label="Summon S.A.G.E.">
      {launcherAsset
        ? <span className="sage-launcher__image">{launcherAsset.mediaRef ? <StoredMedia mediaRef={launcherAsset.mediaRef} alt="" /> : <img src={launcherAsset.publicUrl} alt="" />}</span>
        : <span><i /><i /><i /></span>}
      <div><strong>S.A.G.E.</strong><small>{sage.voiceConnected ? `${sage.voiceState.toUpperCase()} / ELEVENLABS` : 'TEXT ONLY / VOICE BLOCKED'}</small></div>
    </button>
  )
}
