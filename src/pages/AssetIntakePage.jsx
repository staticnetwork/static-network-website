import { useMemo, useState } from 'react'
import { Link, RouteSEO } from '../components/Router'
import { ArrowIcon, LiveIndicator, PageHero } from '../components/UI'
import {
  assetFormatOptions,
  assetHomeOptions,
  assetIntakeStarter,
  assetTypeOptions,
  deleteAssetIntakeRecord,
  gameplayRoleOptions,
  getAssetHome,
  getAssetIntakeRecords,
  licenseStatusOptions,
  makeAssetIntakeExport,
  normalizeAssetIntake,
  rarityOptions,
  saveAssetIntakeRecord,
  sourceStatusOptions,
  summarizeAssetIntake,
} from '../lib/worldEngine/staticAssetIntake'

function TextField({ label, value, onChange, placeholder = '', type = 'text', as = 'input' }) {
  const Control = as
  return (
    <label>
      <span>{label}</span>
      <Control
        type={as === 'input' ? type : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={as === 'textarea' ? 4 : undefined}
      />
    </label>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </label>
  )
}

function CheckField({ label, checked, onChange }) {
  return (
    <label className="asset-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function metricLabel(value) {
  if (value >= 78) return 'high'
  if (value >= 56) return 'review'
  return 'early'
}

function emptyForm() {
  return { ...assetIntakeStarter }
}

function AssetRecordCard({ record, active, onSelect, onDelete }) {
  return (
    <article className={`asset-record-card ${active ? 'is-active' : ''}`}>
      <button type="button" onClick={() => onSelect(record)} aria-label={`Open ${record.name || 'asset record'}`}>
        <div>
          <span>{record.status}</span>
          <strong>{record.name || 'Unnamed asset'}</strong>
          <small>{record.assetType} / {record.targetHomeLabel}</small>
        </div>
        <b className={`asset-score asset-score--${metricLabel(record.readinessScore)}`}>{record.readinessScore}%</b>
      </button>
      <div className="asset-record-card__meta">
        <span>{record.rarity}</span>
        <span>{record.gameplayRole}</span>
        <span>{record.licenseStatus}</span>
      </div>
      <button className="asset-record-card__delete" type="button" onClick={() => onDelete(record.id)}>
        Remove local record
      </button>
    </article>
  )
}

export default function AssetIntakePage() {
  const [records, setRecords] = useState(() => getAssetIntakeRecords())
  const [form, setForm] = useState(emptyForm)
  const [activeId, setActiveId] = useState(records[0]?.id || '')
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState('Asset intake is local owner planning only. No backend inventory or Unreal import is being faked.')

  const normalizedForm = useMemo(() => normalizeAssetIntake(form), [form])
  const summary = useMemo(() => summarizeAssetIntake(records), [records])
  const filteredRecords = useMemo(() => {
    if (filter === 'all') return records
    return records.filter((record) => record.status === filter || record.assetType === filter || record.worldLayer === filter)
  }, [filter, records])
  const activeRecord = records.find((record) => record.id === activeId) || records[0] || normalizedForm
  const exportText = useMemo(() => JSON.stringify(makeAssetIntakeExport(records), null, 2), [records])
  const selectedHome = getAssetHome(form.targetHomeId)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function saveRecord(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setMessage('Name the asset or pack before saving it.')
      return
    }
    const saved = saveAssetIntakeRecord(form)
    const next = getAssetIntakeRecords()
    setRecords(next)
    setActiveId(saved.id)
    setForm(saved)
    setMessage(`${saved.name} saved to local intake with ${saved.readinessScore}% readiness.`)
  }

  function selectRecord(record) {
    setForm(record)
    setActiveId(record.id)
    setMessage(`${record.name} loaded into the console.`)
  }

  function newRecord() {
    setForm(emptyForm())
    setActiveId('')
    setMessage('New intake draft opened. Assign it before it leaves quarantine.')
  }

  function removeRecord(recordId) {
    const next = deleteAssetIntakeRecord(recordId)
    setRecords(next)
    if (recordId === activeId) {
      setActiveId(next[0]?.id || '')
      setForm(next[0] || emptyForm())
    }
    setMessage('Local intake record removed. No cloud data was touched.')
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportText)
      setMessage('World asset intake export copied to clipboard.')
    } catch {
      setMessage('Clipboard copy was blocked. The export JSON is still visible below.')
    }
  }

  function downloadExport() {
    const blob = new Blob([`${exportText}\n`], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `static-asset-intake-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setMessage('Asset intake export downloaded. Store reviewed manifests in public/assets/world/intake/manifests/.')
  }

  return (
    <>
      <RouteSEO
        path="/asset-intake"
        title="Asset Intake Console | STATIC Network"
        description="Owner-only STATIC world asset intake and Unreal readiness planning console."
      />
      <PageHero
        compact
        code="OWNER//ASSET-INTAKE"
        eyebrow="WORLD BIBLE CONSOLE"
        title="Place every asset before it becomes canon."
        copy="Assign new packs to districts, regions, island rings, factions, rarity, gameplay role, licensing state, and Unreal readiness before they enter STATIC City."
        status="OWNER TOOL"
      >
        <div className="asset-intake-hero">
          <span>LOCAL ONLY</span>
          <strong>{summary.total} records</strong>
          <small>{summary.quarantine} quarantine / {summary.unrealReady} Unreal-ready candidates</small>
        </div>
      </PageHero>

      <section className="section asset-intake-page">
        <div className="page-frame asset-intake-grid">
          <form className="asset-intake-console" onSubmit={saveRecord}>
            <div className="asset-intake-status">
              <span>ACTIVE DRAFT</span>
              <LiveIndicator label={normalizedForm.status.toUpperCase()} />
            </div>

            <div className="asset-intake-metrics">
              {[
                ['Total', summary.total],
                ['Quarantine', summary.quarantine],
                ['License review', summary.licenseReview],
                ['Owner approved', summary.ownerApproved],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <TextField label="Asset or pack name" value={form.name} onChange={(value) => update('name', value)} placeholder="Example: Snow Citadel Knight Pack" />
            <div className="asset-intake-two">
              <TextField label="Source / marketplace" value={form.sourceName} onChange={(value) => update('sourceName', value)} placeholder="Meshy, Fab, Blender, owner-created..." />
              <TextField label="Source URL or local note" value={form.sourceUrl} onChange={(value) => update('sourceUrl', value)} placeholder="https://... or Desktop filename" />
            </div>

            <div className="asset-intake-three">
              <SelectField label="Type" value={form.assetType} onChange={(value) => update('assetType', value)} options={assetTypeOptions} />
              <SelectField label="Format" value={form.assetFormat} onChange={(value) => update('assetFormat', value)} options={assetFormatOptions} />
              <SelectField label="Rarity" value={form.rarity} onChange={(value) => update('rarity', value)} options={rarityOptions} />
            </div>

            <div className="asset-intake-two">
              <SelectField label="Source state" value={form.sourceStatus} onChange={(value) => update('sourceStatus', value)} options={sourceStatusOptions} />
              <SelectField label="License state" value={form.licenseStatus} onChange={(value) => update('licenseStatus', value)} options={licenseStatusOptions} />
            </div>

            <SelectField
              label="World placement"
              value={form.targetHomeId}
              onChange={(value) => update('targetHomeId', value)}
              options={assetHomeOptions.map((home) => ({ value: home.id, label: `${home.label} / ${home.worldLayer}` }))}
            />

            <div className="asset-home-preview">
              <span>{selectedHome.worldLayer}</span>
              <strong>{selectedHome.label}</strong>
              <small>{selectedHome.biome}</small>
            </div>

            <div className="asset-intake-two">
              <SelectField label="Gameplay role" value={form.gameplayRole} onChange={(value) => update('gameplayRole', value)} options={gameplayRoleOptions} />
              <TextField label="Faction / settlement" value={form.faction} onChange={(value) => update('faction', value)} placeholder="Optional crew, village, faction, order..." />
            </div>

            <div className="asset-intake-two">
              <TextField label="Creation space" value={form.creatorSpace} onChange={(value) => update('creatorSpace', value)} placeholder="Market Walk, Wondercore, Radio, Entity Labs..." />
              <TextField label="Scale class" value={form.scaleClass} onChange={(value) => update('scaleClass', value)} placeholder="Human scale, huge boss, vehicle scale..." />
            </div>

            <TextField as="textarea" label="Lore / placement reason" value={form.loreNotes} onChange={(value) => update('loreNotes', value)} placeholder="Why this asset belongs here. What civilization, story, event, or economy loop does it support?" />
            <TextField as="textarea" label="Blender / import notes" value={form.importNotes} onChange={(value) => update('importNotes', value)} placeholder="Scale, mesh separation, textures, rigging, collision, LOD, Nanite, animation notes..." />
            <TextField as="textarea" label="Moderation / safety notes" value={form.moderationNotes} onChange={(value) => update('moderationNotes', value)} placeholder="Weapons, adult area, combat limits, public-space restrictions, IP risks..." />
            <TextField as="textarea" label="File notes" value={form.fileNotes} onChange={(value) => update('fileNotes', value)} placeholder="Filenames, local paths, texture folders, pack variants, dependencies..." />

            <div className="asset-intake-checks">
              <CheckField label="Owner approved placement" checked={form.ownerApprovedPlacement} onChange={(value) => update('ownerApprovedPlacement', value)} />
              <CheckField label="Ready for Blender review" checked={form.readyForBlender} onChange={(value) => update('readyForBlender', value)} />
              <CheckField label="Ready for Unreal import planning" checked={form.readyForUnreal} onChange={(value) => update('readyForUnreal', value)} />
              <CheckField label="Can seed NPC ecosystem" checked={form.npcEcosystem} onChange={(value) => update('npcEcosystem', value)} />
            </div>

            <div className="asset-intake-actions">
              <button className="button button--primary" type="submit">Save intake</button>
              <button className="button button--secondary" type="button" onClick={newRecord}>New draft</button>
            </div>
            <p className="asset-intake-message">{message}</p>
          </form>

          <aside className="asset-intake-panel">
            <div className="asset-readiness-card">
              <div>
                <span>{activeRecord.status}</span>
                <strong>{activeRecord.name || 'No asset selected'}</strong>
                <small>{activeRecord.targetHomeLabel}</small>
              </div>
              <b className={`asset-score asset-score--${metricLabel(activeRecord.readinessScore)}`}>{activeRecord.readinessScore}%</b>
            </div>

            <div className="asset-path-card">
              <span>Unreal target</span>
              <code>{activeRecord.unrealTargetPath}</code>
              <span>Web prototype staging</span>
              <code>{activeRecord.webPrototypePath}</code>
            </div>

            <div className="asset-rule-card">
              <span>Placement rule</span>
              <p>Ask where every new pack belongs before canonizing it. If placement is unclear, keep it in quarantine until the region, faction, settlement, or island ring is approved.</p>
              {summary.ecosystemSeeds.length ? (
                <ul>
                  {summary.ecosystemSeeds.map((seed) => <li key={seed.home}>{seed.home}: {seed.count} ecosystem candidates</li>)}
                </ul>
              ) : (
                <small>No home has 10+ compatible records yet. Once it does, it can become a living NPC ecosystem candidate.</small>
              )}
            </div>

            <div className="asset-record-toolbar">
              <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter asset intake records">
                <option value="all">All records</option>
                <option value="Quarantine">Quarantine</option>
                <option value="License review">License review</option>
                <option value="Unreal-ready candidate">Unreal-ready</option>
                {assetTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                {['STATIC City', 'STATIC Island', 'Fields', 'Hidden City', 'Future Universe'].map((layer) => <option key={layer} value={layer}>{layer}</option>)}
              </select>
              <button type="button" onClick={copyExport}>Copy export</button>
              <button type="button" onClick={downloadExport}>Download</button>
            </div>

            <div className="asset-record-list" aria-label="Saved local asset intake records">
              {filteredRecords.length ? filteredRecords.map((record) => (
                <AssetRecordCard
                  key={record.id}
                  record={record}
                  active={record.id === activeRecord.id}
                  onSelect={selectRecord}
                  onDelete={removeRecord}
                />
              )) : (
                <div className="asset-empty-state">
                  <strong>No records yet.</strong>
                  <p>Start with the next GLB pack, character group, vehicle, building, or district prop you want to bring into STATIC.</p>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="page-frame asset-intake-export">
          <div>
            <span>UNREAL / MCP HANDOFF PAYLOAD</span>
            <h2>Exportable world asset manifest.</h2>
            <p>This JSON is a planning bridge. It does not create marketplace listings, Supabase rows, or Unreal assets yet.</p>
          </div>
          <textarea value={exportText} readOnly rows={12} aria-label="Asset intake export JSON" />
          <div className="asset-intake-next">
            <Link className="button button--secondary" to="/city?owner-preview=1">Open owner city <ArrowIcon /></Link>
            <Link className="button button--secondary" to="/provider-status">Provider status <ArrowIcon /></Link>
          </div>
        </div>
      </section>
    </>
  )
}
