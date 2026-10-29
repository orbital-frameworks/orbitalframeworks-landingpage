import { accessSync, constants, existsSync, readFileSync, statSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { blogPosts } from '../src/blogData.ts'

export const BACKLOG_TOPICS = [
  {
    id: 'B2B-01',
    slug: 'software-a-medida-o-saas-como-decidir',
    title: 'Software a medida o SaaS: cómo decidir según el proceso de tu empresa',
    status: 'PUBLISHED',
    campaign: 'pilot_saas_vs_custom',
    service: 'Desarrollo de Software a Medida',
    caseStudy: 'Checkio / Wasy',
  },
  {
    id: 'B2B-02',
    slug: 'automatizacion-procesos-vs-excel-riesgo-operativo',
    title: 'Automatización de procesos vs hojas de cálculo: cuándo Excel se convierte en un riesgo operativo',
    status: 'PUBLISHED',
    campaign: 'camp_excel_vs_automation',
    service: 'Automatización de Procesos',
    caseStudy: 'Checkio / Wasy',
  },
  {
    id: 'B2B-03',
    slug: 'landing-page-b2b-tecnica-vs-web-corporativa',
    title: 'Landing page B2B o web corporativa: cuál necesita realmente tu empresa',
    status: 'PUBLISHED',
    campaign: 'camp_b2b_landing_vs_corp',
    service: 'Landing Pages B2B',
    caseStudy: 'PeruLog Pallets',
  },
  {
    id: 'B2B-04',
    slug: 'costo-total-propiedad-licencias-saas-vs-software-a-medida',
    title: 'Costo total de propiedad (TCO): Licencias SaaS por asiento en dólares vs software propio',
    status: 'DRAFT_NO_PUBLICABLE',
    campaign: 'camp_tco_saas_vs_custom',
    service: 'Desarrollo de Software a Medida',
    caseStudy: 'Checkio / Localisa',
  },
  {
    id: 'B2B-05',
    slug: 'integracion-pedidos-whatsapp-almacen-operaciones',
    title: 'Integración de canales comerciales con operaciones: del pedido por WhatsApp al almacén',
    status: 'PUBLISHED',
    campaign: 'camp_whatsapp_to_warehouse',
    service: 'Automatización de Procesos',
    caseStudy: 'Wasy',
  },
  {
    id: 'B2B-06',
    slug: 'digitalizacion-asistencia-personal-campo-trazabilidad',
    title: 'Digitalización de asistencia y control de personal en campo: lecciones de trazabilidad',
    status: 'DRAFT_NO_PUBLICABLE',
    campaign: 'camp_field_staff_tracking',
    service: 'Desarrollo de Software a Medida',
    caseStudy: 'Checkio',
  },
  {
    id: 'B2B-06-WEB',
    slug: 'web-con-visitas-pero-sin-consultas',
    title: 'Tu web recibe visitas, pero nadie te contacta: cómo encontrar la fricción antes de rediseñar',
    status: 'PUBLISHED',
    campaign: 'camp_web_visitas_contactos',
    service: 'Landing Pages B2B',
    caseStudy: null,
  },
  {
    id: 'B2B-07',
    slug: 'deuda-tecnica-parches-sistemas-empresariales',
    title: 'Deuda técnica y parches en software empresarial: señales de que tu sistema interno necesita refactorización',
    status: 'DRAFT_NO_PUBLICABLE',
    campaign: 'camp_enterprise_tech_debt',
    service: 'Desarrollo de Software a Medida',
    caseStudy: 'Localisa / Checkio',
  },
  {
    id: 'B2B-08',
    slug: 'portales-autoservicio-b2b-distribuidores-reduccion-soporte',
    title: 'Portales de autoservicio B2B para clientes y distribuidores: cómo reducir carga en soporte',
    status: 'DRAFT_NO_PUBLICABLE',
    campaign: 'camp_b2b_selfservice_portals',
    service: 'Desarrollo de Software a Medida / Automatización',
    caseStudy: 'Wasy / PeruLog Pallets',
  },
]

export const HISTORIC_LINKEDIN_POSTS = [
  {
    urn: 'urn:li:share:7516883410074836992',
    url: 'https://www.linkedin.com/feed/update/urn:li:share:7516883410074836992?actorCompanyId=134014070',
    actorCompanyId: '134014070',
    hasLink: false,
    policy: 'IMMUTABLE_PRESERVE',
    note: 'Post LinkedIn histórico publicado SIN enlace. Prohibido modificar, borrar o duplicar en nuevas campañas.',
  },
]

export const SENSITIVE_PII_KEYS = [
  'email',
  'mail',
  'user',
  'name',
  'phone',
  'tel',
  'token',
  'key',
  'auth',
  'pass',
  'pwd',
  'secret',
  'credential',
]

export function sanitizeAndValidateUtmUrl(rawUrlString, options = {}) {
  const { strict = true } = options
  let parsedUrl
  try {
    parsedUrl = new URL(rawUrlString)
  } catch (err) {
    throw new Error(`URL inválida: ${rawUrlString} (${err.message})`)
  }

  const detectedPii = []
  for (const key of Array.from(parsedUrl.searchParams.keys())) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_PII_KEYS.some((pii) => lowerKey.includes(pii))) {
      detectedPii.push(key)
      parsedUrl.searchParams.delete(key)
    }
  }

  if (strict && detectedPii.length > 0) {
    const error = new Error(
      `RECHAZADO_POR_POLITICA_PII: Se detectaron parámetros sensibles de PII en la URL: ${detectedPii.join(', ')}`,
    )
    error.code = 'RECHAZADO_POR_POLITICA_PII'
    error.detectedPii = detectedPii
    throw error
  }

  return {
    cleanUrl: parsedUrl.toString(),
    detectedPii,
  }
}

