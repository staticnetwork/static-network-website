function escape(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character])
}

export async function generateMockEntityImages({ dna, outputType }) {
  const name = escape(dna.identity.name || 'NEW ENTITY')
  const initials = escape((dna.identity.name || 'NE').split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase())
  return [0, 1, 2].map((variant) => {
    const accent = ['#78e8ff', '#8b70ff', '#f3f7ff'][variant]
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1280" viewBox="0 0 1024 1280">
      <defs><radialGradient id="g"><stop stop-color="${accent}" stop-opacity=".34"/><stop offset=".64" stop-color="#090b10"/><stop offset="1" stop-color="#020303"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="18"/></filter></defs>
      <rect width="1024" height="1280" fill="#030404"/><rect width="1024" height="1280" fill="url(#g)"/>
      <g stroke="${accent}" opacity=".16">${Array.from({ length: 16 }, (_, index) => `<path d="M0 ${index * 80}H1024"/>`).join('')}${Array.from({ length: 13 }, (_, index) => `<path d="M${index * 85} 0V1280"/>`).join('')}</g>
      <circle cx="512" cy="520" r="280" fill="none" stroke="${accent}" stroke-width="3" opacity=".5"/><circle cx="512" cy="520" r="220" fill="${accent}" opacity=".12" filter="url(#glow)"/>
      <path d="M335 910C350 700 390 618 512 618S674 700 689 910L760 1170H264Z" fill="#0a0d12" stroke="${accent}" stroke-width="3"/>
      <ellipse cx="512" cy="470" rx="145" ry="188" fill="#151b23" stroke="${accent}" stroke-width="4"/>
      <path d="M376 420Q512 248 648 420L620 330Q512 230 404 330Z" fill="#07090c"/><text x="512" y="520" fill="#f5f7f2" font-family="Arial" font-size="112" text-anchor="middle" font-weight="700">${initials}</text>
      <text x="64" y="72" fill="${accent}" font-family="monospace" font-size="24">STATIC // ENTITY VISUAL PREVIEW 0${variant + 1}</text>
      <text x="512" y="1210" fill="#f5f7f2" font-family="Arial" font-size="48" text-anchor="middle" font-weight="700">${name}</text>
      <text x="512" y="1250" fill="${accent}" font-family="monospace" font-size="18" text-anchor="middle">${escape(outputType.toUpperCase())} // LOCAL NON-AI RENDER</text>
    </svg>`
    return {
      id: `preview-${Date.now()}-${variant}`,
      provider: 'local-preview',
      mimeType: 'image/svg+xml',
      dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      variant,
    }
  })
}

