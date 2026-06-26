import { useEffect, useMemo, useState } from 'react'
import { generateEntityImages } from '../../lib/ai/entityImage/entityImageProvider'
import { getEntityImageProviders } from '../../lib/ai/entityImage/providerConfig'
import { buildEntityImagePrompt } from '../../lib/ai/entityImage/promptBuilder'
import { defaultEntityDNA, mrStonePreset } from '../../lib/entityEngine/entityDefaults'
import { normalizeEntityDNA } from '../../lib/entityEngine/entityMigrations'
import {
  createEntity,
  getChannelForEntity,
  getCurrentEntity,
  saveChannel,
  saveEntity,
  saveMedia,
  setCurrentEntity,
} from '../../lib/staticStore'
import { useRouter } from '../Router'
import { ArrowIcon, LiveIndicator, SignalMark } from '../UI'

const outputs = ['portrait', 'full body', 'channel banner', 'cinematic scene', 'turnaround sheet']
const styles = ['Ultra-photoreal luxury editorial cinema', 'Cinematic sci-fi', 'High-fashion campaign', 'Animated feature', 'Graphic novel']

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function inputValue(dna, group, key, value) {
  return { ...dna, [group]: { ...dna[group], [key]: value } }
}

function Field({ label, value, onChange, textarea = false, placeholder = '' }) {
  return (
    <label className="generator-field">
      <span>{label}</span>
      {textarea
        ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows="3" placeholder={placeholder} />
        : <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}
    </label>
  )
}

function ListEditor({ title, items, fields, onChange }) {
  function update(index, key, value) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }
  return (
    <div className="generator-list">
      <div className="generator-list__top">
        <span>{title}</span>
        <button type="button" onClick={() => onChange([...items, { id: `${title}-${Date.now()}`, ...Object.fromEntries(fields.map((field) => [field, ''])) }])}>+ Add</button>
      </div>
      {items.length === 0 && <p>None defined. Add only what belongs to this identity.</p>}
      {items.map((item, index) => (
        <div className="generator-list__row" key={item.id || index}>
          {fields.map((field) => <input value={item[field] || ''} onChange={(event) => update(index, field, event.target.value)} placeholder={field} aria-label={`${title} ${field}`} key={field} />)}
          <button type="button" aria-label={`Remove ${title} item`} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}>×</button>
        </div>
      ))}
    </div>
  )
}

