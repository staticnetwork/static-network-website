/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from '../components/Router'
import { planSageAction } from '../components/sage/SageActionRouter'
import { getSageIntroPreferences, saveSageIntroPreferences } from '../components/sage/SageIntroPreferences'
import { parseSageIntent } from '../components/sage/SageIntentParser'
import { useAuth } from './AuthContext'
import { mrStonePreset } from '../lib/entityEngine/entityDefaults'
import { getCurrentEntity, getEntities, setCurrentEntity, subscribeToNetworkUpdates } from '../lib/staticStore'
import { speakAsSage, stopSageVoice } from '../lib/ai/sageVoice/sageVoiceProvider'
import { getSageVoiceSettings, saveSageVoiceSettings } from '../lib/ai/sageVoice/sageVoiceSettings'

const SageContext = createContext(null)

const welcome = 'Hey, nice to meet you. I’m S.A.G.E., and welcome to the future of online media. This is the STATIC Network, the home of AI entertainment. If you’d like, I can give you a quick tour and show you how everything works.'

export function SageProvider({ children }) {
  const { navigate, path } = useRouter()
  const { user } = useAuth()
  const preferences = getSageIntroPreferences()
  const [open, setOpen] = useState(false)
  const [showIntro, setShowIntro] = useState(() => !preferences.seen && preferences.showOnHome)
  const [tourStep, setTourStep] = useState(-1)
  const [messages, setMessages] = useState([{ role: 'sage', text: 'I’m online. Ask me to open a tool, explain a system, or help prepare your next move.' }])
  const [activity, setActivity] = useState([])
  const [pending, setPending] = useState(null)
  const [voiceState, setVoiceState] = useState('idle')
  const [voiceSettings, setVoiceSettings] = useState(getSageVoiceSettings)
  const [entity, setEntity] = useState(() => getCurrentEntity())

  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])

  function log(label, detail = '') {
    setActivity((items) => [{ id: `${Date.now()}-${Math.random()}`, label, detail, at: new Date().toISOString() }, ...items].slice(0, 30))
  }

  async function say(text, aloud = true) {
    setMessages((items) => [...items, { role: 'sage', text }])
    if (aloud) await speakAsSage(text, { onState: setVoiceState })
  }

  function updateVoiceSettings(next) {
    setVoiceSettings(next)
    saveSageVoiceSettings(next)
    if (next.muted) stopSageVoice()
  }

  async function runCommand(input) {
    const text = String(input || '').trim()
    if (!text) return
    setMessages((items) => [...items, { role: 'user', text }])
    const parsed = parseSageIntent(text)
    const plan = planSageAction(parsed)
    log('Command understood', parsed.intent)
    if (parsed.intent === 'generate_entity' && parsed.preset === 'mr-stone') {
      localStorage.setItem('static_entity_generator_draft', JSON.stringify(mrStonePreset.entityDNA))
    }
    if (plan.type === 'confirm') {
      setPending({ parsed, plan })
      await say(plan.response)
      return
    }
    if (plan.type === 'tour') {
      setTourStep(0)
      setOpen(false)
      log('Guided tour started')
      await say(plan.response)
      return
    }
    if (plan.type === 'navigate') {
      navigate(plan.route)
      log('Opened route', plan.route)
    }
    await say(plan.response)
  }

  async function confirmPending() {
    if (!pending) return
    const { parsed } = pending
    let response = 'Approved.'
    if (parsed.intent === 'post_signal') {
      localStorage.setItem('static_sage_signal_draft', JSON.stringify({ text: parsed.payload, pose: 'Wave', entityId: entity?.id || '' }))
      navigate('/feed')
      response = `The Signal composer is ready${entity ? ` as ${entity.name}` : ''}. Review it and press Transmit when you are ready. I did not publish it for you.`
    } else if (parsed.intent === 'set_default_entity') {
      const entities = getEntities()
      const target = entities.find((item) => item.name.toLowerCase().includes(parsed.entityName.toLowerCase())) || entities[0]
      if (target) {
        setCurrentEntity(target.id)
        response = `${target.name} is now the active default Entity.`
      } else response = 'There is no Entity to activate yet.'
    } else if (parsed.intent === 'go_live_preview') {
      navigate('/live')
      response = 'Live preview opened. No external broadcast was started.'
    }
    log('Action confirmed', parsed.intent)
    setPending(null)
    await say(response)
  }

  function rejectPending() {
    if (!pending) return
    log('Action declined', pending.parsed.intent)
    setPending(null)
    say('Action cancelled. Nothing changed.', false)
  }

  function dismissIntro() {
    setShowIntro(false)
    saveSageIntroPreferences({ seen: true })
    stopSageVoice()
  }

  function startTour() {
    dismissIntro()
    setTourStep(0)
    log('Guided tour started')
  }

  const value = {
    activity,
    confirmPending,
    dismissIntro,
    entity,
    log,
    messages,
    open,
    path,
    pending,
    rejectPending,
    runCommand,
    say,
    setOpen,
    setShowIntro,
    setTourStep,
    showIntro,
    startTour,
    tourStep,
    updateVoiceSettings,
    user,
    voiceSettings,
    voiceState,
    welcome,
  }

  return <SageContext.Provider value={value}>{children}</SageContext.Provider>
}

export function useSage() {
  return useContext(SageContext)
}
