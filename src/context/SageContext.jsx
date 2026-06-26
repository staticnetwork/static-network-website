/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from '../components/Router'
import { planSageAction } from '../components/sage/SageActionRouter'
import { parseSageIntent } from '../components/sage/SageIntentParser'
import { useAuth } from './AuthContext'
import { mrStonePreset } from '../lib/entityEngine/entityDefaults'
import { getCurrentEntity, getEntities, getNetworkStats, setCurrentEntity, subscribeToNetworkUpdates } from '../lib/staticStore'
import { speakAsSage, stopSageVoice } from '../lib/ai/sageVoice/sageVoiceProvider'
import { getSageVoiceSettings, saveSageVoiceSettings } from '../lib/ai/sageVoice/sageVoiceSettings'

const SageContext = createContext(null)

const welcome = 'Hey, nice to meet you. I’m S.A.G.E., and welcome to the future of online media. This is the STATIC Network, the home of AI entertainment. If you’d like, I can give you a quick tour and show you how everything works.'

export function SageProvider({ children }) {
  const { navigate, path } = useRouter()
  const { user, cloudSync } = useAuth()
  const [open, setOpen] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [tourStep, setTourStep] = useState(-1)
  const [messages, setMessages] = useState([{ role: 'sage', text: 'I’m online. Ask me to open a tool, explain a system, or help prepare your next move.' }])
  const [activity, setActivity] = useState([])
  const [pending, setPending] = useState(null)
  const [voiceState, setVoiceState] = useState('idle')
  const [voiceConnected, setVoiceConnected] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState(getSageVoiceSettings)
  const [entity, setEntity] = useState(() => getCurrentEntity())

  useEffect(() => subscribeToNetworkUpdates(() => setEntity(getCurrentEntity())), [])

  useEffect(() => {
    fetch('/.netlify/functions/test-elevenlabs')
      .then((response) => response.json())
      .then((data) => setVoiceConnected(Boolean(data.validated && data.voiceIdsConfigured)))
      .catch(() => setVoiceConnected(false))
  }, [])

  function log(label, detail = '') {
    setActivity((items) => [{ id: `${Date.now()}-${Math.random()}`, label, detail, at: new Date().toISOString() }, ...items].slice(0, 30))
  }

  async function say(text, aloud = true) {
    setMessages((items) => [...items, { role: 'sage', text }])
    if (aloud) await speakAsSage(text, { connected: voiceConnected, onState: setVoiceState })
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
    if (parsed.intent === 'network_status') {
      const stats = getNetworkStats()
      const syncMessage = user
        ? `Cloud sync is ${cloudSync?.status || 'ready'}: ${cloudSync?.message || 'signed-in cloud access is available.'}`
        : 'This is local device state until you sign in.'
      await say(`Your STATIC network has ${stats.entities} Entities, ${stats.publicSignals} public Signals, ${stats.projects} saved projects, ${stats.worlds} worlds, ${stats.drops} drops, ${stats.savedCatalog} saved marketplace items, and ${stats.reminders} programming reminders. ${syncMessage}`)
      return
    }
    if (parsed.intent === 'cloud_status') {
      const lastSync = cloudSync?.lastSyncedAt ? ` Last sync was ${new Date(cloudSync.lastSyncedAt).toLocaleString()}.` : ''
      await say(user ? `You are signed in. Cloud sync is ${cloudSync?.status || 'ready'}: ${cloudSync?.message || 'network sync is ready.'}${lastSync}` : 'You are not signed in yet, so this device is in local mode. Sign in from Account to save Entities, Signals, Studio projects, PLAY worlds, reminders, and marketplace intent to Supabase.')
      return
    }
    if (parsed.intent === 'real_vs_preview') {
      await say('Real now: public routes, Arrival District navigation, account login, local Entity creation, Signals, Studio projects, PLAY concepts, marketplace intent, reminders, media storage, and signed-in Supabase sync. Preview only: paid AI generation, Unreal city traversal, multiplayer worlds, real live streaming, radio audio streams, payments, subscriptions, marketplace transactions, production uploads, and moderation/admin systems. I will call those out before anything could cost money.')
      return
    }
    if (parsed.intent === 'district_status') {
      await say('The Arrival District is the public landing world and front door of STATIC City. Tap a venue in the image to preview what it does, then enter Signals, Live, PLAY, Studio, Channels, Radio, Marketplace, or S.A.G.E. It is real web navigation with cinematic motion and stateful venue panels now; full 3D city traversal, avatars, walking NPCs, vehicles, interiors, and persistent spaces are future Unreal work.')
      return
    }
    if (parsed.intent === 'district_onboarding') {
      const stats = getNetworkStats()
      let route = '/account'
      let response = 'The first STATIC loop is active: Entity, Signal, follow, creation, and cloud sync. I’m opening the Account cockpit so you can review the City OS.'
      if (!stats.entities) {
        route = '/entities/create'
        response = 'First move: create the Entity. That gives you the identity and Channel everything else attaches to.'
      } else if (!stats.publicSignals) {
        route = '/feed'
        response = 'Next move: transmit the first Signal. That starts the public history of the network.'
      } else if (!stats.follows) {
        route = '/discover'
        response = 'Next move: follow one venue. That turns the Arrival District from a showcase into a social graph.'
      } else if (!stats.projects && !stats.worlds) {
        route = '/studio'
        response = 'Next move: save a Studio or PLAY project. That proves the creator loop beyond posting.'
      } else if (!user || cloudSync?.status !== 'synced') {
        route = user ? '/account' : '/login'
        response = user ? 'Next move: sync the device network to cloud from Account.' : 'Next move: sign in so this device network can travel with you.'
      } else {
        route = '/'
        response = 'The first City OS loop is alive. I’m opening the Arrival District so the public tour can keep guiding from the world itself.'
      }
      navigate(route)
      log('City OS guidance', route)
      await say(response)
      return
    }
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
    stopSageVoice()
  }

  function summonIntro() {
    setOpen(false)
    setShowIntro(true)
    stopSageVoice()
  }

  async function summonArrivalIntro() {
    setOpen(false)
    setShowIntro(true)
    stopSageVoice()
    const arrivalVoiceSettings = { ...voiceSettings, enabled: true, spokenResponses: true, muted: false }
    setVoiceSettings(arrivalVoiceSettings)
    saveSageVoiceSettings(arrivalVoiceSettings)
    await say(welcome, true)
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
    summonArrivalIntro,
    summonIntro,
    tourStep,
    updateVoiceSettings,
    user,
    voiceSettings,
    voiceConnected,
    voiceState,
    welcome,
  }

  return <SageContext.Provider value={value}>{children}</SageContext.Provider>
}

export function useSage() {
  return useContext(SageContext)
}
