#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const requiredFields = [
  'name',
  'assetType',
  'assetFormat',
  'targetHomeId',
  'targetHomeLabel',
  'worldLayer',
  'licenseStatus',
  'sourceStatus',
  'gameplayRole',
  'readinessScore',
  'status',
  'unrealTargetPath',
  'webPrototypePath',
]

const clearedLicenseStates = new Set(['Commercial cleared', 'Owner-created'])
const blockedLicenseStates = new Set(['Restricted'])
const earlySourceStates = new Set(['Needs sourcing', 'Quarantine', 'Marketplace candidate'])

function usage() {
  console.log('Usage: npm run assets:intake:validate -- public/assets/world/intake/manifests/<manifest>.json')
  console.log('Accepts either the full /asset-intake export payload or a raw records array.')
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === ''
}

function recordLabel(record, index) {
  return `${record.name || `Record ${index + 1}`}`
}

function validateRecord(record, index) {
  const failures = []
  const warnings = []
  const label = recordLabel(record, index)

  for (const field of requiredFields) {
    if (isBlank(record[field])) failures.push(`${label}: missing ${field}`)
  }

  if (typeof record.readinessScore !== 'number' || record.readinessScore < 0 || record.readinessScore > 100) {
    failures.push(`${label}: readinessScore must be a number from 0 to 100`)
  }

  if (record.targetHomeId === 'asset-quarantine') {
    warnings.push(`${label}: still assigned to quarantine`)
  }

  if (!clearedLicenseStates.has(record.licenseStatus)) {
    warnings.push(`${label}: license is not cleared (${record.licenseStatus || 'missing'})`)
  }

  if (blockedLicenseStates.has(record.licenseStatus)) {
    warnings.push(`${label}: restricted license cannot ship without replacement or legal approval`)
  }

  if (earlySourceStates.has(record.sourceStatus)) {
    warnings.push(`${label}: source state is still early (${record.sourceStatus})`)
  }

  if (!record.ownerApprovedPlacement) {
    warnings.push(`${label}: owner placement is not approved`)
  }

  if (!record.readyForBlender) {
    warnings.push(`${label}: not marked ready for Blender review`)
  }

  if (!record.readyForUnreal) {
    warnings.push(`${label}: not marked ready for Unreal planning`)
  }

  if (isBlank(record.importNotes)) {
    warnings.push(`${label}: missing Blender/Unreal import notes`)
  }

  if (isBlank(record.loreNotes)) {
    warnings.push(`${label}: missing canon placement notes`)
  }

  if (isBlank(record.moderationNotes)) {
    warnings.push(`${label}: missing moderation/safety notes`)
  }

  return { failures, warnings }
}

const manifestPath = process.argv[2]

if (!manifestPath) {
  usage()
  process.exit(1)
}

let parsed
try {
  parsed = JSON.parse(await readFile(resolve(manifestPath), 'utf8'))
} catch (error) {
  console.error(`Could not read valid JSON from ${manifestPath}`)
  console.error(error.message)
  process.exit(1)
}

const records = Array.isArray(parsed) ? parsed : parsed.records

if (!Array.isArray(records)) {
  console.error('Manifest must contain a records array or be a raw array of records.')
  process.exit(1)
}

const results = records.map(validateRecord)
const failures = results.flatMap((result) => result.failures)
const warnings = results.flatMap((result) => result.warnings)
const unrealReady = records.filter((record) => record.status === 'Unreal-ready candidate').length
const quarantine = records.filter((record) => record.targetHomeId === 'asset-quarantine' || record.status === 'Quarantine').length

console.log(`STATIC asset intake manifest: ${manifestPath}`)
console.log(`Records: ${records.length}`)
console.log(`Unreal-ready candidates: ${unrealReady}`)
console.log(`Quarantine records: ${quarantine}`)
console.log(`Warnings: ${warnings.length}`)
console.log(`Failures: ${failures.length}`)

if (warnings.length) {
  console.log('\nWarnings:')
  for (const warning of warnings) console.log(`- ${warning}`)
}

if (failures.length) {
  console.error('\nFailures:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('\nManifest structure is valid. Resolve warnings before treating records as publish or Unreal-import ready.')