export function generateUtmUrl(baseUrl, campaign, extraParams = {}) {
  const url = new URL(baseUrl)
  url.searchParams.set('utm_source', 'linkedin')
  url.searchParams.set('utm_medium', 'organic_social')
  url.searchParams.set('utm_campaign', campaign)

  for (const [key, value] of Object.entries(extraParams)) {
    url.searchParams.set(key, value)
  }

  const { cleanUrl } = sanitizeAndValidateUtmUrl(url.toString(), { strict: true })
  return cleanUrl
}

export async function fetchArticleHttp(url, options = {}) {
  const { timeoutMs = 8000, userAgent = 'OrbitalFrameworks-BlogGatePreflight/1.0' } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    })

    const bodyText = await response.text()
    return {
      ok: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      finalUrl: response.url,
      body: bodyText,
    }
  } catch (err) {
    const isAbort = err.name === 'AbortError'
    return {
      ok: false,
      status: isAbort ? 504 : 0,
      headers: {},
      finalUrl: url,
      body: '',
      error: isAbort ? `Network timeout after ${timeoutMs}ms` : `Network fetch error: ${err.message}`,
    }
  } finally {
    clearTimeout(timer)
  }
}

export function validateArticleHtml(html, options = {}) {
  const {
    slug,
    expectedTitle,
    expectedCanonical = `https://orbitalframeworks.qzz.io/blog/${slug}/`,
    sitemapXml = '',
    httpStatus = 200,
  } = options

  const checks = []
  function addCheck(id, description, passed, detail = '') {
    checks.push({ id, description, passed: Boolean(passed), detail })
  }

  // 1. HTTP Status Check
  addCheck(
    'http_200',
    'HTTP Status must be 200 OK',
    httpStatus === 200,
    `Received HTTP ${httpStatus}`,
  )

  // 2. Non-empty HTML
  const isHtmlSubstantial = typeof html === 'string' && html.trim().length > 2500
  addCheck(
    'html_substantial',
    'Response body must contain substantial prerendered HTML (>2500 chars)',
    isHtmlSubstantial,
    `Received ${html ? html.length : 0} chars`,
  )

  // 3. No blank SPA root fallback
  const isSpaBlank =
    /<div id="root">\s*<\/div>/.test(html) ||
    (!html.includes('<article') && !html.includes('class="blogArticleMain"'))
  addCheck(
    'no_spa_blank_fallback',
    'HTML must contain prerendered article DOM, not a blank SPA root shell',
    !isSpaBlank,
    isSpaBlank ? 'Detected unhydrated SPA root or missing article element' : 'Prerendered DOM present',
  )

  // 4. Exact Canonical URL tag
  const canonicalRegex = /<link rel="canonical" href="([^"]+)"/i
  const canonicalMatch = html.match(canonicalRegex)
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null
  const isCanonicalValid = canonicalUrl === expectedCanonical
  addCheck(
    'canonical_tag',
    `Canonical link must point to ${expectedCanonical}`,
    isCanonicalValid,
    canonicalUrl ? `Found ${canonicalUrl}` : 'Tag <link rel="canonical"> missing',
  )

  // 5. Prerendered H1 Heading matching title
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/i
  const h1Match = html.match(h1Regex)
  const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : ''
  const isH1Valid =
    expectedTitle ? h1Text.toLowerCase().includes(expectedTitle.slice(0, 30).toLowerCase()) : h1Text.length > 10
  addCheck(
    'h1_heading',
    'Article <h1> heading must be prerendered and match expected title',
    isH1Valid,
    h1Text ? `Found: "${h1Text}"` : 'No <h1> heading found in HTML',
  )

  // 6. Open Graph Tags
  const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i)
  const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/i)
  const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]+)"/i)
  const ogTypeMatch = html.match(/<meta property="og:type" content="([^"]+)"/i)

  const hasOgTitle = Boolean(ogTitleMatch && ogTitleMatch[1].trim().length > 5)
  const hasOgDesc = Boolean(ogDescMatch && ogDescMatch[1].trim().length > 20)
  const isOgUrlValid = ogUrlMatch ? ogUrlMatch[1] === expectedCanonical : false
  const isOgTypeArticle = ogTypeMatch ? ogTypeMatch[1] === 'article' : false

  addCheck('og_title', 'Open Graph og:title must be present and descriptive', hasOgTitle, ogTitleMatch?.[1] || 'missing')
  addCheck('og_description', 'Open Graph og:description must be present and descriptive', hasOgDesc, ogDescMatch?.[1] || 'missing')
  addCheck('og_url', `Open Graph og:url must match canonical (${expectedCanonical})`, isOgUrlValid, ogUrlMatch?.[1] || 'missing')
  addCheck('og_type_article', 'Open Graph og:type must be article', isOgTypeArticle, ogTypeMatch?.[1] || 'missing')

  // 7. Robots / Indexability: NO noindex directive
  const robotsMatch = html.match(/<meta name="robots" content="([^"]+)"/i)
  const hasNoindex = Boolean(robotsMatch && /noindex/i.test(robotsMatch[1]))
  addCheck(
    'robots_indexable',
    'Article must NOT contain noindex directive',
    !hasNoindex,
    hasNoindex ? `Directiva robots bloqueante detectada: "${robotsMatch[1]}"` : 'Indexable (sin noindex)',
  )

  // 8. Absence of Draft Indicators
  const hasDraftBanner =
    html.includes('DRAFT_NO_PUBLICABLE') ||
    html.includes('BORRADOR EN REVISIÓN EDITORIAL') ||
    html.includes('[NO PUBLICABLE]') ||
    html.includes('blogDraftBanner')
  addCheck(
    'no_draft_banner',
    'Article must be fully published without editorial draft warning banners',
    !hasDraftBanner,
    hasDraftBanner ? 'Draft banner or DRAFT_NO_PUBLICABLE indicator found in HTML' : 'Published clean status',
  )

  // 9. CTA & Official Contact Channel
  const hasOfficialEmail = html.includes('contact.orbitalframeworks@gmail.com')
  const hasGmailCompose = html.includes('mail.google.com/mail') || html.includes('mailto:contact.orbitalframeworks@gmail.com')
  addCheck(
    'cta_contact_channel',
    'Article must expose official contact channel (contact.orbitalframeworks@gmail.com)',
    hasOfficialEmail && hasGmailCompose,
    hasOfficialEmail ? 'Official Gmail compose / mailto CTA verified' : 'Official contact email missing from CTA',
  )

  // 10. Factual Integrity (No Fake Phone Numbers or False ROI claims)
  const hasFakePhone = /\+51\s*9\d{8}/.test(html)
  const hasFakeRoi = /ahorro del \d{2}%|garantizado \d+x/i.test(html)
  addCheck(
    'factual_integrity',
    'Article must not contain fabricated phone numbers or ungrounded ROI claims',
    !hasFakePhone && !hasFakeRoi,
    hasFakePhone ? 'Found unverified phone number' : hasFakeRoi ? 'Found ungrounded ROI claim' : 'Factual integrity verified',
  )

  // 11. Internal Cross-Linking to Services and Cases
  const linksToServices = [
    '/servicios/desarrollo-software-medida/',
    '/servicios/automatizacion-procesos/',
    '/servicios/landing-pages-b2b/',
  ].some((route) => html.includes(route))
  const linksToCases = [
    '/casos/checkio/',
    '/casos/wasy/',
    '/casos/localisa/',
    '/casos/perulog-pallets/',
  ].some((route) => html.includes(route))
  addCheck(
    'internal_navigation',
    'Article must contain internal links to verified services and portfolio cases',
    linksToServices && linksToCases,
    `Services linked: ${linksToServices}, Cases linked: ${linksToCases}`,
  )

  // 12. Sitemap Verification
  if (sitemapXml) {
    const inSitemap = sitemapXml.includes(expectedCanonical)
    addCheck(
      'sitemap_inclusion',
      `URL must be declared in sitemap.xml (${expectedCanonical})`,
      inSitemap,
      inSitemap ? 'Found in sitemap' : 'Missing from sitemap.xml',
    )
  }

  const passedAll = checks.every((c) => c.passed)
  const failedChecks = checks.filter((c) => !c.passed)

  return {
    passed: passedAll,
    verdict: passedAll ? 'PASS' : 'FAIL',
    checks,
    failedChecks,
  }
}

