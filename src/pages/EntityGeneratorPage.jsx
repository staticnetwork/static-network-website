import EntityGenerator from '../components/entityGenerator/EntityGenerator'
import { RouteSEO } from '../components/Router'

export default function EntityGeneratorPage() {
  return (
    <>
      <RouteSEO path="/entities/generate" title="Entity Generator | STATIC Network" description="Direct, generate, and save a consistent visual identity with STATIC Entity DNA." />
      <section className="entity-generator-page">
        <div className="broadcast-grid" />
        <div className="scanlines" />
        <div className="page-frame entity-generator-page__intro">
          <span>STATIC IDENTITY ATELIER // VISUAL ENTITY SYSTEM</span>
          <h1>Generate the face.<br /><em>Open the floor.</em></h1>
          <p>Build a repeatable identity from reference, direction, wardrobe, world, and official frames. Use the preview renderer or connect an approved server-side provider.</p>
        </div>
        <div className="page-frame"><EntityGenerator /></div>
      </section>
    </>
  )
}
