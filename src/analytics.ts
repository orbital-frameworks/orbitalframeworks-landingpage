declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
  }
}

// GA4 Measurement ID is public (not a secret). Allow a deployment override,
// but keep the owner's verified web stream enabled in a clean Amplify build.
const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID?.trim() || 'G-487MJFCW45'
const clarityProjectId = import.meta.env?.VITE_CLARITY_PROJECT_ID?.trim() || ''
const consentKey = 'orbital-analytics-consent'

export type LaneId = 'b2b_ops' | 'product_idea'

export interface TelemetryPayload {
  event: 'section_dwell' | 'scroll_depth' | 'lane_selection' | 'contact_intent' | 'page_view'
  path: string
  timestamp: number
  depth?: number
  lane?: LaneId
  dwell_ms?: number
  section_id?: string
  sections?: Record<string, number>
  method?: string
  channel?: string
  meta?: Record<string, unknown>
}

function gtag(...args: unknown[]) {
  window.dataLayer ??= []
  void args // Preserve the typed public signature while using Google's Arguments queue.
  // Google tag commands must be Arguments objects, not plain arrays.
  // Arrays look correct in DevTools but are silently ignored by gtag.js.
  // eslint-disable-next-line prefer-rest-params -- gtag.js requires the actual Arguments object.
  window.dataLayer.push(arguments)
}

export function isAnalyticsConfigured() {
  return Boolean(measurementId)
}

export function isClarityConfigured() {
  return Boolean(clarityProjectId)
}

export function hasAnalyticsConsent() {
  return Boolean((measurementId || clarityProjectId) && localStorage.getItem(consentKey) !== null)
}

export function isConsentGranted() {
  return Boolean((measurementId || clarityProjectId) && localStorage.getItem(consentKey) === 'granted')
}

// Session-level journey tracking (pure in-memory, no unconsented storage, no PII)
const sessionJourney = {
  entryArticle: '',
  visitedService: '',
}

export function recordFunnelStep(step: 'article' | 'service', slug: string) {
  if (step === 'article') {
    sessionJourney.entryArticle = slug
  } else if (step === 'service') {
    sessionJourney.visitedService = slug
  }
}

export function getSessionJourney() {
  return { ...sessionJourney }
}

// First-Party Attention Map & Telemetry (Zero Cookies, Zero PII, 100% of visits)
let currentSelectedLane: LaneId | null = null
const reachedScrollMilestones = new Set<number>()
const sectionDwellTimes: Record<string, number> = {}
const activeSectionTimestamps: Record<string, number> = {}
let attentionObserver: IntersectionObserver | null = null
let attentionMapInitialized = false

export function getSelectedLane(): LaneId | null {
  return currentSelectedLane
}

export function getSectionDwellTimes(): Record<string, number> {
  return { ...sectionDwellTimes }
}

export function sendTelemetry(payload: TelemetryPayload | TelemetryPayload[]): boolean {
  if (typeof window === 'undefined') return false
  const endpoint = '/api/telemetry'
  const body = JSON.stringify(payload)

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      if (navigator.sendBeacon(endpoint, blob)) {
        return true
      }
    }
  } catch {
    // Fall back to fetch keepalive
  }

  try {
    if (typeof fetch === 'function') {
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // Silently tolerate endpoint absence in local dev or static preview
      })
      return true
    }
  } catch {
    // Silently ignore
  }

  return false
}

export function trackLaneSelection(lane: LaneId, meta?: Record<string, unknown>) {
  currentSelectedLane = lane
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'

  sendTelemetry({
    event: 'lane_selection',
    path,
    timestamp: Date.now(),
    lane,
    meta,
  })

  if (measurementId && isConsentGranted()) {
    gtag('event', 'select_lane', {
      lane,
      source_page: path,
      ...meta,
    })
  }
}

export function trackAttentionEvent(event: string, data?: Record<string, unknown>) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  sendTelemetry({
    event: 'section_dwell',
    path,
    timestamp: Date.now(),
    lane: currentSelectedLane || undefined,
    meta: {
      attention_event: event,
      ...data,
    },
  })
}

export function flushAttentionMetrics() {
  if (typeof window === 'undefined') return
  const now = Date.now()

  // Flush in-flight active sections
  for (const [sectionId, startTime] of Object.entries(activeSectionTimestamps)) {
    if (startTime > 0) {
      const elapsed = now - startTime
      sectionDwellTimes[sectionId] = (sectionDwellTimes[sectionId] || 0) + elapsed
      activeSectionTimestamps[sectionId] = now // Reset anchor for continuing views
    }
  }

  const keys = Object.keys(sectionDwellTimes)
  if (keys.length > 0) {
    sendTelemetry({
      event: 'section_dwell',
      path: window.location.pathname,
      timestamp: now,
      sections: { ...sectionDwellTimes },
      lane: currentSelectedLane || undefined,
    })
  }
}

