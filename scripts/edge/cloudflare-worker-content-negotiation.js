/**
 * Cloudflare Worker: Markdown Content Negotiation, Agent-Friendly 404,
 * First-Party Attention Telemetry & Triple-Intake Lead Pipeline.
 *
 * Deployed at the edge for orbitalframeworks.qzz.io (Cloudflare DNS proxy).
 * Features:
 * 1. Content Negotiation:
 *    - Accept: text/markdown on '/' -> serves /index.md with Vary: Accept
 *    - Accept: text/markdown on 404 -> serves /404.md with HTTP 404 and Vary: Accept
 *    - Accept: text/html -> passes through to static origin (Amplify / S3)
 * 2. Edge Shield Observability:
 *    - POST/GET /api/telemetry -> First-Party attention map endpoint without cookies or PII
 *    - Explicitly excludes and ignores /mcp, /healthz and /.well-known/* infrastructure routes
 * 3. Triple-Intake Lead Pipeline:
 *    - POST /api/lead-intake -> Schema validation, honeypot protection, rate-limiting, sanitization
 *    - Tri-destination dispatch: Telegram Relay, Email copy to contact.orbitalframeworks@gmail.com,
 *      and structured opportunity format for Orbital Leads (acquisition/opportunity-inbox/external/).
 */

export function prefersMarkdown(acceptHeader) {
  if (!acceptHeader || typeof acceptHeader !== 'string') return false

  const entries = acceptHeader.split(',')
  let mdQ = -1
  let htmlQ = -1

  for (const rawEntry of entries) {
    const entry = rawEntry.trim()
    if (!entry) continue

    const [mediaType, ...params] = entry.split(';').map((s) => s.trim())
    const type = mediaType.toLowerCase()

    let q = 1.0
    for (const param of params) {
      const match = param.match(/^q\s*=\s*([0-9.]+)/i)
      if (match) {
        const parsed = parseFloat(match[1])
        if (!isNaN(parsed)) {
          q = Math.max(0, Math.min(1, parsed))
        }
      }
    }

    if (type === 'text/markdown') {
      mdQ = Math.max(mdQ, q)
    } else if (type === 'text/html') {
      htmlQ = Math.max(htmlQ, q)
    }
  }

  // If text/markdown was omitted or explicitly unacceptable (q=0), do not serve markdown
  if (mdQ <= 0) return false

  // If text/html was omitted, treat its weight as 0
  const effectiveHtmlQ = htmlQ < 0 ? 0 : htmlQ

  // Return true only when markdown is strictly preferred over HTML
  return mdQ > effectiveHtmlQ
}

export function isTunnelOrInfraPath(pathname) {
  if (!pathname || typeof pathname !== 'string') return false
  const clean = pathname.toLowerCase().trim()
  return (
    clean === '/mcp' ||
    clean.startsWith('/mcp/') ||
    clean === '/healthz' ||
    clean.startsWith('/healthz/') ||
    clean === '/.well-known' ||
    clean.startsWith('/.well-known/')
  )
}

export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
  }
}

export function sanitizeString(input, maxLen = 1000) {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim()
    .slice(0, maxLen)
}

// Simple edge in-memory rate limiting (max 5 submissions per 60s per client IP)
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5

export function isRateLimited(ip) {
  const key = ip || 'anonymous'
  const now = Date.now()
  const record = rateLimitMap.get(key)
  if (!record || now - record.resetTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, resetTime: now })
    return false
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }
  record.count += 1
  return false
}

