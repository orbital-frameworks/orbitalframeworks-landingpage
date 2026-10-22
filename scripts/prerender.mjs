import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(process.cwd())
const distDir = process.env.DIST_DIR ? resolve(root, process.env.DIST_DIR) : resolve(root, 'dist')
const clientHtmlPath = resolve(distDir, 'index.html')
const serverEntryPath = process.env.DIST_SSR_DIR
  ? resolve(root, process.env.DIST_SSR_DIR, 'entry-server.js')
  : resolve(root, 'dist-ssr/entry-server.js')

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
    title: 'Software a medida y automatización para empresas | Orbital Frameworks',
    description: 'Software a medida, automatización de procesos y soluciones web para empresas en Perú. Cuéntanos qué necesitas digitalizar, integrar o mejorar.',
    canonical: 'https://orbitalframeworks.qzz.io/',
    dateModified: '2026-10-17',
  },
  {
    pathname: '/privacy',
    output: 'dist/privacy.html',
    extraOutputs: ['dist/privacy/index.html'],
    title: 'Privacy Policy | Orbital Frameworks',
    description: 'Política de privacidad de Orbital Frameworks para Orbital Leads y su integración autorizada con Google y Gmail.',
    canonical: 'https://orbitalframeworks.qzz.io/privacy',
    schemaType: 'legal',
    dateModified: '2026-10-16',
  },
  {
    pathname: '/terms',
    output: 'dist/terms.html',
    extraOutputs: ['dist/terms/index.html'],
    title: 'Terms of Use | Orbital Frameworks',
    description: 'Términos de uso de Orbital Leads, herramienta interna de Orbital Frameworks para investigación comercial y gestión de comunicaciones empresariales.',
    canonical: 'https://orbitalframeworks.qzz.io/terms',
    schemaType: 'legal',
    dateModified: '2026-08-28',
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
    dateModified: '2026-10-16',
  },
  {
    pathname: '/evidencia/',
    output: 'dist/evidencia/index.html',
    title: 'Evidencia de trabajo | Orbital Frameworks',
    description: 'Productos, casos y superficies públicas de Orbital Frameworks que pueden revisarse antes de una conversación comercial.',
    canonical: 'https://orbitalframeworks.qzz.io/evidencia/',
    schemaType: 'proof',
    dateModified: '2026-10-16',
  },
  {
    pathname: '/casos/checkio/',
    output: 'dist/casos/checkio/index.html',
    title: 'Checkio: caso de gestión de personal | Orbital Frameworks',
    description: 'Caso Checkio: plataforma de asistencia y gestión de personal con marcaciones, geolocalización, historial y flujos para RRHH.',
    canonical: 'https://orbitalframeworks.qzz.io/casos/checkio/',
    schemaType: 'case',
    dateModified: '2026-08-15',
  },
  {
    pathname: '/casos/wasy/',
    output: 'dist/casos/wasy/index.html',
    title: 'Wasy: caso de mercado digital | Orbital Frameworks',
    description: 'Caso Wasy: catálogo web para explorar productos, usar carrito y continuar pedidos por WhatsApp; la app móvil está en beta privada.',
    canonical: 'https://orbitalframeworks.qzz.io/casos/wasy/',
    schemaType: 'case',
    dateModified: '2026-10-16',
  },
  {
    pathname: '/casos/localisa/',
    output: 'dist/casos/localisa/index.html',
    title: 'Localisa: caso de plataforma SERUMS | Orbital Frameworks',
    description: 'Caso Localisa: plataforma pública para explorar plazas SERUMS mediante mapa, filtros, favoritos y herramientas de comparación.',
    canonical: 'https://orbitalframeworks.qzz.io/casos/localisa/',
    schemaType: 'case',
    dateModified: '2026-08-30',
  },
  {
    pathname: '/casos/perulog-pallets/',
    output: 'dist/casos/perulog-pallets/index.html',
    title: 'PeruLog Pallets: caso de presencia B2B | Orbital Frameworks',
    description: 'Caso PeruLog Pallets: landing B2B para presentar productos, especificaciones, servicios logísticos y solicitudes de cotización.',
    canonical: 'https://orbitalframeworks.qzz.io/casos/perulog-pallets/',
    schemaType: 'case',
    dateModified: '2026-08-30',
  },
  {
    pathname: '/servicios/desarrollo-software-medida/',
    output: 'dist/servicios/desarrollo-software-medida/index.html',
    title: 'Desarrollo de software a medida en Perú | Orbital Frameworks',
    description: 'Desarrollo de software a medida y sistemas de gestión para empresas en Perú. Procesos trazables, integraciones y soluciones adaptadas a la operación.',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/desarrollo-software-medida/',
    serviceName: 'Desarrollo de software a medida',
    serviceType: 'Desarrollo de software a medida',
    schemaType: 'service',
    dateModified: '2026-10-17',
  },
  {
    pathname: '/servicios/automatizacion-procesos/',
    output: 'dist/servicios/automatizacion-procesos/index.html',
    title: 'Automatización de procesos y WhatsApp para empresas | Orbital Frameworks',
    description: 'Automatización de procesos operativos y flujos de WhatsApp para empresas en Perú. Conecte pedidos, cotizaciones y atención con supervisión humana.',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/automatizacion-procesos/',
    serviceName: 'Automatización de procesos y WhatsApp',
    serviceType: 'Automatización de procesos',
    schemaType: 'service',
    dateModified: '2026-10-17',
  },
  {
    pathname: '/servicios/landing-pages-b2b/',
    output: 'dist/servicios/landing-pages-b2b/index.html',
    title: 'Landing pages para empresas B2B en Perú | Orbital Frameworks',
    description: 'Landing pages comerciales de alta velocidad para empresas B2B e industriales en Perú. Explicación técnica de ofertas, SEO estructurado y cotizaciones directas.',
    canonical: 'https://orbitalframeworks.qzz.io/servicios/landing-pages-b2b/',
    serviceName: 'Landing pages comerciales B2B',
    serviceType: 'Landing pages y presencia digital',
    schemaType: 'service',
    dateModified: '2026-10-17',
  },
  {
    pathname: '/blog/',
    output: 'dist/blog/index.html',
    title: 'Orbital Insights | Criterios técnicos de software en Perú',
    description: 'Artículos técnicos, marcos de decisión y evaluaciones de arquitectura de software y automatización elaborados por Orbital Frameworks.',
    canonical: 'https://orbitalframeworks.qzz.io/blog/',
    schemaType: 'blog',
    dateModified: '2026-10-22',
  },
  {
    pathname: '/blog/software-a-medida-o-saas-como-decidir/',
    output: 'dist/blog/software-a-medida-o-saas-como-decidir/index.html',
    title: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa | Orbital Insights',
    description: 'Criterios técnicos y operativos para evaluar cuándo adoptar un software SaaS comercial y cuándo construir software a medida para la operación de tu empresa.',
    canonical: 'https://orbitalframeworks.qzz.io/blog/software-a-medida-o-saas-como-decidir/',
    schemaType: 'article',
    articleHeadline: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    datePublished: '2026-10-17',
    dateModified: '2026-10-17',
  },
  {
    pathname: '/blog/automatizacion-procesos-vs-excel-riesgo-operativo/',
    output: 'dist/blog/automatizacion-procesos-vs-excel-riesgo-operativo/index.html',
    title: 'Automatización vs Excel: cuándo las hojas de cálculo son un riesgo | Orbital Insights',
    description: 'Criterios operativos y técnicos para evaluar cuándo una hoja de cálculo pone en riesgo la operación de tu empresa y qué alternativas graduales existen.',
    canonical: 'https://orbitalframeworks.qzz.io/blog/automatizacion-procesos-vs-excel-riesgo-operativo/',
    schemaType: 'article',
    articleHeadline: 'Automatización de procesos vs hojas de cálculo: cuándo Excel se convierte en un riesgo operativo',
    datePublished: '2026-10-20',
    dateModified: '2026-10-20',
  },
  {
    pathname: '/blog/landing-page-b2b-tecnica-vs-web-corporativa/',
    output: 'dist/blog/landing-page-b2b-tecnica-vs-web-corporativa/index.html',
    title: 'Landing page B2B vs web corporativa: cómo elegir | Orbital Insights',
    description: 'Cuándo conviene una landing enfocada en captar consultas B2B y cuándo necesitas un sitio corporativo completo. Criterios de decisión sin promesas de conversión.',
    canonical: 'https://orbitalframeworks.qzz.io/blog/landing-page-b2b-tecnica-vs-web-corporativa/',
    schemaType: 'article',
    articleHeadline: 'Landing page B2B o web corporativa: cuál necesita realmente tu empresa',
    datePublished: '2026-10-22',
    dateModified: '2026-10-22',
  },
  {
    pathname: '/404',
    output: 'dist/404.html',
    extraOutputs: ['dist/404/index.html'],
    title: '404 - Página no encontrada | Orbital Frameworks',
    description: 'La página solicitada no existe o fue movida.',
    canonical: 'https://orbitalframeworks.qzz.io/404',
    schemaType: '404',
    noindex: true,
  },
]

