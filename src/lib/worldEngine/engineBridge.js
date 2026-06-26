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
      worldPrototype: 'three-preview-on-demand',
      streetLevelWalkMode: 'planned-cinematic-engine-system',
      avatars: 'planned-account-bound-system',
      npcs: 'planned-ai-dialogue-system',
      multiplayer: 'planned',
      spatialAudio: 'planned',
      liveEvents: 'planned',
      commerce: 'planned',
      moderation: 'required-before-scale',
    },
  }
}

export function mountWorldEnginePreview() {
  // TODO(engine): The public Arrival District now uses the React StaticWorldEngine
  // overlay for a V0.1 world prototype. Replace this bridge with the deeper
  // persistent engine mount when street-level traversal, avatar presence, NPCs,
  // pathfinding, and multiplayer are real.
  return {
    mounted: false,
    reason: 'Persistent world engine is intentionally not mounted; on-demand world prototype is handled by StaticWorldEngine.',
    unmount() {},
  }
}