function checkScrollMilestones() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const docEl = document.documentElement
  const docHeight = docEl.scrollHeight - window.innerHeight
  if (docHeight <= 0) return

  const scrollY = window.scrollY || window.pageYOffset || docEl.scrollTop
  const percent = Math.min(100, Math.round((scrollY / docHeight) * 100))
  const milestones = [25, 50, 75, 100] as const

  for (const milestone of milestones) {
    if (percent >= milestone && !reachedScrollMilestones.has(milestone)) {
      reachedScrollMilestones.add(milestone)
      sendTelemetry({
        event: 'scroll_depth',
        path: window.location.pathname,
        timestamp: Date.now(),
        depth: milestone,
        lane: currentSelectedLane || undefined,
      })
    }
  }
}

function handleIntersection(entries: IntersectionObserverEntry[]) {
  const now = Date.now()
  for (const entry of entries) {
    const target = entry.target as HTMLElement
    const sectionId = target.id || target.dataset.section || target.tagName.toLowerCase()
    if (!sectionId) continue

    if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
      if (!activeSectionTimestamps[sectionId]) {
        activeSectionTimestamps[sectionId] = now
      }
    } else {
      if (activeSectionTimestamps[sectionId]) {
        const dwell = now - activeSectionTimestamps[sectionId]
        sectionDwellTimes[sectionId] = (sectionDwellTimes[sectionId] || 0) + dwell
        delete activeSectionTimestamps[sectionId]

        if (dwell >= 1000) {
          sendTelemetry({
            event: 'section_dwell',
            path: typeof window !== 'undefined' ? window.location.pathname : '/',
            timestamp: now,
            section_id: sectionId,
            dwell_ms: dwell,
            lane: currentSelectedLane || undefined,
          })
        }
      }
    }
  }
}

function handleVisibilityChange() {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    flushAttentionMetrics()
  }
}