export function validateLeadPayload(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'payload_must_be_object' }
  }

  // Honeypot check: reject bots silently if honeypot fields are filled
  const honeypot = body.honeypot || body.website || body.hp_field || body._hp || body.company_role
  if (honeypot && String(honeypot).trim().length > 0) {
    return { valid: true, isSpam: true, reason: 'honeypot_triggered' }
  }

  const rawContact = typeof body.contact === 'string' ? body.contact.trim() : ''
  if (!rawContact || rawContact.length < 3 || rawContact.length > 120) {
    return { valid: false, error: 'contact_required_or_invalid_length' }
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawContact)
  const isPhone = /^[\d\s+()-]{7,25}$/.test(rawContact)
  if (!isEmail && !isPhone) {
    return { valid: false, error: 'contact_must_be_email_or_phone' }
  }

  let lane = body.lane
  if (lane !== 'b2b_ops' && lane !== 'product_idea') {
    lane = 'b2b_ops'
  }

  const message = sanitizeString(body.message || body.idea_summary || body.context || '', 1000)
  const sourcePage = sanitizeString(body.source_page || body.pathname || '/', 200)

  return {
    valid: true,
    isSpam: false,
    sanitized: {
      contact: rawContact,
      contactType: isEmail ? 'email' : 'phone',
      lane,
      message,
      sourcePage: sourcePage.startsWith('/') ? sourcePage : `/${sourcePage}`,
      submittedAt: new Date().toISOString(),
    },
  }
}

export function sanitizeTelemetryPayload(payload) {
  if (!payload || typeof payload !== 'object') return null

  const path = typeof payload.path === 'string' ? payload.path.slice(0, 300) : '/'
  if (isTunnelOrInfraPath(path)) {
    return { ignored: true, reason: 'tunnel_or_infra_path' }
  }

  // Drop payload if PII pattern is found
  const raw = JSON.stringify(payload)
  if (/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/.test(raw)) {
    return { ignored: true, reason: 'pii_detected_and_dropped' }
  }

  return {
    event: typeof payload.event === 'string' ? payload.event.slice(0, 50) : 'unknown',
    path,
    timestamp: typeof payload.timestamp === 'number' ? payload.timestamp : Date.now(),
    depth: typeof payload.depth === 'number' ? payload.depth : undefined,
    lane: payload.lane === 'b2b_ops' || payload.lane === 'product_idea' ? payload.lane : undefined,
    dwell_ms: typeof payload.dwell_ms === 'number' ? payload.dwell_ms : undefined,
    section_id: typeof payload.section_id === 'string' ? payload.section_id.slice(0, 50) : undefined,
    sections: payload.sections && typeof payload.sections === 'object' ? payload.sections : undefined,
    method: typeof payload.method === 'string' ? payload.method.slice(0, 30) : undefined,
    channel: typeof payload.channel === 'string' ? payload.channel.slice(0, 30) : undefined,
  }
}