function schemaForPage(page) {
  if (page.schemaType === '404') return null
  if (!page.schemaType) return baseStructuredData

  const baseGraph = baseStructuredData['@graph'] ?? []
  const organization = baseGraph.find((item) => item['@type'] === 'Organization')
  const website = baseGraph.find((item) => item['@type'] === 'WebSite')
  const people = baseGraph.filter((item) => item['@type'] === 'Person')
  const portfolio = baseGraph.find((item) => item['@type'] === 'ItemList')
  const baseWebPage = baseGraph.find((item) => item['@type'] === 'WebPage')

  let breadcrumb = null
  if (page.pathname !== '/') {
    if (page.schemaType === 'case') {
      const caseName = page.title.split(':')[0].trim()
      breadcrumb = {
        '@type': 'BreadcrumbList',
        '@id': `${page.canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://orbitalframeworks.qzz.io/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Proyectos',
            item: 'https://orbitalframeworks.qzz.io/#proyectos',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: caseName,
            item: page.canonical,
          },
        ],
      }
    } else if (page.schemaType === 'service') {
      breadcrumb = {
        '@type': 'BreadcrumbList',
        '@id': `${page.canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://orbitalframeworks.qzz.io/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Servicios',
            item: 'https://orbitalframeworks.qzz.io/#servicios',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: page.serviceName,
            item: page.canonical,
          },
        ],
      }
    } else if (page.schemaType === 'blog') {
      breadcrumb = {
        '@type': 'BreadcrumbList',
        '@id': `${page.canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://orbitalframeworks.qzz.io/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: page.canonical,
          },
        ],
      }
    } else if (page.schemaType === 'article') {
      breadcrumb = {
        '@type': 'BreadcrumbList',
        '@id': `${page.canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://orbitalframeworks.qzz.io/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://orbitalframeworks.qzz.io/blog/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: page.articleHeadline || page.title.split('|')[0].trim(),
            item: page.canonical,
          },
        ],
      }
    } else {
      breadcrumb = {
        '@type': 'BreadcrumbList',
        '@id': `${page.canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://orbitalframeworks.qzz.io/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.title.split('|')[0].trim(),
            item: page.canonical,
          },
        ],
      }
    }
  }

  let caseEntity = null
  if (page.schemaType === 'case') {
    const caseName = page.title.split(':')[0].trim()
    caseEntity = {
      '@type': 'CreativeWork',
      '@id': `${page.canonical}#project`,
      name: caseName,
      headline: page.title,
      description: page.description,
      url: page.canonical,
      creator: { '@id': 'https://orbitalframeworks.qzz.io/#organization' },
    }
  }

  let serviceEntity = null
  if (page.schemaType === 'service') {
    serviceEntity = {
      '@type': 'Service',
      '@id': `${page.canonical}#service`,
      name: page.serviceName,
      serviceType: page.serviceType,
      description: page.description,
      url: page.canonical,
      provider: { '@id': 'https://orbitalframeworks.qzz.io/#organization' },
      areaServed: { '@type': 'Country', name: 'Perú' },
    }
  }

  let blogEntity = null
  if (page.schemaType === 'blog') {
    blogEntity = {
      '@type': 'Blog',
      '@id': `${page.canonical}#blog`,
      name: 'Orbital Insights',
      headline: 'Orbital Insights / Criterios técnicos de software',
      description: page.description,
      url: page.canonical,
      publisher: { '@id': 'https://orbitalframeworks.qzz.io/#organization' },
      inLanguage: 'es-PE',
    }
  }

  let articleEntity = null
  if (page.schemaType === 'article') {
    articleEntity = {
      '@type': 'BlogPosting',
      '@id': `${page.canonical}#article`,
      headline: page.articleHeadline || page.title.split('|')[0].trim(),
      name: page.articleHeadline || page.title.split('|')[0].trim(),
      description: page.description,
      url: page.canonical,
      datePublished: page.datePublished || '2026-10-17',
      dateModified: page.dateModified || '2026-10-17',
      inLanguage: 'es-PE',
      author: {
        '@type': 'Organization',
        name: 'Orbital Frameworks',
        url: 'https://orbitalframeworks.qzz.io/sobre-orbital-frameworks/',
      },
      publisher: { '@id': 'https://orbitalframeworks.qzz.io/#organization' },
      mainEntityOfPage: { '@id': `${page.canonical}#webpage` },
    }
  }

  const webPage = {
    ...baseWebPage,
    '@type': page.schemaType === 'about' ? 'AboutPage' : page.schemaType === 'blog' ? 'CollectionPage' : 'WebPage',
    '@id': `${page.canonical}#webpage`,
    url: page.canonical,
    name: page.title,
    description: page.description,
    dateModified: page.dateModified || (page.schemaType === 'legal' ? '2026-08-28' : '2026-10-15'),
    isPartOf: { '@id': 'https://orbitalframeworks.qzz.io/#website' },
    about: { '@id': 'https://orbitalframeworks.qzz.io/#organization' },
    mainEntity: caseEntity
      ? { '@id': `${page.canonical}#project` }
      : serviceEntity
      ? { '@id': `${page.canonical}#service` }
      : articleEntity
      ? { '@id': `${page.canonical}#article` }
      : blogEntity
      ? { '@id': `${page.canonical}#blog` }
      : { '@id': 'https://orbitalframeworks.qzz.io/#organization' },
    ...(breadcrumb ? { breadcrumb: { '@id': `${page.canonical}#breadcrumb` } } : {}),
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [organization, website, ...people, portfolio, caseEntity, serviceEntity, blogEntity, articleEntity, breadcrumb, webPage].filter(Boolean),
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

  if (!output.includes('application/rss+xml')) {
    output = output.replace(
      '</head>',
      '    <link rel="alternate" type="application/rss+xml" title="Orbital Insights RSS Feed" href="https://orbitalframeworks.qzz.io/feed.xml" />\n  </head>',
    )
  }

  const schema = schemaForPage(page)
  if (schema) {
    output = output.replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n    </script>`,
    )
  } else {
    output = output.replace(
      /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      '',
    )
  }

  if (page.schemaType === 'case' || page.schemaType === 'article') {
    output = output.replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      '<meta property="og:type" content="article" />',
    )
  }

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
    const cleanedOutput = relativeOutput.startsWith('dist/') ? relativeOutput.slice(5) : relativeOutput
    const outputPath = resolve(distDir, cleanedOutput)
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, output, 'utf8')
  }
  console.log(`Prerendered ${page.pathname} (${appHtml.length} characters)`)
}

for (const staticAsset of ['index.md', '404.md', 'feed.xml']) {
  const src = resolve(root, 'public', staticAsset)
  const dest = resolve(distDir, staticAsset)
  const content = await readFile(src, 'utf8')
  if (!content || content.trim().length === 0) {
    throw new Error(`Prerender asset failure: ${src} is empty or missing`)
  }
  await writeFile(dest, content, 'utf8')
  console.log(`Guaranteed asset ${staticAsset} copied to dist/ (${content.length} characters)`)
}
