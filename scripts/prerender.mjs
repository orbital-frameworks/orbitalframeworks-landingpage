import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(process.cwd())
const clientHtmlPath = resolve(root, 'dist/index.html')
const serverEntryPath = resolve(root, 'dist-ssr/entry-server.js')

const [{ render }, template] = await Promise.all([
  import(pathToFileURL(serverEntryPath).href),
  readFile(clientHtmlPath, 'utf8'),
])

const marker = '<div id="root"></div>'
if (!template.includes(marker)) throw new Error(`Prerender marker not found in ${clientHtmlPath}`)

const structuredDataMatch = template.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
if (!structuredDataMatch) throw new Error(`Structured data block not found in ${clientHtmlPath}`)
const baseStructuredData = JSON.parse(structuredDataMatch[1])

const pages = [
  {
    pathname: '/',
    output: 'dist/index.html',
    title: 'Orbital Frameworks | Desarrollo de software en Perú',
    description: 'Orbital Frameworks es una empresa peruana de desarrollo de software y soluciones digitales. Construye productos, sistemas web y herramientas para problemas concretos de negocio.',
    canonical: 'https://orbitalframeworks.qzz.io/',
  },
  {
    pathname: '/privacy',
    output: 'dist/privacy.html',
    extraOutputs: ['dist/privacy/index.html'],
    title: 'Privacy Policy | Orbital Frameworks',
    description: 'Política de privacidad de Orbital Frameworks para Orbital Leads y su integración autorizada con Google y Gmail.',
    canonical: 'https://orbitalframeworks.qzz.io/privacy',
    schemaType: 'legal',
  },
  {
    pathname: '/terms',
    output: 'dist/terms.html',
    extraOutputs: ['dist/terms/index.html'],
    title: 'Terms of Use | Orbital Frameworks',
    description: 'Términos de uso de Orbital Leads, herramienta interna de Orbital Frameworks para investigación comercial y gestión de comunicaciones empresariales.',
    canonical: 'https://orbitalframeworks.qzz.io/terms',
    schemaType: 'legal',
  },
  {
    pathname: '/orbital-leads-gmail',
    output: 'dist/orbital-leads-gmail.html',
    extraOutputs: ['dist/orbital-leads-gmail/index.html'],
    title: 'Orbital Leads Gmail | Orbital Frameworks',
    description: 'Orbital Leads Gmail es la integración OAuth con Gmail de la herramienta interna Orbital Leads de Orbital Frameworks.',
    canonical: 'https://orbitalframeworks.qzz.io/orbital-leads-gmail',
    schemaType: 'app',
    noindex: true,
  },
  {
    pathname: '/sobre-orbital-frameworks/',
    output: 'dist/sobre-orbital-frameworks/index.html',
    title: 'Sobre Orbital Frameworks | Desarrollo de software en Perú',
    description: 'Qué es Orbital Frameworks: empresa peruana de desarrollo de software y soluciones digitales, su equipo, capacidades, método y proyectos públicos.',
    canonical: 'https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/',
    schemaType: 'about',
  },
  {
    pathname: '/casos/checkio/',
    output: 'dist/casos/checkio/index.html',
    title: 'Checkio: caso de gestión de personal | Orbital Frameworks',
    description: 'Caso Checkio: plataforma de asistencia y gestión de personal con marcaciones, geolocalización, historial y flujos para RRHH.',
    canonical: 'https://orbitalframeworks.qzz.io/casos/checkio/',
    schemaType: 'case',
  },
  {
    pathname: '/casos/veterp/',
    output: 'dist/casos/veterp/index.html',
    title: 'VetERP: caso de gestión veterinaria | Orbital Frameworks',
    description: 'Caso VetERP: sistema para agenda, pacientes, atención clínica, hospitalización, inventario, caja y operación veterinaria.',
    canonical: 'https://orbitalframeworks.qzz.io/casos/veterp/',
    schemaType: 'case',
  },
]

function schemaForPage(page) {
  if (!page.schemaType) return baseStructuredData

  const baseGraph = baseStructuredData['@graph'] ?? []
  const organization = baseGraph.find((item) => item['@type'] === 'Organization')
  const website = baseGraph.find((item) => item['@type'] === 'WebSite')
  const people = baseGraph.filter((item) => item['@type'] === 'Person')
  const portfolio = baseGraph.find((item) => item['@type'] === 'ItemList')
  const baseWebPage = baseGraph.find((item) => item['@type'] === 'WebPage')

  const webPage = {
    ...baseWebPage,
    '@type': page.schemaType === 'about' ? 'AboutPage' : 'WebPage',
    '@id': `${page.canonical}#webpage`,
    url: page.canonical,
    name: page.title,
    description: page.description,
    dateModified: page.schemaType === 'legal' ? '2026-08-28' : '2026-08-15',
    isPartOf: { '@id': 'https://orbitalframeworks.qzz.io/#website' },
    about: { '@id': 'https://orbitalframeworks.qzz.io/#organization' },
    mainEntity: page.schemaType === 'case'
      ? { '@id': 'https://orbitalframeworks.qzz.io/#portfolio' }
      : { '@id': 'https://orbitalframeworks.qzz.io/#organization' },
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website, ...people, portfolio, webPage].filter(Boolean),
  }
}

function withMetadata(html, page) {
  let output = html
    .replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${page.description}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${page.canonical}" />`)
    .replace(/<link rel="alternate" hreflang="es-PE" href="[^"]*" \/>/, `<link rel="alternate" hreflang="es-PE" href="${page.canonical}" />`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/, `<link rel="alternate" hreflang="x-default" href="${page.canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${page.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${page.description}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${page.title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${page.description}" />`)
    .replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${JSON.stringify(schemaForPage(page), null, 2)}\n    </script>`,
    )

  if (page.noindex) {
    output = output.replace(
      /<meta name="robots" content="[^"]*" \/>/,
      '<meta name="robots" content="noindex, follow" />',
    )
  }

  return output
}

for (const page of pages) {
  const appHtml = render(page.pathname)
  const output = withMetadata(template.replace(marker, `<div id="root">${appHtml}</div>`), page)
  const outputs = [page.output, ...(page.extraOutputs ?? [])]
  for (const relativeOutput of outputs) {
    const outputPath = resolve(root, relativeOutput)
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, output, 'utf8')
  }
  console.log(`Prerendered ${page.pathname} (${appHtml.length} characters)`)
}
