import { useEffect, useRef, useState } from 'react'
import { useSage } from '../../context/SageContext'
import { useRouter } from '../Router'
import SageHologramIntro from './SageHologramIntro'

export default function SageArrivalExperience() {
  const sage = useSage()
  const { navigate } = useRouter()
  const [gesture, setGesture] = useState('arrival')
  const spoken = useRef(false)

  useEffect(() => {
    if (!sage.showIntro || sage.path !== '/' || spoken.current) return undefined
    const greeting = window.setTimeout(() => {
      spoken.current = true
      sage.say(sage.welcome)
    }, 1800)
    const point = window.setTimeout(() => setGesture('point'), 5200)
    return () => {
      clearTimeout(greeting)
      clearTimeout(point)
    }
  }, [sage])

  if (!sage.showIntro || sage.path !== '/') return null
  return (
    <section className="sage-arrival" aria-label="Welcome to STATIC Network">
      <div className="sage-arrival__noise" />
      <SageHologramIntro gesture={gesture} />
      <div className="sage-arrival__copy">
        <span>STATIC NETWORK // CONCIERGE ONLINE</span>
        <h1>Welcome to<br /><em>the future.</em></h1>
        <p>Hey, nice to meet you. I’m <strong>S.A.G.E.</strong>, the Sentient Agentic Generative Engine, and this is the home of AI entertainment.</p>
        <div>
          <button className="button button--primary" type="button" onClick={sage.startTour}>Take the Tour</button>
          <button className="button button--glass" type="button" onClick={() => { sage.dismissIntro(); navigate(sage.user ? '/account' : '/login') }}>Log In / Sign Up</button>
          <button className="button button--glass" type="button" onClick={sage.dismissIntro}>Enter STATIC</button>
          <button className="sage-arrival__skip" type="button" onClick={sage.dismissIntro}>Skip Intro</button>
        </div>
      </div>
      <div className="sage-arrival__status"><i /><span>VOICE: BRITISH EXECUTIVE</span><span>3D HOLOGRAM: ACTIVE</span><span>FINAL GLB MODEL: PENDING</span></div>
    </section>
  )
}

