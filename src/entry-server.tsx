import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'
import CaseStudyPage from './CaseStudyPage.tsx'
import { isCaseStudySlug } from './caseStudies'

function resolvePage(pathname: string) {
  const match = pathname.match(/^\/casos\/([^/]+)\/?$/)
  const slug = match?.[1]
  if (slug && isCaseStudySlug(slug)) return <CaseStudyPage slug={slug} />
  return <App />
}

export function render(pathname = '/') {
  return renderToString(<StrictMode>{resolvePage(pathname)}</StrictMode>)
}
