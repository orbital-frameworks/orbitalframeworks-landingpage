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

const pages = [
  {
    pathname: '/',
    output: 'dist/index.html',
    title: 'Desarrollo de software en Perú | Orbital Frameworks',
    description: 'Desarrollo de software y soluciones digitales en Perú. Construimos productos, mejoramos webs y sistemas, y resolvemos problemas concretos de negocio.',
    canonical: 'https://orbitalframeworks.qzz.io/',
  },
  {
    pathname: '/casos/checkio/',
    output: 'dist/casos/checkio/index.html',
    title: 'Checkio: caso de gestión de personal | Orbital Frameworks',
    description: 'Caso Checkio: plataforma de asistencia y gestión de personal con marcaciones, geolocalización, historial y flujos para RRHH.',
    canonical: 'https://orbitalframeworks.qzz.io/casos/checkio/',
  },
  {
    pathname: '/casos/veterp/',
    output: 'dist/casos/veterp/index.html',
    title: 'VetERP: caso de gestión veterinaria | Orbital Frameworks',
    description: 'Caso VetERP: sistema para agenda, pacientes, atención clínica, hospitalización, inventario, caja y operación veterinaria.',
    canonical: 'https://orbitalframeworks.qzz.io/casos/veterp/',
  },
]

function withMetadata(html, page) {
  return html
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
}

for (const page of pages) {
  const appHtml = render(page.pathname)
  const outputPath = resolve(root, page.output)
  await mkdir(dirname(outputPath), { recursive: true })
  const output = withMetadata(template.replace(marker, `<div id="root">${appHtml}</div>`), page)
  await writeFile(outputPath, output, 'utf8')
  console.log(`Prerendered ${page.pathname} (${appHtml.length} characters)`)
}
