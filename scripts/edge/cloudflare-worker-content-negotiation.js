/**
 * Cloudflare Worker: Markdown Content Negotiation & Agent-Friendly 404
 *
 * Deployed at the edge for orbitalframeworks.qzz.io (Cloudflare DNS proxy).
 * Negotiates representations based on the 'Accept' request header:
 * - Accept: text/markdown on '/' -> serves /index.md with Content-Type: text/markdown and Vary: Accept
 * - Accept: text/markdown on 404 -> serves /404.md with HTTP 404, Content-Type: text/markdown and Vary: Accept
 * - Accept: text/html -> passes through to static origin (Amplify / S3) preserving HTML responses
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

export default {
  async fetch(request, env, ctx) {
    // Negotiation must never turn a POST or other non-document method into
    // an asset GET. Leave non-GET/HEAD traffic untouched.
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return fetch(request)
    }
    const accept = request.headers.get('accept') || ''
    const wantsMarkdown = prefersMarkdown(accept)
    const url = new URL(request.url)

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
      if (!currentVary.toLowerCase().includes('accept')) {
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
