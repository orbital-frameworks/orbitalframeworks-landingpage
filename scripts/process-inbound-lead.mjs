#!/usr/bin/env node

/**
 * scripts/process-inbound-lead.mjs
 *
 * Validates and transforms inbound contact leads captured by Orbital Frameworks
 * landing page into:
 * 1. Immediate Telegram alert payload for Orbital Relay.
 * 2. Notification / copy payload for contact.orbitalframeworks@gmail.com.
 * 3. Canonical opportunity record for Orbital Leads (acquisition/opportunity-inbox/external/).
 *
 * Supports both programmatic module usage and CLI execution (stdin, file or flags).
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, resolve } from 'node:path'

export function sanitizeString(input, maxLen = 1000) {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Strip control chars
    .trim()
    .slice(0, maxLen)
}

export function validateInboundLead(input) {
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['El cuerpo de la solicitud debe ser un objeto válido.'] }
  }

  // Honeypot check
  const honeypot = input.honeypot || input.website || input.hp_field || input._hp || input.company_role
  if (honeypot && String(honeypot).trim().length > 0) {
    return {
      valid: true,
      isSpam: true,
      reason: 'honeypot_triggered',
    }
  }

  const errors = []
  const rawContact = typeof input.contact === 'string' ? input.contact.trim() : ''

  if (!rawContact || rawContact.length < 3) {
    errors.push('El campo de contacto (correo o teléfono/WhatsApp) es obligatorio.')
  } else if (rawContact.length > 120) {
    errors.push('El contacto excede la longitud máxima permitida (120 caracteres).')
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawContact)
  const isPhone = /^[\d\s+()-]{7,25}$/.test(rawContact)

  if (rawContact && !isEmail && !isPhone) {
    errors.push('El contacto debe ser una dirección de correo válida o un número de teléfono/WhatsApp.')
  }

  let lane = input.lane
  if (lane !== 'b2b_ops' && lane !== 'product_idea') {
    lane = 'b2b_ops'
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const message = sanitizeString(input.message || input.idea_summary || input.context || '', 1000)
  const sourcePage = sanitizeString(input.source_page || input.pathname || '/', 200)

  return {
    valid: true,
    isSpam: false,
    sanitized: {
      contact: rawContact,
      contactType: isEmail ? 'email' : 'phone',
      lane,
      message,
      sourcePage: sourcePage.startsWith('/') ? sourcePage : `/${sourcePage}`,
      submittedAt: input.timestamp ? new Date(input.timestamp).toISOString() : new Date().toISOString(),
    },
  }
}

export function transformToOpportunity(sanitized, options = {}) {
  const dateCompact = new Date(sanitized.submittedAt).toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.random().toString(36).slice(2, 7)
  const opportunityId = options.id || `inbound-${sanitized.lane}-${dateCompact}-${randomSuffix}`
  const status = options.status || 'READY_FOR_REVIEW' // or 'MANUAL_CONTACT_READY'

  const laneLabel =
    sanitized.lane === 'b2b_ops'
      ? 'Empresas y Operación (B2B)'
      : 'Nueva Idea / Producto Digital'

  const observedFact = [
    `Lead voluntario recibido desde ${sanitized.sourcePage} en https://orbitalframeworks.qzz.io.`,
    `Carril de consulta: ${laneLabel}.`,
    `Vía de contacto provista: ${sanitized.contact} (${sanitized.contactType === 'email' ? 'Correo electrónico' : 'WhatsApp / Teléfono'}).`,
    `Resumen o idea expresada: ${sanitized.message || '(Sin detalle adicional registrado)'}.`,
  ].join(' ')

  const commercialHypothesis =
    sanitized.lane === 'b2b_ops'
      ? 'El contacto busca ordenar o automatizar procesos operativos en su empresa o evaluar software a medida. Se recomienda una llamada técnica breve de diagnóstico sin compromisos para identificar el cuello de botella central.'
      : 'El contacto busca transformar una idea o proyecto en una aplicación móvil, plataforma web o producto digital real. Se recomienda una sesión de scoping de viabilidad y arquitectura de MVP acotado respaldada con los casos públicos verificables.'

  const entryOffer =
    sanitized.lane === 'b2b_ops'
      ? 'Diagnóstico técnico inicial de procesos y estimación de arquitectura operativa.'
      : 'Sesión de scoping técnico y viabilidad para MVP de producto digital.'

  const routeKind = sanitized.contactType === 'email' ? 'email' : 'whatsapp'

  return {
    version: 1,
    opportunity_id: opportunityId,
    source_monitor: 'Orbital Landing Page Inbound',
    business_name:
      sanitized.lane === 'b2b_ops'
        ? `Inbound B2B Ops: ${sanitized.contact}`
        : `Inbound Product Idea: ${sanitized.contact}`,
    buyer_context: 'DIRECT_INBOUND',
    status,
    lane: sanitized.lane,
    detected_at: sanitized.submittedAt,
    freshness_verified_at: sanitized.submittedAt,
    source_url: `https://orbitalframeworks.qzz.io${sanitized.sourcePage}`,
    observed_fact: observedFact,
    commercial_hypothesis: commercialHypothesis,
    entry_offer: entryOffer,
    score: 85,
    contact_routes: [
      {
        kind: routeKind,
        value: sanitized.contact,
        evidence_url: `https://orbitalframeworks.qzz.io${sanitized.sourcePage}`,
      },
    ],
    metadata: {
      source_page: sanitized.sourcePage,
      raw_message: sanitized.message,
      submitted_at: sanitized.submittedAt,
      verified_channel: sanitized.contactType,
    },
  }
}

export function formatTelegramMessage(sanitized, opportunityId) {
  const laneLabel =
    sanitized.lane === 'b2b_ops'
      ? 'Empresas y Operación (B2B)'
      : 'Nueva Idea / Producto Digital'

  return [
    '🚀 *Nuevo Lead en Orbital Frameworks*',
    `• *ID:* \`${opportunityId}\``,
    `• *Carril:* ${laneLabel}`,
    `• *Contacto:* \`${sanitized.contact}\``,
    `• *Detalle:* ${sanitized.message || '(Sin detalle adicional)'}`,
    `• *Origen:* \`${sanitized.sourcePage}\``,
    `• *Fecha:* \`${sanitized.submittedAt}\``,
    '• *Estado:* `READY_FOR_REVIEW`',
  ].join('\n')
}

export function formatEmailPayload(sanitized, opportunityId) {
  const laneLabel =
    sanitized.lane === 'b2b_ops'
      ? 'Empresas y Operación (B2B)'
      : 'Nueva Idea / Producto Digital'

  const subject = `[Lead Orbital] ${laneLabel} - ${sanitized.contact}`
  const text = [
    `Nuevo lead capturado desde la web de Orbital Frameworks:`,
    ``,
    `ID Oportunidad: ${opportunityId}`,
    `Carril: ${laneLabel}`,
    `Contacto: ${sanitized.contact} (${sanitized.contactType})`,
    `Detalle / Idea: ${sanitized.message || '(Sin detalle adicional)'}`,
    `Página de origen: https://orbitalframeworks.qzz.io${sanitized.sourcePage}`,
    `Fecha y hora: ${sanitized.submittedAt}`,
    `Estado inicial: READY_FOR_REVIEW`,
    ``,
    `Registro estructurado generado para Orbital Leads.`,
  ].join('\n')

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; color: #1e293b;">
      <h2 style="color: #0ea5e9;">Nuevo Lead en Orbital Frameworks</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; font-weight: bold;">ID:</td><td><code>${opportunityId}</code></td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Carril:</td><td>${laneLabel}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Contacto:</td><td><strong>${sanitized.contact}</strong></td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Detalle:</td><td>${sanitized.message || '(Sin detalle)'}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Origen:</td><td>${sanitized.sourcePage}</td></tr>
        <tr><td style="padding: 6px 0; font-weight: bold;">Fecha:</td><td>${sanitized.submittedAt}</td></tr>
      </table>
    </div>
  `

  return {
    to: 'contact.orbitalframeworks@gmail.com',
    subject,
    text,
    html,
  }
}

export async function processInboundLead(input, options = {}) {
  const validation = validateInboundLead(input)

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.errors,
    }
  }

  if (validation.isSpam) {
    return {
      success: true,
      filtered: true,
      reason: 'honeypot_triggered',
      leadId: 'lead-filtered-hp',
    }
  }

  const { sanitized } = validation
  const opportunity = transformToOpportunity(sanitized, options)
  const telegramText = formatTelegramMessage(sanitized, opportunity.opportunity_id)
  const emailPayload = formatEmailPayload(sanitized, opportunity.opportunity_id)

  const DEFAULT_ORBITAL_LEADS_INBOX = '/srv/orbital/workspaces/orbital-leads/acquisition/opportunity-inbox/external'
  const OPS_RELAY = '/srv/orbital/workspaces/orbital-operations/tools/orbital-relay/scripts/relayctl.mjs'
  const RELAY_ENV = '/srv/orbital/secrets/private/orbital-relay.env'

  let writtenPath = null
  if (options.outDir || options.write) {
    const targetDir = options.outDir
      ? resolve(options.outDir)
      : existsSync(DEFAULT_ORBITAL_LEADS_INBOX)
        ? DEFAULT_ORBITAL_LEADS_INBOX
        : resolve(process.cwd(), 'acquisition/opportunity-inbox/external')
    mkdirSync(targetDir, { recursive: true })
    const filename = `${opportunity.opportunity_id}.json`
    writtenPath = join(targetDir, filename)
    writeFileSync(writtenPath, JSON.stringify(opportunity, null, 2), 'utf-8')
  }

  const dispatches = []

  // Optional Telegram Relay dispatch
  const telegramRelayUrl = options.telegramRelayUrl || process.env.TELEGRAM_RELAY_URL || process.env.ORBITAL_RELAY_URL
  if (telegramRelayUrl && !options.dryRun) {
    dispatches.push(
      fetch(telegramRelayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: telegramText,
          parse_mode: 'Markdown',
          opportunity_id: opportunity.opportunity_id,
        }),
      })
        .then((res) => ({ destination: 'telegram', ok: res.ok }))
        .catch((err) => ({ destination: 'telegram', ok: false, error: err.message })),
    )
  }

  // Optional Email Relay dispatch
  const emailRelayUrl = options.emailRelayUrl || process.env.EMAIL_RELAY_URL
  if (emailRelayUrl && !options.dryRun) {
    dispatches.push(
      fetch(emailRelayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      })
        .then((res) => ({ destination: 'email', ok: res.ok }))
        .catch((err) => ({ destination: 'email', ok: false, error: err.message })),
    )
  }

  if ((options.emitHostRelay || process.env.ORBITAL_HOST_RELAY === '1') && !options.dryRun && existsSync(RELAY_ENV) && existsSync(OPS_RELAY)) {
    const script = 'set -a; source "$1"; set +a; exec /usr/local/bin/node "$2" emit orbital-landing INBOUND_LEAD_RECEIVED info personal "$3"'
    const res = spawnSync('/bin/bash', ['-c', script, 'inbound-lead-relay', RELAY_ENV, OPS_RELAY, telegramText.slice(0, 850)], { encoding: 'utf8', timeout: 15000 })
    dispatches.push(Promise.resolve({ destination: 'orbital-relay-telegram', ok: res.status === 0, stdout: (res.stdout || '').trim() }))
  }

  const dispatchResults = await Promise.allSettled(dispatches)

  return {
    success: true,
    leadId: opportunity.opportunity_id,
    opportunity,
    telegramText,
    emailPayload,
    writtenPath,
    dispatchResults,
  }
}

// CLI Execution Handler
async function runCli() {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso: node scripts/process-inbound-lead.mjs [opciones]

Opciones:
  --contact <email|tel>   Contacto del interesado (correo o WhatsApp)
  --lane <b2b_ops|product_idea>  Carril de consulta (b2b_ops por defecto)
  --message <texto>       Mensaje, idea o contexto provisto
  --source <ruta>         Ruta de origen (ej. / o /servicios/)
  --honeypot <valor>      Valor del campo trampa para pruebas de spam
  --input <archivo.json>  Leer payload desde archivo JSON
  --stdin                 Leer payload JSON desde entrada estándar
  --out-dir <ruta>        Directorio donde escribir el archivo opportunity
  --write                 Guardar registro en disco
  --dry-run               No disparar envíos de red
  --json                  Imprimir resultado en formato JSON estructurado
  --help, -h              Mostrar esta ayuda
    `)
    process.exit(0)
  }

  let payload = {}

  if (args.includes('--stdin')) {
    const rawInput = readFileSync(0, 'utf-8')
    payload = JSON.parse(rawInput)
  } else {
    const inputIdx = args.indexOf('--input')
    if (inputIdx !== -1 && args[inputIdx + 1]) {
      const filePath = resolve(args[inputIdx + 1])
      if (!existsSync(filePath)) {
        console.error(`Error: archivo no encontrado: ${filePath}`)
        process.exit(1)
      }
      payload = JSON.parse(readFileSync(filePath, 'utf-8'))
    } else {
      const getArg = (flag) => {
        const idx = args.indexOf(flag)
        return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined
      }

      payload = {
        contact: getArg('--contact'),
        lane: getArg('--lane') || 'b2b_ops',
        message: getArg('--message'),
        source_page: getArg('--source') || '/',
        honeypot: getArg('--honeypot'),
      }
    }
  }

  const outDirIdx = args.indexOf('--out-dir')
  const outDir = outDirIdx !== -1 && args[outDirIdx + 1] ? args[outDirIdx + 1] : undefined
  const write = args.includes('--write') || Boolean(outDir)
  const dryRun = args.includes('--dry-run')
  const jsonOutput = args.includes('--json')

  const result = await processInboundLead(payload, {
    outDir,
    write,
    dryRun,
  })

  if (!result.success) {
    if (jsonOutput) {
      console.error(JSON.stringify(result, null, 2))
    } else {
      console.error('Error al procesar lead:')
      result.errors?.forEach((e) => console.error(` - ${e}`))
    }
    process.exit(1)
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2))
  } else if (result.filtered) {
    console.log(`[SPAM FILTERED] Lead descartado silenciosamente por honeypot: ${result.leadId}`)
  } else {
    console.log(`[EXITO] Lead procesado correctamente: ${result.leadId}`)
    console.log(` - Carril: ${result.opportunity.lane}`)
    console.log(` - Contacto: ${result.opportunity.contact_routes[0]?.value}`)
    console.log(` - Estado: ${result.opportunity.status}`)
    if (result.writtenPath) {
      console.log(` - Guardado en: ${result.writtenPath}`)
    }
    console.log('\n--- Telegram Alert Preview ---')
    console.log(result.telegramText)
    console.log('\n--- Email Notification Subject ---')
    console.log(result.emailPayload.subject)
  }
}

if (process.argv[1] && process.argv[1].endsWith('process-inbound-lead.mjs')) {
  runCli().catch((err) => {
    console.error('Error fatal:', err)
    process.exit(1)
  })
}
