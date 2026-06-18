import { useEffect, useRef, useState } from 'react'
import { useSage } from '../../context/SageContext'
import { useStoredMedia } from '../AvatarSystem'
import { useRouter } from '../Router'
import { getSageIdentity, subscribeToSageIdentity } from '../../lib/sageIdentity'

export default function SageArrivalExperience() {
  const sage = useSage()
  const { navigate } = useRouter()
  const [identity, setIdentity] = useState(getSageIdentity)
  const [phase, setPhase] = useState('boot')
  const [muted, setMuted] = useState(true)
  const [collapseOnEnd, setCollapseOnEnd] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const videoRef = useRef(null)
  const arrivalVideo = identity.assets?.officialSageArrivalVideo
    || identity.assets?.officialSageTourVideo
  const idleVideo = identity.assets?.officialSageIdleLoopVideo
  const storedArrivalUrl = useStoredMedia(arrivalVideo?.mediaRef)
  const storedIdleUrl = useStoredMedia(idleVideo?.mediaRef)
  const arrivalVideoUrl = storedArrivalUrl || arrivalVideo?.publicUrl || ''
  const idleVideoUrl = storedIdleUrl || idleVideo?.publicUrl || ''
  const videoUrl = videoFailed
    ? ''
    : phase === 'present' && idleVideoUrl
      ? idleVideoUrl
      : arrivalVideoUrl
  const still = identity.assets?.officialSageWelcomePose
    || identity.assets?.officialSageTourStill
    || identity.assets?.officialSageFullBody
    || identity.assets?.officialSageIdleStill

  useEffect(() => {
    return subscribeToSageIdentity(() => setIdentity(getSageIdentity()))
  }, [])

  useEffect(() => {
    if (!sage.showIntro) return undefined
    setPhase('boot')
    setMuted(true)
    setCollapseOnEnd(false)
    setVideoFailed(false)
    const materialize = window.setTimeout(() => setPhase('materialize'), 260)
    const present = !arrivalVideoUrl
      ? window.setTimeout(() => setPhase('present'), 1500)
      : null
    return () => {
      clearTimeout(materialize)
      if (present) clearTimeout(present)
    }
  }, [arrivalVideoUrl, sage.showIntro])

  if (!sage.showIntro) return null

  function leave(action) {
    setPhase('collapse')
    window.setTimeout(action, 720)
  }

  function askSage() {
    leave(() => {
      sage.dismissIntro()
      sage.setOpen(true)
    })
  }

  function finishPlayback() {
    if (collapseOnEnd) {
      leave(sage.dismissIntro)
      return
    }
    setPhase('present')
  }

  async function toggleSound() {
    const nextMuted = !muted
    setMuted(nextMuted)
    if (videoRef.current) {
      videoRef.current.muted = nextMuted
      if (!nextMuted) {
        setCollapseOnEnd(true)
        videoRef.current.currentTime = 0
        await videoRef.current.play().catch(() => {})
      }
    }
  }

  return (
    <section className={`sage-arrival sage-arrival--${phase} ${videoUrl ? 'sage-arrival--video' : ''}`} aria-label="Welcome to STATIC Network">
      <div className="sage-arrival__noise" />
      <div className="sage-arrival__stage">
        <div className="sage-arrival__platform"><i /><i /><i /></div>
        <div className={`sage-arrival__presence ${videoUrl ? 'has-video' : 'has-still'}`}>
          {videoUrl
            ? <video key={videoUrl} ref={videoRef} src={videoUrl} poster={still?.publicUrl} preload="metadata" autoPlay muted={muted} playsInline loop={phase === 'present' && Boolean(idleVideoUrl)} onEnded={finishPlayback} onError={() => setVideoFailed(true)} />
            : still?.publicUrl
              ? <img src={still.publicUrl} alt="S.A.G.E. standing on the STATIC arrival platform" />
              : <div className="sage-arrival__pending">S.A.G.E.</div>}
        </div>
        <div className="sage-arrival__beam" />
        <div className="sage-arrival__telemetry"><span>HOLOGRAPHIC CONCIERGE</span><small>{arrivalVideoUrl ? 'APPROVED ARRIVAL PERFORMANCE' : 'CHOREOGRAPHY SHELL / FINAL PERFORMANCE PENDING'}</small></div>
      </div>
      <div className="sage-arrival__copy">
        <span>STATIC NETWORK // CONCIERGE ONLINE</span>
        <h1>Welcome to<br /><em>the future.</em></h1>
        <p>Hey, nice to meet you. I’m <strong>S.A.G.E.</strong>, the Sentient Agentic Generative Engine. I can show you around, explain the network, or take you directly where you need to go.</p>
        <p className="sage-arrival__aside">When we’re done, I’ll be waiting in the corner. Tap my signal and I’ll step back onto the network.</p>
        <div>
          <button className="button button--primary" type="button" onClick={() => leave(sage.startTour)}>Take the Tour</button>
          <button className="button button--glass" type="button" onClick={askSage}>Ask S.A.G.E.</button>
          <button className="button button--glass" type="button" onClick={() => leave(() => { sage.dismissIntro(); navigate(sage.user ? '/account' : '/login') })}>Log In / Sign Up</button>
          <button className="button button--glass" type="button" onClick={() => leave(() => { sage.dismissIntro(); navigate('/') })}>Enter STATIC</button>
          {arrivalVideoUrl && !videoFailed && <button className="sage-arrival__skip" type="button" onClick={toggleSound}>{muted ? 'Play S.A.G.E. Welcome With Sound' : 'Mute Introduction'}</button>}
        </div>
      </div>
      <div className="sage-arrival__status"><i /><span>LANDING: S.A.G.E. ONLINE</span><span>VOICE: APPROVED MEDIA ONLY</span><span>ASSISTANT: CORNER SIGNAL READY</span></div>
    </section>
  )
}