export default function EntityGenerator() {
  const { navigate } = useRouter()
  const current = getCurrentEntity()
  const [dna, setDNA] = useState(() => normalizeEntityDNA(current?.entityDNA || defaultEntityDNA))
  const [outputType, setOutputType] = useState('portrait')
  const [providers, setProviders] = useState([])
  const [provider, setProvider] = useState('local-preview')
  const [references, setReferences] = useState([])
  const [logos, setLogos] = useState([])
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(0)
  const [phase, setPhase] = useState('READY')
  const [status, setStatus] = useState('Local preview mode is ready. No provider credits will be used.')
  const [confirmPaid, setConfirmPaid] = useState(false)

  useEffect(() => {
    getEntityImageProviders().then((items) => setProviders(items))
    try {
      const draft = JSON.parse(localStorage.getItem('static_entity_generator_draft') || 'null')
      if (draft) setDNA(normalizeEntityDNA(draft))
    } catch {
      // Ignore malformed local assistant drafts.
    }
  }, [])

  const prompt = useMemo(() => buildEntityImagePrompt(dna, outputType), [dna, outputType])
  const activeProviderConnected = providers.find((item) => item.id === provider)?.configured
  const isPaid = provider !== 'local-preview'

  function applyMrStone() {
    setDNA(clone(mrStonePreset.entityDNA))
    setStatus('Mr Stone founder DNA loaded. Review every field before generation.')
  }

  async function addReferences(event) {
    const files = [...(event.target.files || [])].slice(0, 6)
    const records = []
    for (const file of files) {
      const media = await saveMedia(file, { type: 'entity-reference', ownerEntityId: current?.id || '' })
      records.push({ id: media.id, name: file.name, url: URL.createObjectURL(file) })
    }
    setReferences((items) => [...items, ...records].slice(0, 6))
    setDNA((value) => {
      const ids = [...value.generation.referenceMediaIds, ...records.map((item) => item.id)].slice(0, 6)
      return { ...inputValue(value, 'generation', 'referenceMediaIds', ids), referenceImageIds: ids }
    })
  }

  async function addLogos(event) {
    const files = [...(event.target.files || [])].slice(0, 4)
    const records = []
    for (const file of files) {
      const media = await saveMedia(file, { type: 'entity-logo-decal', ownerEntityId: current?.id || '' })
      records.push({ id: media.id, mediaId: media.id, name: file.name, usage: 'tattoo, pendant, medallion, ring face, watch face, or logo plate', url: URL.createObjectURL(file) })
    }
    setLogos((items) => [...items, ...records].slice(0, 4))
    setDNA((value) => ({
      ...value,
      logos: [...value.logos, ...records.map((record) => ({
        id: record.id,
        mediaId: record.mediaId,
        name: record.name,
        usage: record.usage,
      }))].slice(0, 4),
    }))
  }

  async function generate() {
    if (isPaid && (!activeProviderConnected || !confirmPaid)) {
      setStatus(activeProviderConnected ? 'Confirm the paid provider request first.' : 'That provider is not validated. Use preview mode or complete provider setup.')
      return
    }
    setPhase('ANALYZING DNA')
    setStatus('Locking identity, wardrobe, world, and consistency instructions...')
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 420))
      setPhase('RENDERING')
      const images = await generateEntityImages(provider, { dna, prompt, outputType, confirmPaid })
      setResults(images)
      setSelected(0)
      setPhase('READY')
      setStatus(provider === 'local-preview' ? 'Three safe preview concepts created. No AI provider was called.' : `${provider} returned an image. Review before making it official.`)
    } catch (error) {
      setPhase('ERROR')
      setStatus(error.message || 'Generation failed.')
    }
  }

  async function saveOfficial(target = 'profile') {
    const image = results[selected]
    if (!image) return
    setPhase('SAVING')
    try {
      const response = await fetch(image.dataUrl)
      const blob = await response.blob()
      const file = new File([blob], `${dna.identity.handle || 'entity'}-${target}-${Date.now()}.${blob.type.includes('svg') ? 'svg' : 'png'}`, { type: blob.type })
      const media = await saveMedia(file, { type: `entity-official-${target}`, ownerEntityId: current?.id || '' })
      const official = {
        id: `official-${Date.now()}`,
        mediaRef: media.id,
        type: target,
        provider: image.provider || provider,
        outputType,
        createdAt: new Date().toISOString(),
      }
      const officialImages = [...(dna.generation.officialImages || []), official]
      const nextDNA = { ...inputValue(dna, 'generation', 'officialImages', officialImages), officialImages }
      nextDNA.generation.defaultImageId = target === 'profile' ? official.id : nextDNA.generation.defaultImageId
      let entity = current
      if (!entity) {
        entity = createEntity({
          ...mrStonePreset,
          name: dna.identity.name || 'New Entity',
          handle: dna.identity.handle || dna.identity.name,
          role: dna.identity.role,
          entityDNA: nextDNA,
          profileImageRef: target === 'profile' ? media.id : '',
          channelBannerRef: target === 'banner' ? media.id : '',
        })
      } else {
        entity = saveEntity({
          ...entity,
          name: dna.identity.name || entity.name,
          role: dna.identity.role || entity.role,
          entityDNA: nextDNA,
          officialImages,
          profileImageRef: target === 'profile' ? media.id : entity.profileImageRef,
          channelBannerRef: target === 'banner' ? media.id : entity.channelBannerRef,
        })
      }
      const channel = getChannelForEntity(entity.id)
      if (channel && target === 'banner') saveChannel({ ...channel, bannerRef: media.id })
      if (channel && target === 'profile') saveChannel({ ...channel, profileImageRef: media.id })
      setCurrentEntity(entity.id)
      setDNA(nextDNA)
      setPhase('SAVED')
      setStatus(`${target === 'banner' ? 'Channel banner' : 'Profile identity'} saved as an official Entity image.`)
    } catch (error) {
      setPhase('ERROR')
      setStatus(error.message || 'The image could not be saved.')
    }
  }

  return (
    <div className="entity-generator">
      <aside className="entity-generator__controls">
        <div className="generator-console-top">
          <div><LiveIndicator label="ENTITY DNA CORE" /><h2>Direct the identity.</h2></div>
          <button type="button" onClick={applyMrStone}>Use Mr Stone Genesis Preset</button>
        </div>

        <section>
          <span className="generator-section-code">01 / IDENTITY</span>
          <div className="generator-grid">
            <Field label="Name" value={dna.identity.name} onChange={(value) => setDNA(inputValue(dna, 'identity', 'name', value))} />
            <Field label="Handle" value={dna.identity.handle} onChange={(value) => setDNA(inputValue(dna, 'identity', 'handle', value))} />
            <Field label="Role" value={dna.identity.role} onChange={(value) => setDNA(inputValue(dna, 'identity', 'role', value))} />
            <Field label="Heritage / context" value={dna.identity.heritage} onChange={(value) => setDNA(inputValue(dna, 'identity', 'heritage', value))} />
          </div>
        </section>

        <section>
          <span className="generator-section-code">02 / FACE + BODY</span>
          <div className="generator-grid">
            <Field label="Build" value={dna.appearance.build} onChange={(value) => setDNA(inputValue(dna, 'appearance', 'build', value))} />
            <Field label="Skin tone" value={dna.appearance.skinTone} onChange={(value) => setDNA(inputValue(dna, 'appearance', 'skinTone', value))} />
            <Field label="Face direction" value={dna.appearance.face} onChange={(value) => setDNA(inputValue(dna, 'appearance', 'face', value))} textarea />
            <Field label="Hair" value={dna.appearance.hair} onChange={(value) => setDNA(inputValue(dna, 'appearance', 'hair', value))} />
          </div>
        </section>

        <section>
          <span className="generator-section-code">03 / WARDROBE + WORLD</span>
          <div className="generator-grid">
            <Field label="Primary look" value={dna.wardrobe.primaryLook} onChange={(value) => setDNA(inputValue(dna, 'wardrobe', 'primaryLook', value))} textarea />
            <Field label="Environment" value={dna.world.environment} onChange={(value) => setDNA(inputValue(dna, 'world', 'environment', value))} textarea />
            <label className="generator-field"><span>Visual style</span><select value={dna.generation.style} onChange={(event) => setDNA(inputValue(dna, 'generation', 'style', event.target.value))}>{styles.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="generator-field"><span>Output</span><select value={outputType} onChange={(event) => setOutputType(event.target.value)}>{outputs.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
        </section>

        <ListEditor title="TATTOOS" items={dna.tattoos} fields={['zone', 'style', 'design', 'opacity', 'color', 'logoMediaId']} onChange={(tattoos) => setDNA({ ...dna, tattoos })} />
        <ListEditor title="JEWELRY" items={dna.jewelry} fields={['category', 'style', 'material', 'logoUsage']} onChange={(jewelry) => setDNA({ ...dna, jewelry })} />
        <ListEditor title="PROPS" items={dna.props} fields={['type', 'design']} onChange={(props) => setDNA({ ...dna, props })} />

        <section className="reference-panel">
          <span className="generator-section-code">04 / IDENTITY REFERENCES</span>
          <label className="reference-upload">Add up to 6 reference images<input type="file" accept="image/*" multiple onChange={addReferences} /></label>
          <div>{references.map((reference) => <figure key={reference.id}><img src={reference.url} alt="" /><figcaption>{reference.name}</figcaption></figure>)}</div>
          <small>References are stored locally for identity continuity. Real provider upload wiring remains server-side.</small>
        </section>
        <section className="reference-panel">
          <span className="generator-section-code">05 / CUSTOM LOGO + DECAL LIBRARY</span>
          <label className="reference-upload">Upload logos for tattoos, pendants, medallions, rings, watches, or logo plates<input type="file" accept="image/*" multiple onChange={addLogos} /></label>
          <div>{logos.map((logo) => <figure key={logo.id}><img src={logo.url} alt="" /><figcaption>{logo.name}</figcaption></figure>)}</div>
          <Field label="Official logo usage" value={dna.logoUsage} onChange={(logoUsage) => setDNA({ ...dna, logoUsage })} textarea placeholder="Define approved logo placements and treatments." />
          <small>Logo files are local identity assets now and are prepared for future AI prompt injection and GLB decal placement.</small>
        </section>
      </aside>

      <section className="entity-generator__stage">
        <header>
          <div><span>ENTITY IMAGE ENGINE</span><h1>{dna.identity.name || 'Unnamed Entity'}</h1></div>
          <LiveIndicator label={phase} />
        </header>
        <div className="provider-selector">
          <button className={provider === 'local-preview' ? 'is-active' : ''} type="button" onClick={() => setProvider('local-preview')}>Local Preview <small>Free / offline</small></button>
          {providers.map((item) => <button className={provider === item.id ? 'is-active' : ''} type="button" onClick={() => setProvider(item.id)} key={item.id}>{item.id === 'google' ? 'Google AI' : 'OpenAI'} <small>{item.configured ? 'Validated' : 'Not connected'}</small></button>)}
        </div>
        {isPaid && <label className="paid-confirm"><input type="checkbox" checked={confirmPaid} onChange={(event) => setConfirmPaid(event.target.checked)} /> I understand this confirmed action may use provider credits.</label>}

        <div className={`generation-stage ${phase === 'RENDERING' ? 'is-rendering' : ''}`}>
          {results.length ? (
            <div className="generation-results">
              <img src={results[selected].dataUrl} alt={`${dna.identity.name} generated ${outputType}`} />
              <div>{results.map((image, index) => <button className={selected === index ? 'is-active' : ''} type="button" onClick={() => setSelected(index)} key={image.id || index}><img src={image.dataUrl} alt={`Variant ${index + 1}`} /></button>)}</div>
            </div>
          ) : (
            <div className="generation-empty"><SignalMark animated /><span>DNA AWAITING RENDER</span><h2>One identity. Infinite frames.</h2><p>Build a consistent visual foundation before the Entity performs across Channels, Signals, video, live, and worlds.</p></div>
          )}
        </div>
        <div className="generator-actions">
          <button className="button button--primary" type="button" onClick={generate}>Generate {provider === 'local-preview' ? 'Preview' : 'With Provider'} <ArrowIcon /></button>
          {results.length > 0 && <>
            <button className="button button--glass" type="button" onClick={() => saveOfficial('profile')}>Make Profile Identity</button>
            <button className="button button--glass" type="button" onClick={() => saveOfficial('banner')}>Make Channel Banner</button>
            <button className="button button--glass" type="button" onClick={() => saveOfficial(outputType)}>Save Official Image</button>
          </>}
        </div>
        <p className="generator-status" role="status">{status}</p>
        <details className="generator-prompt"><summary>Review production prompt</summary><pre>{prompt}</pre></details>
        {current && <button className="text-action" type="button" onClick={() => navigate('/entities/profile')}>Open active Entity profile <ArrowIcon /></button>}
      </section>
    </div>
  )
}
