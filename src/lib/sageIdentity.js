import { saveMedia } from './staticStore'

const IDENTITY_KEY = 'static_sage_identity'
const UPDATE_EVENT = 'static:sage-identity-updated'

export const officialSagePrompt = 'Premium futuristic holographic woman AI concierge named S.A.G.E., elegant British executive presence, refined K-pop idol warrior energy, polished high-fashion business suit, cinematic cyber-luxury design, intelligent calm expression, graceful posture, silver black charcoal icy-cyan and subtle violet holographic lighting, standing on a mechanical hologram emitter platform, luxury AI operating system aesthetic, ultra-detailed, cinematic, professional, powerful, warm, iconic, brand-ownable, not cartoonish, not childish, not sexualized, not generic robot, not retro computer assistant.'

export const officialSageNegativePrompt = 'cheap mascot, cartoon blob, old computer assistant, low-poly, toy figure, goofy robot, childish, overly sexualized, messy armor, copied character, exact celebrity likeness, bad hands, distorted face, blurry, flat icon, generic sci-fi android.'

export const officialSageSlots = [
  ['officialSagePortrait', 'Portrait'],
  ['officialSageFullBody', 'Full body'],
  ['officialSageWelcomePose', 'Welcome pose'],
  ['officialSagePointingPose', 'Pointing pose'],
  ['officialSagePanelImage', 'Assistant panel image'],
  ['officialSageLauncherImage', 'Launcher image'],
  ['officialSageIdleStill', 'Idle still'],
  ['officialSageTourStill', 'Tour still'],
  ['officialSageTalkingVideo', 'Talking video'],
  ['officialSageTourVideo', 'Tour video'],
  ['officialSageArrivalVideo', 'Arrival performance'],
  ['officialSageIdleLoopVideo', 'Idle pacing loop'],
  ['officialSageCollapseVideo', 'Corner collapse'],
  ['officialSageSummonVideo', 'Corner summon'],
]

const approvedFoundationAsset = {
  approved: true,
  approvedAt: '2026-06-13T23:16:00.000Z',
  publicUrl: '/assets/sage/official-sage-foundation.jpg',
  storage: 'project-asset',
  source: 'google-gemini-3.1-flash-image-owner-approved-candidate-2',
  mimeType: 'image/jpeg',
  fileName: 'official-sage-foundation.jpg',
  model: 'gemini-3.1-flash-image',
}

const approvedArrivalAsset = {
  approved: true,
  approvedAt: '2026-06-14T15:00:00.000Z',
  publicUrl: 'https://pub-6411cf234e1a443988675e632c525670.r2.dev/sage/sage-heygen-arrival-final.mp4',
  storage: 'r2-public',
  source: 'heygen-photo-avatar-v3-native-audio-owner-approved-v1',
  mimeType: 'video/mp4',
  fileName: 'sage-heygen-arrival-final.mp4',
  durationSeconds: 11.9564,
  generationCostUsd: 0.55,
  playbackCostUsd: 0,
}

const initialIdentity = {
  prompt: officialSagePrompt,
  negativePrompt: officialSageNegativePrompt,
  assets: {
    officialSageFullBody: {
      ...approvedFoundationAsset,
      slot: 'officialSageFullBody',
    },
    officialSageIdleStill: {
      ...approvedFoundationAsset,
      slot: 'officialSageIdleStill',
    },
    officialSageArrivalVideo: {
      ...approvedArrivalAsset,
      slot: 'officialSageArrivalVideo',
    },
  },
  updatedAt: approvedArrivalAsset.approvedAt,
}

export function getSageIdentity() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(IDENTITY_KEY) || '{}')
    return {
      ...initialIdentity,
      ...stored,
      assets: {
        ...initialIdentity.assets,
        ...(stored.assets || {}),
      },
    }
  } catch {
    return initialIdentity
  }
}

export function saveSageIdentity(identity) {
  const next = { ...identity, updatedAt: new Date().toISOString() }
  window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
  return next
}

export function saveOfficialSageAsset(slot, asset) {
  const identity = getSageIdentity()
  return saveSageIdentity({
    ...identity,
    assets: {
      ...identity.assets,
      [slot]: {
        slot,
        approved: true,
        approvedAt: new Date().toISOString(),
        ...asset,
      },
    },
  })
}

export function subscribeToSageIdentity(callback) {
  window.addEventListener(UPDATE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(UPDATE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function uploadPublicMedia({ base64, fileName, contentType }) {
  try {
    const statusResponse = await fetch('/.netlify/functions/upload-media')
    const status = await statusResponse.json()
    if (!status.validated) return { publicUrl: '', storage: 'local-only' }
    const response = await fetch('/.netlify/functions/upload-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64, fileName, contentType }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Cloud media upload failed.')
    return { publicUrl: data.publicUrl || '', storage: data.publicUrl ? 'r2-public' : 'r2-private', key: data.key || '' }
  } catch {
    return { publicUrl: '', storage: 'local-only' }
  }
}

export async function approveSageFile(slot, file, source = 'upload') {
  const media = await saveMedia(file, { type: `sage-${slot}` })
  const remote = await uploadPublicMedia({
    base64: await fileToBase64(file),
    fileName: file.name,
    contentType: file.type,
  })
  return saveOfficialSageAsset(slot, {
    mediaRef: media.id,
    publicUrl: remote.publicUrl,
    storage: remote.storage,
    source,
    mimeType: file.type,
    fileName: file.name,
  })
}