export async function handleTelemetry(request) {
  const cors = getCorsHeaders()

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (request.method === 'GET') {
    return new Response(
      JSON.stringify({
        ok: true,
        service: 'orbital-attention-telemetry',
        policy: 'zero-cookie-zero-pii',
        status: 'active',
      }),
      {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
      },
    )
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  let body
  try {
    const text = await request.text()
    body = text ? JSON.parse(text) : {}
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_json' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  // Handle batch or single payload
  const events = Array.isArray(body) ? body : body.events && Array.isArray(body.events) ? body.events : [body]
  const processed = []

  for (const item of events) {
    const sanitized = sanitizeTelemetryPayload(item)
    if (sanitized && !sanitized.ignored) {
      processed.push(sanitized)
    }
  }

  // Structured edge logging (never logs PII)
  if (processed.length > 0) {
    // Edge log for Cloudflare Logs
    console.log('[ORBITAL_TELEMETRY]', JSON.stringify({ count: processed.length, events: processed }))
  }

  return new Response(
    JSON.stringify({
      ok: true,
      status: 'recorded',
      count: processed.length,
    }),
    {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    },
  )
}

export async function handleLeadIntake(request, env) {
  const cors = getCorsHeaders()

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  // Rate limiting
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'rate_limited',
        message: 'Demasiadas solicitudes. Por favor espera un momento antes de volver a intentar.',
      }),
      {
        status: 429,
        headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
      },
    )
  }

  let body
  try {
    const text = await request.text()
    body = text ? JSON.parse(text) : {}
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'invalid_json',
        message: 'El contenido enviado no es un JSON válido.',
      }),
      {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
      },
    )
  }

  const validation = validateLeadPayload(body)
  if (!validation.valid) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: validation.error,
        message: 'Por favor proporciona un correo o teléfono válido.',
      }),
      {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
      },
    )
  }

  // If honeypot triggered: simulate success silently without dispatching spam
  if (validation.isSpam) {
    return new Response(
      JSON.stringify({
        ok: true,
        status: 'received',
        lead_id: 'lead-filtered-hp',
      }),
      {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
      },
    )
  }

  const { sanitized } = validation
  const dateCompact = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.random().toString(36).slice(2, 7)
  const leadId = `inbound-${sanitized.lane}-${dateCompact}-${randomSuffix}`
  const laneLabel = sanitized.lane === 'b2b_ops' ? 'Empresas y Operación (B2B)' : 'Nueva Idea / Producto Digital'

  // 1. Destination 1: Telegram Relay alert
  const telegramMessage = [
    '🚀 *Nuevo Lead en Orbital Frameworks*',
    `• *ID:* \`${leadId}\``,
    `• *Carril:* ${laneLabel}`,
    `• *Contacto:* \`${sanitized.contact}\``,
    `• *Detalle:* ${sanitized.message || '(Sin detalle adicional)'}`,
    `• *Origen:* \`${sanitized.sourcePage}\``,
    `• *Fecha:* \`${sanitized.submittedAt}\``,
    '• *Estado:* `READY_FOR_REVIEW`',
  ].join('\n')

  // 2. Destination 2: Email copy to contact.orbitalframeworks@gmail.com
  const emailPayload = {
    to: 'contact.orbitalframeworks@gmail.com',
    subject: `[Lead Orbital] ${laneLabel} - ${sanitized.contact}`,
    text: [
      `Nuevo lead capturado desde la web:`,
      `ID: ${leadId}`,
      `Carril: ${laneLabel}`,
      `Contacto: ${sanitized.contact}`,
      `Detalle: ${sanitized.message || '(Sin detalle adicional)'}`,
      `Origen: https://orbitalframeworks.qzz.io${sanitized.sourcePage}`,
      `Fecha: ${sanitized.submittedAt}`,
      `Estado: READY_FOR_REVIEW`,
    ].join('\n'),
  }

  // 3. Destination 3: Structured opportunity for Orbital Leads inbox
  const opportunity = {
    version: 1,
    opportunity_id: leadId,
    source_monitor: 'Orbital Landing Page Inbound',
    business_name: sanitized.lane === 'b2b_ops' ? `Inbound B2B Ops: ${sanitized.contact}` : `Inbound Product Idea: ${sanitized.contact}`,
    buyer_context: 'DIRECT_INBOUND',
    status: 'READY_FOR_REVIEW',
    lane: sanitized.lane,
    detected_at: sanitized.submittedAt,
    freshness_verified_at: sanitized.submittedAt,
    source_url: `https://orbitalframeworks.qzz.io${sanitized.sourcePage}`,
    observed_fact: `Lead voluntario recibido desde ${sanitized.sourcePage}. Carril: ${laneLabel}. Contacto: ${sanitized.contact}. Mensaje: ${sanitized.message || '(Sin detalle adicional)'}`,
    commercial_hypothesis:
      sanitized.lane === 'b2b_ops'
        ? 'Solicitud de evaluación u ordenamiento de procesos operativos/sistemas a medida. Requiere conversación técnica inicial.'
        : 'Idea de producto digital o app/web. Requiere scoping técnico de viabilidad y MVP.',
    entry_offer:
      sanitized.lane === 'b2b_ops'
        ? 'Conversación técnica inicial y diagnóstico de requerimientos operativos.'
        : 'Sesión de scoping técnico y viabilidad para MVP.',
    score: 85,
    contact_routes: [
      {
        kind: sanitized.contactType === 'email' ? 'email' : 'whatsapp',
        value: sanitized.contact,
        evidence_url: `https://orbitalframeworks.qzz.io${sanitized.sourcePage}`,
      },
    ],
  }

  // Asynchronous external dispatches (failsafe, non-blocking)
  const dispatchPromises = []

  // Dispatch 1: Telegram Relay
  const telegramRelayUrl = env?.TELEGRAM_RELAY_URL || env?.ORBITAL_RELAY_URL
  if (telegramRelayUrl) {
    dispatchPromises.push(
      fetch(telegramRelayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: telegramMessage,
          parse_mode: 'Markdown',
          lead_id: leadId,
          opportunity,
        }),
      }).catch((err) => console.error('[EDGE_DISPATCH] Telegram relay failed:', err)),
    )
  }

  // Dispatch 2: Email Relay / Copy
  const emailRelayUrl = env?.EMAIL_RELAY_URL
  if (emailRelayUrl) {
    dispatchPromises.push(
      fetch(emailRelayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      }).catch((err) => console.error('[EDGE_DISPATCH] Email relay failed:', err)),
    )
  }

  // Dispatch 3: Orbital Leads API/Queue
  const leadsRelayUrl = env?.ORBITAL_LEADS_RELAY_URL
  if (leadsRelayUrl) {
    dispatchPromises.push(
      fetch(leadsRelayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opportunity),
      }).catch((err) => console.error('[EDGE_DISPATCH] Orbital Leads relay failed:', err)),
    )
  }

  // Wait for external dispatches if any, but do not fail lead intake if external webhook is down
  if (dispatchPromises.length > 0) {
    await Promise.allSettled(dispatchPromises)
  }

  return new Response(
    JSON.stringify({
      ok: true,
      status: 'success',
      message: 'Mensaje recibido correctamente. Nos pondremos en contacto pronto.',
      lead_id: leadId,
      lane: sanitized.lane,
    }),
    {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
    },
  )
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Route A: First-Party Attention Telemetry
    if (url.pathname === '/api/telemetry') {
      return handleTelemetry(request, env, ctx)
    }

    // Route B: Triple-Intake Lead Capture
    if (url.pathname === '/api/lead-intake') {
      return handleLeadIntake(request, env, ctx)
    }

    // Route C: Pass-through for non-GET/HEAD traffic on any other route
    // Negotiation must never turn a POST or other non-document method into
    // an asset GET. Leave non-GET/HEAD traffic untouched.
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return fetch(request)
    }

    const accept = request.headers.get('accept') || ''
    const wantsMarkdown = prefersMarkdown(accept)

    // Route 1: Homepage Markdown negotiation
    if (wantsMarkdown && (url.pathname === '/' || url.pathname === '/index.html')) {
      const mdUrl = new URL('/index.md', request.url)
      const originResponse = await fetch(mdUrl, {
        headers: request.headers,
        redirect: 'follow',
      })

      if (originResponse.ok) {
        const headers = new Headers(originResponse.headers)
        headers.set('Content-Type', 'text/markdown; charset=utf-8')
        const priorVary = headers.get('Vary')
        if (!priorVary || !priorVary.split(',').some((item) => item.trim().toLowerCase() === 'accept')) {
          headers.set('Vary', priorVary ? `${priorVary}, Accept` : 'Accept')
        }
        return new Response(originResponse.body, {
          status: 200,
          statusText: 'OK',
          headers,
        })
      }
    }

    // Default fetch from origin (Amplify / CloudFront)
    const originResponse = await fetch(request)

    // Route 2: 404 Markdown negotiation
    if (originResponse.status === 404 && wantsMarkdown) {
      const notFoundUrl = new URL('/404.md', request.url)
      const notFoundResponse = await fetch(notFoundUrl)
      const body = notFoundResponse.ok ? await notFoundResponse.text() : '# 404 Not Found\n\nRecurso no encontrado. Ver https://orbitalframeworks.qzz.io/llms.txt'
      return new Response(body, {
        status: 404,
        statusText: 'Not Found',
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      })
    }

    // Preserve Vary: Accept for cache isolation between HTML and Markdown
    const headers = new Headers(originResponse.headers)
    const currentVary = headers.get('vary')
    if (currentVary) {
      if (!currentVary.split(',').some((name) => name.trim().toLowerCase() === 'accept')) {
        headers.set('Vary', `${currentVary}, Accept`)
      }
    } else {
      headers.set('Vary', 'Accept')
    }

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers,
    })
  },
}
