export const staticCityModelSlots = {
  mrStone: {
    id: 'mr-stone-rig',
    key: 'mrStone',
    label: 'Mr. Stone playable Entity rig',
    type: 'character',
    targetPath: '/assets/world/city/characters/mr-stone/mr-stone.glb',
    fallback: 'Procedural Mr. Stone proxy',
    targetHeight: 1.42,
    status: 'awaiting-glb',
    note: 'Drop mr-stone.glb here to replace the prototype marker with a real rig-ready Entity.',
  },
  stoneSuv: {
    id: 'black-suv',
    key: 'stoneSuv',
    label: 'Black luxury SUV',
    type: 'vehicle',
    targetPath: '/assets/world/city/vehicles/stone-suv.glb',
    fallback: 'Procedural SUV shell',
    targetHeight: 0.88,
    targetRadius: 1.12,
    status: 'awaiting-glb',
    note: 'Drop stone-suv.glb here to replace the prototype SUV shell with a real vehicle model.',
  },
}

export const staticCityModelSlotList = Object.values(staticCityModelSlots)