export function initAttentionMap(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }
  if (attentionMapInitialized) {
    return () => {}
  }
  attentionMapInitialized = true

  reachedScrollMilestones.clear()

  let scrollPending = false
  const onScroll = () => {
    if (!scrollPending) {
      scrollPending = true
      requestAnimationFrame(() => {
        checkScrollMilestones()
        scrollPending = false
      })
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  if (typeof IntersectionObserver !== 'undefined') {
    attentionObserver = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
    })

    const observeElements = () => {
      const targets = document.querySelectorAll('section, main > div[id], [data-section], footer, header')
      targets.forEach((el) => attentionObserver?.observe(el))
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', observeElements, { once: true })
    } else {
      observeElements()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('pagehide', flushAttentionMetrics)
  window.addEventListener('beforeunload', flushAttentionMetrics)

  setTimeout(checkScrollMilestones, 150)

  return () => {
    attentionMapInitialized = false
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('pagehide', flushAttentionMetrics)
    window.removeEventListener('beforeunload', flushAttentionMetrics)
    attentionObserver?.disconnect()
    attentionObserver = null
  }
}

function sanitizeUrl(urlString: string): string {
  try {
    const url = new URL(urlString)
    // Strip sensitive parameters that could contain PII while strictly preserving UTM campaign tags
    const piiKeys = ['email', 'mail', 'user', 'name', 'phone', 'tel', 'token', 'key', 'auth', 'pass', 'pwd']
    for (const key of Array.from(url.searchParams.keys())) {
      if (piiKeys.some((p) => key.toLowerCase().includes(p))) {
        url.searchParams.delete(key)
      }
    }
    return url.toString()
  } catch {
    return urlString
  }
}

// Deduplication cache: prevent double-firing identical events within 250ms
let lastEventKey = ''
let lastEventTime = 0

function isDuplicateEvent(eventKey: string, cooldownMs = 250): boolean {
  const now = Date.now()
  if (eventKey === lastEventKey && now - lastEventTime < cooldownMs) {
    return true
  }
  lastEventKey = eventKey
  lastEventTime = now
  return false
}

function extractSlug(path: string, prefix: string): string {
  const rest = path.slice(prefix.length).replace(/\/$/, '')
  return rest.split('/')[0] || ''
}

export function trackPageView(pathname?: string, title?: string) {
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')

  if (currentPath.startsWith('/blog/')) {
    const slug = extractSlug(currentPath, '/blog/')
    if (slug) recordFunnelStep('article', slug)
  } else if (currentPath.startsWith('/servicios/')) {
    const slug = extractSlug(currentPath, '/servicios/')
    if (slug) recordFunnelStep('service', slug)
  }

  // First-party page_view telemetry (zero cookies, zero PII)
  sendTelemetry({
    event: 'page_view',
    path: currentPath,
    timestamp: Date.now(),
    lane: currentSelectedLane || undefined,
  })

  // Reset scroll milestones on new page view
  reachedScrollMilestones.clear()

  if (!measurementId || !isConsentGranted()) return

  const safeLocation = typeof window !== 'undefined' ? sanitizeUrl(window.location.href) : undefined
  const safeReferrer = (typeof document !== 'undefined' && document.referrer) ? sanitizeUrl(document.referrer) : undefined

  gtag('event', 'page_view', {
    page_location: safeLocation,
    page_path: currentPath,
    page_title: title || (typeof document !== 'undefined' ? document.title : ''),
    page_referrer: safeReferrer || undefined,
  })
}

export interface ContactIntentContext {
  source_page?: string
  article_slug?: string
  service_slug?: string
  lane?: LaneId
}

export function trackContactIntent(
  method: 'email' | 'gmail' | 'copy_email',
  context?: ContactIntentContext,
) {
  const sourcePath = context?.source_page || (typeof window !== 'undefined' ? window.location.pathname : '')
  const isFromBlog = sourcePath.startsWith('/blog/') || Boolean(sessionJourney.entryArticle)
  const isFromService = sourcePath.startsWith('/servicios/') || Boolean(sessionJourney.visitedService)
  const effectiveLane = context?.lane || currentSelectedLane || undefined

  // First-Party telemetry: ALWAYS emitted on contact intent (zero cookies, zero PII, 100% of visits)
  sendTelemetry({
    event: 'contact_intent',
    path: sourcePath || '/',
    timestamp: Date.now(),
    method,
    channel: method === 'gmail' ? 'gmail_compose' : method === 'copy_email' ? 'clipboard' : 'mailto',
    lane: effectiveLane,
    meta: {
      funnel_origin: isFromBlog ? (context?.article_slug || sessionJourney.entryArticle || 'blog') : undefined,
      service_context: isFromService ? (context?.service_slug || sessionJourney.visitedService || 'service') : undefined,
    },
  })

  // GA4 event: requires user consent
  if (!measurementId || !isConsentGranted()) return
  const eventKey = `contact_intent:${method}:${sourcePath}`
  if (isDuplicateEvent(eventKey)) return

  // Opening a mail composer or copying an address is an intent, not a lead.
  // Never report generate_lead without confirmed submission/receipt.
  gtag('event', 'contact_intent', {
    method,
    contact_channel: method === 'gmail' ? 'gmail_compose' : method === 'copy_email' ? 'clipboard' : 'mailto',
    source_path: sourcePath || undefined,
    funnel_origin: isFromBlog ? (context?.article_slug || sessionJourney.entryArticle || 'blog') : undefined,
    service_context: isFromService ? (context?.service_slug || sessionJourney.visitedService || 'service') : undefined,
    lane: effectiveLane,
  })
}

export function trackCaseNavigation(itemLocation: string) {
  if (!measurementId || !isConsentGranted()) return
  gtag('event', 'view_item', {
    item_category: 'case_study',
    item_location: itemLocation,
  })
}

export function trackProductClick(itemHostname: string) {
  if (!measurementId || !isConsentGranted()) return
  gtag('event', 'select_content', {
    content_type: 'live_product',
    item_id: itemHostname,
  })
}

export function trackArticleIntent(
  type: 'article_to_service' | 'article_to_contact',
  target: string,
  articleSlug = 'software-a-medida-o-saas-como-decidir',
) {
  if (!measurementId || !isConsentGranted()) return
  const eventKey = `article_intent:${type}:${target}:${articleSlug}`
  if (isDuplicateEvent(eventKey)) return

  gtag('event', 'article_intent', {
    intent_type: type,
    target,
    article_slug: articleSlug,
  })
}

export function trackServiceIntent(
  type: 'service_to_contact' | 'service_to_service',
  target: string,
  serviceSlug?: string,
) {
  if (!measurementId || !isConsentGranted()) return
  const eventKey = `service_intent:${type}:${target}:${serviceSlug || ''}`
  if (isDuplicateEvent(eventKey)) return

  gtag('event', 'service_intent', {
    intent_type: type,
    target,
    service_slug: serviceSlug,
    from_article: sessionJourney.entryArticle || undefined,
  })
}

function handlePopState() {
  trackPageView()
}

function trackClick(event: MouseEvent) {
  if (!isConsentGranted()) return
  const target = event.target as Element | null

  // 1. Handle anchor links
  const link = target?.closest('a')
  if (link) {
    const href = link.href
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    const isFromBlog = currentPath.startsWith('/blog/')
    const isFromService = currentPath.startsWith('/servicios/')
    const currentBlogSlug = isFromBlog ? extractSlug(currentPath, '/blog/') : ''
    const currentServiceSlug = isFromService ? extractSlug(currentPath, '/servicios/') : ''

    if (href.startsWith('mailto:')) {
      trackContactIntent('email', {
        source_page: currentPath,
        article_slug: currentBlogSlug || undefined,
        service_slug: currentServiceSlug || undefined,
      })
      if (isFromBlog) {
        trackArticleIntent('article_to_contact', 'mailto', currentBlogSlug || undefined)
      } else if (isFromService) {
        trackServiceIntent('service_to_contact', 'mailto', currentServiceSlug || undefined)
      }
      return
    }

    if (href.startsWith('https://mail.google.com/')) {
      trackContactIntent('gmail', {
        source_page: currentPath,
        article_slug: currentBlogSlug || undefined,
        service_slug: currentServiceSlug || undefined,
      })
      if (isFromBlog) {
        trackArticleIntent('article_to_contact', 'gmail', currentBlogSlug || undefined)
      } else if (isFromService) {
        trackServiceIntent('service_to_contact', 'gmail', currentServiceSlug || undefined)
      }
      return
    }

    try {
      const url = new URL(href, window.location.href)
      if (url.origin === window.location.origin) {
        if (isFromBlog && url.pathname.startsWith('/servicios/')) {
          trackArticleIntent('article_to_service', url.pathname, currentBlogSlug || undefined)
        }
        if (
          url.pathname.startsWith('/casos/') ||
          url.pathname === '/evidencia/' ||
          url.pathname === '/sobre-orbital-frameworks/' ||
          url.pathname.startsWith('/servicios/') ||
          url.pathname.startsWith('/blog/')
        ) {
          trackCaseNavigation(url.pathname)
        }
      } else if (link.classList.contains('caseProductCta')) {
        trackProductClick(url.hostname)
      }
    } catch {
      // Ignore invalid URLs
    }
    return
  }

  // Copy-email is tracked once, by the click handler in App.tsx, and only
  // after navigator.clipboard.writeText() actually succeeds.
}

function loadClarity() {
  if (!clarityProjectId || typeof document === 'undefined') return
  if (document.querySelector(`script[data-clarity-id="${clarityProjectId}"]`)) return

  window.clarity = window.clarity || function (...args: unknown[]) {
    const q = ((window.clarity as unknown as { q?: unknown[] }).q ??= [])
    q.push(args)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`
  script.dataset.clarityId = clarityProjectId
  document.head.append(script)

  // Configure Microsoft Clarity with sensitive input masking for user privacy
  window.clarity('mask', 'input')
}

export function grantAnalyticsConsent() {
  if (!measurementId && !clarityProjectId) return
  localStorage.setItem(consentKey, 'granted')
  if (measurementId) {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
    })
    loadAnalytics()
  }
  loadClarity()
}

export function denyAnalyticsConsent() {
  localStorage.setItem(consentKey, 'denied')
  if (measurementId) {
    gtag('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  }
}

function loadAnalytics() {
  if (!measurementId || document.querySelector(`script[data-ga4-id="${measurementId}"]`)) return
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  script.dataset.ga4Id = measurementId
  document.head.append(script)

  gtag('js', new Date())
  gtag('config', measurementId, { send_page_view: false })
  trackPageView()

  document.removeEventListener('click', trackClick)
  document.addEventListener('click', trackClick)
  window.removeEventListener('popstate', handlePopState)
  window.addEventListener('popstate', handlePopState)
}

export function initializeAnalytics() {
  // Always initialize first-party attention telemetry (zero cookies, zero PII)
  initAttentionMap()

  if (!measurementId && !clarityProjectId) return

  if (measurementId) {
    window.gtag = gtag
    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    gtag('set', {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      restricted_data_processing: true,
    })
  }

  if (localStorage.getItem(consentKey) === 'granted') {
    if (measurementId) loadAnalytics()
    loadClarity()
  }
}
