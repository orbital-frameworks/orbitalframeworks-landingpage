declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

// GA4 Measurement ID is public (not a secret). Allow a deployment override,
// but keep the owner's verified web stream enabled in a clean Amplify build.
const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID?.trim() || 'G-487MJFCW45'
const consentKey = 'orbital-analytics-consent'

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

export function hasAnalyticsConsent() {
  return Boolean(measurementId && localStorage.getItem(consentKey) !== null)
}

export function isConsentGranted() {
  return Boolean(measurementId && localStorage.getItem(consentKey) === 'granted')
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
  if (!measurementId || !isConsentGranted()) return
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')

  if (currentPath.startsWith('/blog/')) {
    const slug = extractSlug(currentPath, '/blog/')
    if (slug) recordFunnelStep('article', slug)
  } else if (currentPath.startsWith('/servicios/')) {
    const slug = extractSlug(currentPath, '/servicios/')
    if (slug) recordFunnelStep('service', slug)
  }

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
}

export function trackContactIntent(
  method: 'email' | 'gmail' | 'copy_email',
  context?: ContactIntentContext,
) {
  if (!measurementId || !isConsentGranted()) return
  const eventKey = `contact_intent:${method}:${context?.source_page || ''}`
  if (isDuplicateEvent(eventKey)) return

  const sourcePath = context?.source_page || (typeof window !== 'undefined' ? window.location.pathname : '')
  const isFromBlog = sourcePath.startsWith('/blog/') || Boolean(sessionJourney.entryArticle)
  const isFromService = sourcePath.startsWith('/servicios/') || Boolean(sessionJourney.visitedService)

  // Opening a mail composer or copying an address is an intent, not a lead.
  // Never report generate_lead without confirmed submission/receipt.
  gtag('event', 'contact_intent', {
    method,
    contact_channel: method === 'gmail' ? 'gmail_compose' : method === 'copy_email' ? 'clipboard' : 'mailto',
    source_path: sourcePath || undefined,
    funnel_origin: isFromBlog ? (context?.article_slug || sessionJourney.entryArticle || 'blog') : undefined,
    service_context: isFromService ? (context?.service_slug || sessionJourney.visitedService || 'service') : undefined,
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

export function grantAnalyticsConsent() {
  if (!measurementId) return
  localStorage.setItem(consentKey, 'granted')
  gtag('consent', 'update', {
    analytics_storage: 'granted',
  })
  loadAnalytics()
}

export function denyAnalyticsConsent() {
  localStorage.setItem(consentKey, 'denied')
  gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
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
  if (!measurementId) return
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
  if (localStorage.getItem(consentKey) === 'granted') {
    loadAnalytics()
  }
}
