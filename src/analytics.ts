declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || undefined
const consentKey = 'orbital-analytics-consent'

function gtag(...args: unknown[]) {
  window.dataLayer ??= []
  window.dataLayer.push(args)
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

export function trackPageView(pathname?: string, title?: string) {
  if (!measurementId || !isConsentGranted()) return
  gtag('event', 'page_view', {
    page_location: window.location.href,
    page_path: pathname || window.location.pathname,
    page_title: title || document.title,
    page_referrer: document.referrer || undefined,
  })
}

export function trackContactIntent(method: 'email' | 'gmail' | 'copy_email') {
  if (!measurementId || !isConsentGranted()) return
  gtag('event', 'generate_lead', {
    method,
    contact_channel: method === 'gmail' ? 'gmail_compose' : method === 'copy_email' ? 'clipboard' : 'mailto',
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
    if (href.startsWith('mailto:')) {
      trackContactIntent('email')
      return
    }
    if (href.startsWith('https://mail.google.com/')) {
      trackContactIntent('gmail')
      return
    }
    try {
      const url = new URL(href, window.location.href)
      if (url.origin === window.location.origin) {
        if (
          url.pathname.startsWith('/casos/') ||
          url.pathname === '/evidencia/' ||
          url.pathname === '/sobre-orbital-frameworks/'
        ) {
          trackCaseNavigation(url.pathname)
        }
      } else if (link.classList.contains('caseProductCta') || link.relList.contains('noopener')) {
        trackProductClick(url.hostname)
      }
    } catch {
      // Ignore invalid URLs
    }
    return
  }

  // 2. Handle buttons (e.g. email copy button)
  const button = target?.closest('button')
  if (button && (button.dataset.analyticsAction === 'copy_email' || button.textContent?.includes('Copiar correo'))) {
    trackContactIntent('copy_email')
  }
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