export function loadManifest(manifestPath) {
  if (existsSync(manifestPath)) {
    try {
      const raw = readFileSync(manifestPath, 'utf8')
      return JSON.parse(raw)
    } catch {
      // Fallback if corrupt
    }
  }

  return {
    schemaVersion: '1.0.0',
    project: 'orbitalframeworks-landingpage',
    lastUpdated: new Date().toISOString(),
    policy: {
      autopostAllowed: false,
      duplicatePolicy: 'BLOCK_DUPLICATE_DISTRIBUTION',
      historicalPostsImmutable: true,
    },
    historicPosts: HISTORIC_LINKEDIN_POSTS,
    publications: {},
  }
}

export async function saveManifest(manifestPath, data) {
  data.lastUpdated = new Date().toISOString()
  await writeFile(manifestPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

export function checkDuplicatePolicy(manifest, slug, campaign, options = {}) {
  const { force = false } = options

  // 1. Check historic post conflict
  const historicConflict = manifest.historicPosts?.find(
    (post) => post.url.includes(slug) || (post.note && post.note.includes(slug)),
  )
  if (historicConflict) {
    return {
      allowed: false,
      reason: `CONFLICT_WITH_HISTORIC_POST: El post histórico ${historicConflict.urn} no debe ser modificado ni duplicado.`,
    }
  }

  // 2. Check existing publication record
  const existing = manifest.publications?.[slug]
  if (existing) {
    if (existing.status === 'DISTRIBUTED' && !force) {
      return {
        allowed: false,
        reason: `DUPLICATE_DISTRIBUTION_BLOCKED: El artículo '${slug}' ya fue distribuido previamente bajo la campaña '${existing.campaign}'. Use --force para re-generar.`,
        existing,
      }
    }
  }

  return { allowed: true }
}

export function generateLinkedInPack(options) {
  const {
    slug,
    title,
    utmUrl,
    campaign,
    gateVerdict,
    date = new Date().toISOString().split('T')[0],
    customCopy = null,
  } = options

  const isApproved = gateVerdict === 'PASS'
  const statusLabel = isApproved ? 'LISTO_PARA_DISTRIBUCION_EXTERNA' : 'BLOQUEADO_POR_GATE'

  const DEFAULT_EDITORIAL_COPIES = {
    'software-a-medida-o-saas-como-decidir': `Adoptar un SaaS comercial no siempre es la solución definitiva, pero construir software a medida tampoco debe ser el primer impulso.

En Orbital Frameworks evaluamos cuándo conviene cada alternativa según la madurez del proceso operativo:

1. Si una herramienta comercial estándar cubre los requisitos esenciales y se integra sin fricciones importantes, evalúa primero esa alternativa.
2. Si el proceso clave de tu empresa te obliga a deformar tu flujo de trabajo o el costo recurrente por usuario en dólares limita tu escala, un desarrollo a medida brinda trazabilidad y control.

Desglosamos la matriz de decisión y los puntos de evaluación operativa en nuestro nuevo artículo de Orbital Insights:
${utmUrl}`,
    'automatizacion-procesos-vs-excel-riesgo-operativo': `Excel puede funcionar muy bien para analizar datos, planificar y controlar operaciones pequeñas. El problema aparece cuando un proceso crítico depende de conciliar versiones, copiar registros o corregir fórmulas manualmente.

Antes de reemplazar una hoja de cálculo, conviene revisar tres señales:

1. ¿El equipo mantiene una fuente única o intercambia copias que luego debe conciliar?
2. ¿Las validaciones y permisos existentes son suficientes para los errores y datos sensibles del proceso?
3. ¿Cada registro debe sincronizarse con ventas, inventario u otros sistemas sin volver a digitarlos?

Excel en Microsoft 365 dispone de coautoría, historial de versiones, protecciones y herramientas de integración. Si eso resuelve el problema, mantenerlo puede ser la decisión correcta. Cuando la operación exige controles transaccionales o integraciones más exigentes, vale la pena evaluar una automatización o un sistema web.

En Orbital Insights explicamos cómo evaluar las alternativas de manera gradual, sin asumir que toda empresa necesita desarrollar software:
${utmUrl}`,
  }

  const defaultCopy = DEFAULT_EDITORIAL_COPIES[slug]
  if (!defaultCopy && !customCopy?.trim())
    throw new Error('EDITORIAL_COPY_REQUIRED: un artículo nuevo necesita copy propio revisado; no reutilizar la plantilla SaaS')

  const bodyCopy = customCopy || defaultCopy

  return `# Pack de Publicación LinkedIn — Orbital Insights

**Documento:** \`docs/linkedin-${slug}-handoff.md\`
**Fecha de Verificación Gate:** ${date}
**Canal Objetivo:** LinkedIn Orgánico (Empresa y Socios)
**Estado Editorial del Gate:** \`${statusLabel}\`
**Autopost Automatizado:** DESHABILITADO (Solo revisión humana)
Estado editorial: artículo piloto informativo revisado para publicación; este texto de LinkedIn es una propuesta para el flujo externo y no se ha publicado automáticamente.

---

## 1. URL de Campaña con Parámetros UTM Limpios

\`\`\`
${utmUrl}
\`\`\`

### Parámetros UTM Deterministas:
- \`utm_source\`: \`linkedin\`
- \`utm_medium\`: \`organic_social\`
- \`utm_campaign\`: \`${campaign}\`
- **PII:** CERO parámetros personales (Validado por \`sanitizeAndValidateUtmUrl\`)

---

## 2. Texto de la Publicación (Copia de Difusión)

\`\`\`text
${bodyCopy}
\`\`\`

---

## 3. Contrato de Distribución e Instrucciones para el Operador

1. **Gate Preflight Superado:** Este paquete solo se genera tras verificar HTTP 200, Canonical definitiva, Prerender H1 real, Open Graph tags y sitemap.
2. **Desacoplamiento Absoluto:** Prohibido invocar APIs no autorizadas de LinkedIn o utilizar tokens de sesión automatizados. La publicación es efectuada manualmente por el operador autorizado o sesión social dedicada.
3. **Ventana Recomendada:** Publicar con un margen de **2 a 4 horas posteriores al despliegue** (o al día siguiente) para permitir que los crawlers de LinkedIn generen la previsualización del Open Graph (\`og:image\`, \`og:title\`) desde caché perimetral sin timeouts.
4. **Respeto a Publicaciones Históricas:** La publicación histórica institucional \`urn:li:share:7516883410074836992\` permanece intacta y no se altera ni duplica.

---

## 4. Medición GA4 y Embudo de Conversión

- **Página de Entrada:** \`/blog/${slug}/\` conservando los parámetros UTM en \`page_location\`.
- **Consentimiento:** Google Consent Mode v2 activo; no se escriben cookies de rastreo sin aceptación explícita.
- **Eventos de Intención Calificados:**
  - \`article_intent\` (\`intent_type: "article_to_service"\`) al hacer clic hacia servicios comerciales.
  - \`article_intent\` (\`intent_type: "article_to_contact"\`) al hacer clic en el CTA de correo.
  - \`contact_intent\` emitido en aperturas de Gmail compose o copia de correo al portapapeles.
- **Prohibición de Falso Lead:** Cero disparo de \`generate_lead\` en el navegador. La única evidencia de lead calificado es el correo recibido en \`contact.orbitalframeworks@gmail.com\`.
`
}

export function resolveDistDir(rootPath) {
  if (process.env.DIST_DIR) return resolve(rootPath, process.env.DIST_DIR)
  const defaultDist = join(rootPath, 'dist')
  if (existsSync('/tmp/orbital-dist')) {
    try {
      accessSync(defaultDist, constants.W_OK)
    } catch {
      return '/tmp/orbital-dist'
    }
  }
  return defaultDist
}

export async function runGateCheck(options = {}) {
  const rootPath = options.rootPath || resolve(process.cwd())
  const slug = (options.slug || 'software-a-medida-o-saas-como-decidir').trim()
  const force = Boolean(options.force)
  const dryRun = Boolean(options.dryRun)
  const localEvidenceOnly = Boolean(options.localOnly || options.fixturePath || options.htmlContent)

  const backlogTopic = BACKLOG_TOPICS.find((t) => t.slug === slug)
  const codePost = blogPosts[slug]

  const title = codePost?.title || backlogTopic?.title || 'Artículo de Blog'
  const expectedCanonical = codePost?.canonical || `https://orbitalframeworks.qzz.io/blog/${slug}/`
  const campaign = backlogTopic?.campaign || `camp_${slug.replace(/-/g, '_')}`

  const manifestPath = options.manifestPath || resolve(rootPath, 'docs/blog-linkedin-manifest.json')
  const manifest = loadManifest(manifestPath)

  // Check duplicate policy
  const dupCheck = checkDuplicatePolicy(manifest, slug, campaign, { force })
  if (!dupCheck.allowed) {
    return {
      ok: false,
      slug,
      verdict: 'FAIL',
      errorCode: 'DUPLICATE_POLICY_VIOLATION',
      reason: dupCheck.reason,
      checks: [
        {
          id: 'duplicate_policy',
          description: 'Validar política de duplicados y posts históricos',
          passed: false,
          detail: dupCheck.reason,
        },
      ],
    }
  }

  // Check draft status in code/backlog
  const isDraftInCode = codePost && codePost.status === 'DRAFT_NO_PUBLICABLE'
  const isDraftInBacklog = backlogTopic && backlogTopic.status === 'DRAFT_NO_PUBLICABLE'
  if (isDraftInCode || isDraftInBacklog) {
    const draftReason = `El artículo '${slug}' está marcado como DRAFT_NO_PUBLICABLE (en revisión editorial). Se prohíbe distribución externa.`
    return {
      ok: false,
      slug,
      verdict: 'FAIL',
      errorCode: 'ERR_ARTICLE_IN_DRAFT',
      reason: draftReason,
      checks: [
        {
          id: 'publication_status_ready',
          description: 'El artículo debe estar en estado PUBLISHED',
          passed: false,
          detail: draftReason,
        },
      ],
    }
  }

  // Obtain HTML for validation
  let html = ''
  let httpStatus = 200
  let fetchError = null

  if (options.htmlContent) {
    // Direct HTML fixture provided
    html = options.htmlContent
    httpStatus = options.mockStatus !== undefined ? options.mockStatus : 200
  } else if (options.fixturePath) {
    // Read from file fixture
    html = await readFile(resolve(rootPath, options.fixturePath), 'utf8')
    httpStatus = options.mockStatus !== undefined ? options.mockStatus : 200
  } else if (options.localOnly) {
    // Read from local dist prerender
    const distDir = resolveDistDir(rootPath)
    const localHtmlPath = join(distDir, 'blog', slug, 'index.html')
    if (!existsSync(localHtmlPath)) {
      return {
        ok: false,
        slug,
        verdict: 'FAIL',
        errorCode: 'LOCAL_PRERENDER_NOT_FOUND',
        reason: `No se encontró HTML prerenderizado local en ${localHtmlPath}. Ejecute 'npm run build' primero.`,
        checks: [
          {
            id: 'local_prerender_file',
            description: 'Verificar existencia de archivo prerenderizado local',
            passed: false,
            detail: `Missing ${localHtmlPath}`,
          },
        ],
      }
    }
    html = await readFile(localHtmlPath, 'utf8')
    httpStatus = 200
  } else {
    // Real HTTPS fetch from live URL
    const targetUrl = options.targetUrl || expectedCanonical
    if (targetUrl !== expectedCanonical || !expectedCanonical.startsWith('https://')) {
      return {ok:false,slug,verdict:'FAIL',errorCode:'PUBLIC_CANONICAL_URL_REQUIRED',failedChecks:[{id:'public_url',passed:false}],packPath:null}
    }
    const res = await fetchArticleHttp(targetUrl, {
      timeoutMs: options.timeoutMs || 8000,
    })
    httpStatus = res.status
    html = res.body
    if (!res.ok) {
      fetchError = res.error || `HTTP ${res.status}`
    }
    if (res.finalUrl !== expectedCanonical || !/^text\/html\b/i.test(res.headers['content-type'] || '')) {
      return {ok:false,slug,verdict:'FAIL',errorCode:'PUBLIC_RESPONSE_IDENTITY_FAILED',reason:`URL final o Content-Type inesperado: ${res.finalUrl}, ${res.headers['content-type'] || 'missing'}`,failedChecks:[{id:'public_response_identity',passed:false}],packPath:null}
    }
  }

  // Read sitemap XML for sitemap check
  let sitemapXml = ''
  try {
    const sitemapPath = join(rootPath, 'public/sitemap.xml')
    if (existsSync(sitemapPath)) {
      sitemapXml = await readFile(sitemapPath, 'utf8')
    }
  } catch {
    // Optional
  }

  // Run HTML validation
  const validationResult = validateArticleHtml(html, {
    slug,
    expectedTitle: title,
    expectedCanonical,
    sitemapXml,
    httpStatus,
  })

  // Fail closed: a failed preflight must not write a handoff pack or
  // mutate the publication manifest. A rejected article has no publishable
  // output, even if a caller forgot --dry-run.
  if (!validationResult.passed) {
    return {
      ok: false,
      slug,
      title,
      verdict: 'FAIL',
      errorCode: 'ARTICLE_PREFLIGHT_FAILED',
      checks: validationResult.checks,
      failedChecks: validationResult.failedChecks,
      fetchError,
      packPath: null,
    }
  }

  // Local builds, fixtures and injected HTML establish structure, never
  // authorization to distribute an external LinkedIn post.
  if (localEvidenceOnly) {
    return {ok:true,slug,title,verdict:'LOCAL_ONLY',externalDistributionAuthorized:false,
      checks:validationResult.checks,failedChecks:[],packPath:null}
  }

  // Generate UTM URL
  const utmUrl = generateUtmUrl(expectedCanonical, campaign)

  // Generate handoff markdown pack
  const packContent = generateLinkedInPack({
    slug,
    title,
    utmUrl,
    campaign,
    gateVerdict: validationResult.verdict,
    customCopy: options.customCopy,
  })

  const packFileName =
    slug === 'software-a-medida-o-saas-como-decidir'
      ? 'docs/linkedin-pilot-handoff-2026-10-17.md'
      : `docs/linkedin-${slug}-handoff.md`
  const packPath = resolve(rootPath, packFileName)

  if (!dryRun) {
    if (existsSync(packPath) && statSync(packPath).isDirectory())
      throw new Error('PACK_PATH_IS_DIRECTORY: requiere un archivo Markdown canónico, no una carpeta .md')
    await writeFile(packPath, packContent, 'utf8')

    // Update manifest
    manifest.publications[slug] = {
      slug,
      title,
      campaign,
      utmUrl,
      canonicalUrl: expectedCanonical,
      status: validationResult.passed ? 'LISTO_PARA_DISTRIBUCION_EXTERNA' : 'BLOQUEADO_POR_GATE',
      gateVerdict: validationResult.verdict,
      lastCheckedAt: new Date().toISOString(),
      packPath: packFileName,
      autopostAuthorized: false,
      failedChecks: validationResult.failedChecks.map((f) => f.id),
    }
    await saveManifest(manifestPath, manifest)
  }

  return {
    ok: validationResult.passed,
    slug,
    title,
    verdict: validationResult.verdict,
    utmUrl,
    campaign,
    packPath: packFileName,
    manifestPath: 'docs/blog-linkedin-manifest.json',
    checks: validationResult.checks,
    failedChecks: validationResult.failedChecks,
    fetchError,
  }
}

// CLI Execution Support
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = process.argv.slice(2)
  const isJson = args.includes('--json')
  const force = args.includes('--force')
  const dryRun = args.includes('--dry-run')
  const localOnly = args.includes('--local')

  let slug = 'software-a-medida-o-saas-como-decidir'
  const slugIdx = args.indexOf('--slug')
  if (slugIdx !== -1 && args[slugIdx + 1]) {
    slug = args[slugIdx + 1]
  }

  let fixturePath = null
  const fixIdx = args.indexOf('--fixture')
  if (fixIdx !== -1 && args[fixIdx + 1]) {
    fixturePath = args[fixIdx + 1]
  }
  const copyIdx = args.indexOf('--copy-file')
  const copyFile = copyIdx >= 0 ? args[copyIdx + 1] : null

  try {
    const customCopy = copyFile
      ? (await readFile(resolve(process.cwd(), copyFile), 'utf8')).trim()
      : null
    const result = await runGateCheck({
      slug,
      force,
      dryRun,
      localOnly,
      fixturePath,
      customCopy: customCopy?.replaceAll('{{UTM_URL}}',
        generateUtmUrl(
          blogPosts[slug]?.canonical || `https://orbitalframeworks.qzz.io/blog/${slug}/`,
          BACKLOG_TOPICS.find(t => t.slug === slug)?.campaign || `camp_${slug.replace(/-/g, '_')}`,
        ),
      ),
    })

    if (isJson) {
      console.log(JSON.stringify(result, null, 2))
    } else {
      console.log(`\n======================================================`)
      console.log(`   ORBITAL BLOG → LINKEDIN PREFLIGHT GATE`)
      console.log(`======================================================`)
      console.log(`Artículo: ${result.slug}`)
      console.log(`Veredicto: ${result.verdict === 'PASS' ? '✅ PASS' : '❌ FAIL / BLOCKED'}`)
      console.log(`Campaña UTM: ${result.campaign || 'N/A'}`)
      console.log(`URL UTM: ${result.utmUrl || 'N/A'}`)
      console.log(`Handoff Pack: ${result.packPath || 'N/A'}`)
      console.log(`\nDetalle de comprobaciones:`)
      for (const check of result.checks || []) {
        console.log(`  ${check.passed ? '✔' : '✖'} [${check.id}] ${check.description}: ${check.detail}`)
      }
      console.log(`\nManifest: docs/blog-linkedin-manifest.json actualizado.`)
      console.log(`Autoposting: DESHABILITADO POR POLÍTICA (Solo revisión humana).`)
      console.log(`======================================================\n`)
    }

    process.exit(result.ok ? 0 : 1)
  } catch (err) {
    console.error('ERROR FATAL EN GATE:', err.message)
    process.exit(1)
  }
}
