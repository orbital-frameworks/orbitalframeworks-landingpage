import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import CaseStudyPage from './CaseStudyPage.tsx'
import AboutPage from './AboutPage.tsx'
import LegalPage from './LegalPage.tsx'
import OAuthAppPage from './OAuthAppPage.tsx'
import ProofHubPage from './ProofHubPage.tsx'
import NotFoundPage from './NotFoundPage.tsx'
import { isCaseStudySlug } from './caseStudies'

function resolvePage(pathname: string) {
  const p = pathname.replace(/\/+$/, '') || '/'
  if (p === '/privacy') return <LegalPage kind="privacy" />
  if (p === '/terms') return <LegalPage kind="terms" />
  if (p === '/orbital-leads-gmail') return <OAuthAppPage />
  if (p === '/sobre-orbital-frameworks') return <AboutPage />
  if (p === '/evidencia') return <ProofHubPage />
  if (p === '/404' || p === '/404.html') return <NotFoundPage />
  const match = p.match(/^\/casos\/([^/]+)$/)
  const slug = match?.[1]
  if (slug && isCaseStudySlug(slug)) return <CaseStudyPage slug={slug} />
  if (p === '/' || p === '/index.html') return <App />
  return <NotFoundPage />
}

export function render(pathname = '/') {
  return renderToString(<StrictMode>{resolvePage(pathname)}</StrictMode>)
}
