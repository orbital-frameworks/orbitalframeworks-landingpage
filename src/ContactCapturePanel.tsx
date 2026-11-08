import { useState, useId, type FormEvent } from 'react'
import {
  trackContactIntent,
  trackLaneSelection,
  getSelectedLane,
  type LaneId,
} from './analytics'

export type UxState =
  | 'initial'
  | 'loading'
  | 'success'
  | 'error'
  | 'empty'
  | 'partial_degraded'
  | 'retry'
  | 'duplicated_action'
  | 'invalid_input'
  | 'offline'
  | 'access_guidance'

export interface ContactCapturePanelProps {
  id?: string
  initialLane?: LaneId
  sourcePage?: string
  articleSlug?: string
  serviceSlug?: string
  headline?: string
  subheadline?: string
  compact?: boolean
  gmailLabel?: string
  customSubject?: string
  customBody?: string
  onCopyEmail?: () => Promise<boolean> | boolean
}

const EMAIL = 'contact.orbitalframeworks@gmail.com'
const enc = encodeURIComponent

const LANE_INFO: Record<LaneId, { tag: string; title: string; desc: string; subj: string; body: string }> = {
  b2b_ops: {
    tag: 'Carril A · Empresas',
    title: 'Mejorar u ordenar procesos',
    desc: 'Sistemas a medida y automatizaciones',
    subj: 'Consulta operativa - Orbital Frameworks',
    body: 'Empresa:\nProceso a mejorar:\nResultado esperado:\n',
  },
  product_idea: {
    tag: 'Carril B · Nuevos Productos',
    title: 'Desarrollar una idea de app o web',
    desc: 'De la idea al producto real (Wasy, Localisa, Checkio)',
    subj: 'Idea de producto digital - Orbital Frameworks',
    body: 'Idea o producto:\nProblema a resolver:\nObjetivo:\n',
  },
}

