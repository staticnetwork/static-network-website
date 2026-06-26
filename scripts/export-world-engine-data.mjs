#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { staticCityAssetPipeline } from '../src/lib/worldEngine/staticCityAssetPipeline.js'
import {
  ASSET_INTAKE_STORAGE_KEY,
  assetFormatOptions,
  assetHomeOptions,
  assetTypeOptions,
  gameplayRoleOptions,
  licenseStatusOptions,
  rarityOptions,
  sourceStatusOptions,
} from '../src/lib/worldEngine/staticAssetIntake.js'
import {
  staticCityBackendContracts,
  staticCityDistrictBillboards,
  staticCityMissionLoop,
  staticCityRouteNodes,
  staticCitySceneModes,
  staticCitySystems,
  staticCityTiers,
  staticCityVisualTargets,
  staticCityWorld,
} from '../src/lib/worldEngine/staticCityWorld.js'
import {
  staticCityMacroDistricts,
  staticCityMarinePlan,
  staticCityScalePlan,
  staticCityScaleRules,
  staticCitySignatureLandmarks,
} from '../src/lib/worldEngine/staticCityScalePlan.js'
import {
  staticCityAnimationStylePrinciples,
  staticCityUnrealMilestones,
  staticCityUnrealPlan,
  staticCityVisualStylePrinciples,
} from '../src/lib/worldEngine/staticCityUnrealPlan.js'

const outputDir = resolve('public/assets/world/city/data')

const payloads = {
  'asset-pipeline.json': {
    generatedAt: new Date().toISOString(),
    assets: staticCityAssetPipeline,
  },
  'asset-intake-options.json': {
    generatedAt: new Date().toISOString(),
    route: '/asset-intake',
    ownerAlias: '/world-bible',
    storageKey: ASSET_INTAKE_STORAGE_KEY,
    note: 'Option catalog only. Owner local records are exported from the browser console after review.',
    options: {
      assetTypes: assetTypeOptions,
      formats: assetFormatOptions,
      sources: sourceStatusOptions,
      licenses: licenseStatusOptions,
      rarities: rarityOptions,
      gameplayRoles: gameplayRoleOptions,
      homes: assetHomeOptions,
    },
  },
  'city-world.json': {
    generatedAt: new Date().toISOString(),
    world: staticCityWorld,
    tiers: staticCityTiers,
    routeNodes: staticCityRouteNodes,
    sceneModes: staticCitySceneModes,
    systems: staticCitySystems,
    backendContracts: staticCityBackendContracts,
    visualTargets: staticCityVisualTargets,
    districtBillboards: staticCityDistrictBillboards,
  },
  'district-scale.json': {
    generatedAt: new Date().toISOString(),
    scalePlan: staticCityScalePlan,
    macroDistricts: staticCityMacroDistricts,
    signatureLandmarks: staticCitySignatureLandmarks,
    marinePlan: staticCityMarinePlan,
    scaleRules: staticCityScaleRules,
  },
  'story-missions.json': {
    generatedAt: new Date().toISOString(),
    storyTarget: 'GTA-style cinematic open-world campaign with STATIC creator/social systems',
    firstSlice: 'STATIC Origin Missions',
    missionLoop: staticCityMissionLoop,
  },
  'unreal-handoff.json': {
    generatedAt: new Date().toISOString(),
    unrealPlan: staticCityUnrealPlan,
    visualStylePrinciples: staticCityVisualStylePrinciples,
    animationStylePrinciples: staticCityAnimationStylePrinciples,
    milestones: staticCityUnrealMilestones,
  },
}

await mkdir(outputDir, { recursive: true })

await Promise.all(Object.entries(payloads).map(([fileName, payload]) => (
  writeFile(resolve(outputDir, fileName), `${JSON.stringify(payload, null, 2)}\n`)
)))

console.log(`Exported ${Object.keys(payloads).length} STATIC world data files to ${outputDir}`)
