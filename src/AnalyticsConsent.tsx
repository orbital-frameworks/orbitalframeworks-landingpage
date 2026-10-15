import { useState, useSyncExternalStore } from 'react'
import { denyAnalyticsConsent, grantAnalyticsConsent, hasAnalyticsConsent, isAnalyticsConfigured } from './analytics'

const emptySubscribe = () => () => {}

export default function AnalyticsConsent() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false)
  const [dismissed, setDismissed] = useState(false)

  if (!isClient || !isAnalyticsConfigured() || hasAnalyticsConsent() || dismissed) {
    return null
  }

  const respond = (granted: boolean) => {
    if (granted) grantAnalyticsConsent()
    else denyAnalyticsConsent()
    setDismissed(true)
  }

  return (
    <aside className="analyticsConsent" aria-label="Preferencias de analítica">
      <p>Usamos analítica de medición solo con tu autorización para entender la navegación y los contactos.</p>
      <a href="/privacy">Más información</a>
      <div>
        <button type="button" onClick={() => respond(false)}>No aceptar</button>
        <button type="button" onClick={() => respond(true)}>Aceptar analítica</button>
      </div>
    </aside>
  )
}