export default function ContactCapturePanel({
  id,
  initialLane,
  sourcePage = '/',
  articleSlug,
  serviceSlug,
  headline,
  subheadline,
  compact = false,
  gmailLabel = 'Abrir en Gmail ↗',
  customSubject,
  customBody,
  onCopyEmail,
}: ContactCapturePanelProps) {
  const [lane, setLane] = useState<LaneId>(() => initialLane || getSelectedLane() || 'b2b_ops')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [hp, setHp] = useState('')
  const [uxState, setUxState] = useState<UxState>('initial')
  const [statusMsg, setStatusMsg] = useState('')
  const [leadId, setLeadId] = useState('')
  const [copied, setCopied] = useState(false)
  const [lastSub, setLastSub] = useState('')

  const inputId = useId()
  const msgId = useId()

  const handleLaneChange = (l: LaneId) => {
    setLane(l)
    trackLaneSelection(l, { source_page: sourcePage, article_slug: articleSlug, service_slug: serviceSlug })
    if (uxState === 'empty' || uxState === 'invalid_input') {
      setUxState('initial')
      setStatusMsg('')
    }
  }

  const info = LANE_INFO[lane]
  const effSubj = customSubject || info.subj
  const effBody = customBody || (
    message.trim() || contact.trim()
      ? `${info.body}\nDetalle: ${message.trim()}\nContacto: ${contact.trim()}`
      : info.body
  )

  const mailtoUrl = `mailto:${EMAIL}?subject=${enc(effSubj)}&body=${enc(effBody)}`
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(EMAIL)}&su=${enc(effSubj)}&body=${enc(effBody)}`

  const handleCopyEmail = async () => {
    trackContactIntent('copy_email', { source_page: sourcePage, lane, article_slug: articleSlug, service_slug: serviceSlug })
    let ok = false
    if (onCopyEmail) {
      ok = await onCopyEmail()
    } else {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(EMAIL)
          ok = true
        }
      } catch {
        ok = false
      }
    }
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const submit = async (isRetry = false) => {
    const c = contact.trim()
    const m = message.trim()

    if (!c) {
      setUxState('empty')
      setStatusMsg('Ingresa correo o teléfono.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) && !/^[\d\s+()-]{7,25}$/.test(c)) {
      setUxState('invalid_input')
      setStatusMsg('Ingresa correo o teléfono válido.')
      return
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setUxState('offline')
      setStatusMsg('Sin conexión. Reintenta o usa correo.')
      return
    }
    if (!isRetry && lastSub === `${c}:${m}` && uxState === 'success') {
      setUxState('duplicated_action')
      setStatusMsg('Mensaje ya recibido.')
      return
    }

    setUxState(isRetry ? 'retry' : 'loading')
    setStatusMsg(isRetry ? 'Reintentando...' : 'Enviando...')

    if (hp.trim()) {
      setTimeout(() => {
        setUxState('success')
        setStatusMsg('Consulta recibida.')
        setLeadId('inbound-ok')
      }, 300)
      return
    }

    try {
      const res = await fetch('/api/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: c, lane, message: m, source_page: sourcePage, website: hp }),
      })
      if (res.ok) {
        const d = await res.json().catch(() => ({}))
        setUxState('success')
        setLeadId(d.lead_id || '')
        setStatusMsg(d.message || 'Consulta recibida.')
        setLastSub(`${c}:${m}`)
        return
      }
      setUxState(res.status === 400 ? 'invalid_input' : 'partial_degraded')
      setStatusMsg(res.status === 400 ? 'Verifica el correo o teléfono.' : 'Envío no disponible. Datos conservados:')
    } catch {
      setUxState('partial_degraded')
      setStatusMsg('Sin conexión. Datos conservados:')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    void submit(false)
  }

  const isSubmitting = uxState === 'loading' || uxState === 'retry'

  return (
    <div
      id={id}
      className={`contactCapturePanel ${compact ? 'contactCapturePanel--compact' : ''}`}
      data-ux-state={uxState}
      data-selected-lane={lane}
    >
      {(headline || subheadline) && (
        <div className="contactCaptureHeader">
          {headline && <h3 className="contactCaptureHeadline">{headline}</h3>}
          {subheadline && <p className="contactCaptureSubheadline">{subheadline}</p>}
        </div>
      )}

      <div className="contactLaneSelector" role="radiogroup" aria-label="Selecciona tu carril de consulta">
        {(['b2b_ops', 'product_idea'] as const).map((l) => {
          const item = LANE_INFO[l]
          return (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={lane === l}
              data-lane={l}
              className={`contactLanePill ${lane === l ? 'contactLanePill--active' : ''}`}
              onClick={() => handleLaneChange(l)}
            >
              <span className="contactLanePillTag">{item.tag}</span>
              <strong className="contactLanePillTitle">{item.title}</strong>
              <span className="contactLanePillDetail">{item.desc}</span>
            </button>
          )
        })}
      </div>

      {uxState === 'success' ? (
        <div className="contactFeedbackCard contactFeedbackCard--success" role="status" aria-live="polite">
          <h4 className="contactFeedbackTitle">¡Consulta recibida!</h4>
          <p className="contactFeedbackText">{statusMsg}</p>
          {leadId && <span className="contactFeedbackRef">ID: {leadId}</span>}
          <div className="contactFeedbackActions">
            <button type="button" className="btn btnGhost" onClick={() => { setUxState('initial'); setContact(''); setMessage(''); setStatusMsg('') }}>
              Enviar otra consulta
            </button>
          </div>
        </div>
      ) : (
        <form className="contactCaptureForm" onSubmit={handleSubmit} noValidate>
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          </div>

          <div className="contactFieldsGrid">
            <div className="contactFieldGroup">
              <label htmlFor={inputId} className="contactFieldLabel">
                Tu correo o WhatsApp / teléfono <span className="contactRequiredMarker">*</span>
              </label>
              <input
                id={inputId}
                type="text"
                data-contact-input
                className={`contactTextInput ${uxState === 'empty' || uxState === 'invalid_input' ? 'contactTextInput--invalid' : ''}`}
                placeholder="ej. nombre@empresa.com o WhatsApp / teléfono"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value)
                  if (uxState === 'empty' || uxState === 'invalid_input') {
                    setUxState('initial')
                    setStatusMsg('')
                  }
                }}
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={uxState === 'empty' || uxState === 'invalid_input'}
              />
            </div>

            <div className="contactFieldGroup">
              <label htmlFor={msgId} className="contactFieldLabel">
                {lane === 'b2b_ops' ? 'Proceso a ordenar o evaluar' : 'Tu idea o producto digital'}
                <span className="contactFieldOptional"> (opcional)</span>
              </label>
              <input
                id={msgId}
                type="text"
                className="contactTextInput"
                placeholder={lane === 'b2b_ops' ? 'Ej. Conectar pedidos de WhatsApp con almacén...' : 'Ej. App móvil y web para cotizaciones...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {(uxState === 'empty' || uxState === 'invalid_input' || uxState === 'offline' || uxState === 'error' || uxState === 'duplicated_action') && (
            <div className={`contactStatusNotice ${uxState === 'error' || uxState === 'invalid_input' || uxState === 'empty' ? 'contactStatusNotice--error' : 'contactStatusNotice--warning'}`} role="alert">
              <span>{statusMsg}</span>
              {(uxState === 'error' || uxState === 'offline') && (
                <button type="button" className="contactInlineRetryBtn" onClick={() => void submit(true)}>Reintentar</button>
              )}
            </div>
          )}

          {uxState === 'partial_degraded' && (
            <div className="contactFeedbackCard contactFeedbackCard--degraded" role="alert">
              <h4 className="contactFeedbackTitle">Datos preservados</h4>
              <p className="contactFeedbackText">{statusMsg}</p>
              <div className="contactPreservedData">
                <div><strong>Carril:</strong> {LANE_INFO[lane].title}</div>
                <div><strong>Contacto:</strong> {contact}</div>
                {message.trim() && <div><strong>Detalle:</strong> {message}</div>}
              </div>
              <div className="contactFeedbackActions">
                <a className="btn btnPrimary" href={mailtoUrl} onClick={() => trackContactIntent('email', { source_page: sourcePage, lane })}>
                  Enviar por mi correo con datos cargados ↗
                </a>
                <button type="button" className="btn btnGhost" onClick={() => void submit(true)}>Reintentar envío</button>
              </div>
            </div>
          )}

          <div className="contactSubmitRow">
            <button type="submit" data-submit-button className="btn btnPrimary contactSubmitBtn" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando consulta...' : 'Recibir contacto directo ↗'}
            </button>
            <span className="contactPrivacyHint">Respuesta en 24h hábiles. Sin spam.</span>
          </div>
        </form>
      )}

      <div className="contactDirectSection">
        <span className="contactDirectTitle">Canales directos:</span>
        <div className={`contactDirectActions ${sourcePage.startsWith('/blog/') ? 'blogCtaActions' : ''}`}>
          <a className="contactDirectLink" data-channel="mailto" href={mailtoUrl} onClick={() => trackContactIntent('email', { source_page: sourcePage, lane, article_slug: articleSlug, service_slug: serviceSlug })}>
            Escribir desde mi correo ↗
          </a>
          <a
            className={`contactDirectLink ${sourcePage.startsWith('/blog/') ? 'blogPrimaryBtn' : ''}`}
            data-channel="gmail"
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackContactIntent('gmail', { source_page: sourcePage, lane, article_slug: articleSlug, service_slug: serviceSlug })}
          >
            {gmailLabel}
          </a>
          <button type="button" className="contactDirectCopyBtn" data-channel="copy_email" data-analytics-action="copy_email" onClick={handleCopyEmail}>
            {copied ? '✓ Correo copiado' : 'Copiar correo'}
          </button>
        </div>
      </div>

      <footer className="contactGuidanceFooter">
        <span>Canal voluntario · Sin cookies · contact.orbitalframeworks@gmail.com</span>
      </footer>
    </div>
  )
}
