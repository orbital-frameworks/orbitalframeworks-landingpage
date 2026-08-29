import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import CaseStudyPage from './CaseStudyPage.tsx'
import AboutPage from './AboutPage.tsx'
import LegalPage from './LegalPage.tsx'
import { isCaseStudySlug } from './caseStudies'

function resolvePage(pathname: string) {
  if (pathname === '/privacy' || pathname === '/privacy/') return <LegalPage kind="privacy" />
  if (pathname === '/terms' || pathname === '/terms/') return <LegalPage kind="terms" />
  if (pathname === '/sobre-orbital-frameworks' || pathname === '/sobre-orbital-frameworks/') return <AboutPage />
  const match = pathname.match(/^\/casos\/([^/]+)\/?$/)
  const slug = match?.[1]
  if (slug && isCaseStudySlug(slug)) return <CaseStudyPage slug={slug} />
  return <App />
}

export function render(pathname = '/') {
  return renderToString(<StrictMode>{resolvePage(pathname)}</StrictMode>)
}
