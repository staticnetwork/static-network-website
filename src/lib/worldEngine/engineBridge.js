import { districtVenues, worldEngineStatus } from './districtManifest'

export function createWorldEngineSnapshot(activeVenueId = 'signals') {
  return {
    status: worldEngineStatus,
    activeVenueId,
    sceneId: worldEngineStatus.sceneId,
    venues: districtVenues.map((venue) => ({
      id: venue.id,
      name: venue.name,
      route: venue.route,
      engine: venue.engine,
    })),
    integrations: {
      avatars: 'planned',
      npcs: 'planned',
      multiplayer: 'planned',
      spatialAudio: 'planned',
      commerce: 'planned',
      moderation: 'required-before-scale',
    },
  }
}

export function mountWorldEnginePreview() {
  // TODO(engine): Replace this no-op with a real engine mount when the stack is chosen.
  // Candidate paths: React Three Fiber for web-native speed, Babylon.js for browser-first
  // tooling, or Unity/Unreal WebGL only if the product truly needs heavier runtime features.
  return {
    mounted: false,
    reason: 'World engine is intentionally not mounted in the public website build.',
    unmount() {},
  }
}
