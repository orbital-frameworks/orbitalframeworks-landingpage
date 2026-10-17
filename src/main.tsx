import { StrictMode } from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import CaseStudyPage from './CaseStudyPage.tsx'
import AboutPage from './AboutPage.tsx'
import LegalPage from './LegalPage.tsx'
import OAuthAppPage from './OAuthAppPage.tsx'
import ProofHubPage from './ProofHubPage.tsx'
import NotFoundPage from './NotFoundPage.tsx'
import ServicePage from './ServicePage.tsx'
import BlogIndexPage from './BlogIndexPage.tsx'
import BlogPostPage from './BlogPostPage.tsx'
import AnalyticsConsent from './AnalyticsConsent.tsx'
import { initializeAnalytics } from './analytics.ts'
import { isCaseStudySlug } from './caseStudies'
import { isServiceSlug } from './servicesData'
import { isBlogPostSlug } from './blogData'

function resolvePage(pathname: string) {
  const p = pathname.replace(/\/+$/, '') || '/'
  if (p === '/privacy') return <LegalPage kind="privacy" />
  if (p === '/terms') return <LegalPage kind="terms" />
  if (p === '/orbital-leads-gmail') return <OAuthAppPage />
  if (p === '/sobre-orbital-frameworks') return <AboutPage />
  if (p === '/evidencia') return <ProofHubPage />
  if (p === '/blog') return <BlogIndexPage />
  const blogMatch = p.match(/^\/blog\/([^/]+)$/)
  const blogSlug = blogMatch?.[1]
  if (blogSlug && isBlogPostSlug(blogSlug)) return <BlogPostPage slug={blogSlug} />
  if (p === '/404' || p === '/404.html') return <NotFoundPage />
  const serviceMatch = p.match(/^\/servicios\/([^/]+)$/)
  const serviceSlug = serviceMatch?.[1]
  if (serviceSlug && isServiceSlug(serviceSlug)) return <ServicePage slug={serviceSlug} />
  const match = p.match(/^\/casos\/([^/]+)$/)
  const slug = match?.[1]
  if (slug && isCaseStudySlug(slug)) return <CaseStudyPage slug={slug} />
  if (p === '/' || p === '/index.html') return <App />
  return <NotFoundPage />
}

const root = document.getElementById('root')!
initializeAnalytics()
const app = <StrictMode>{resolvePage(window.location.pathname)}<AnalyticsConsent /></StrictMode>

if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
