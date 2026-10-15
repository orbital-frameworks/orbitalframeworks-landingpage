import http from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, resolve } from 'node:path'
import { prefersMarkdown } from './edge/cloudflare-worker-content-negotiation.js'

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

/**
 * Creates an HTTP server providing content negotiation for Orbital Frameworks.
 * Demonstrates local compliance with:
 * - Accept: text/markdown -> /index.md with 200, Content-Type: text/markdown, Vary: Accept
 * - Accept: text/html -> /index.html with 200, Content-Type: text/html, Vary: Accept
 * - Nonexistent URL + Accept: text/markdown -> /404.md with 404, Content-Type: text/markdown, Vary: Accept
 * - Nonexistent URL + Accept: text/html -> 404 HTML with 404, Content-Type: text/html, Vary: Accept
 */
export function createNegotiationServer(options = {}) {
  const rootDir = options.rootDir ? resolve(options.rootDir) : resolve(process.cwd())
  const distDir = existsSync(join(rootDir, 'dist')) ? join(rootDir, 'dist') : rootDir
  const publicDir = join(rootDir, 'public')

  function findFile(relPath) {
    const candidates = [
      join(distDir, relPath),
      join(publicDir, relPath),
      join(rootDir, relPath),
    ]
    for (const c of candidates) {
      if (existsSync(c) && statSync(c).isFile()) return c
    }
    return null
  }

  function readContent(relPath) {
    const file = findFile(relPath)
    if (file) return readFileSync(file)
    return null
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
    const pathname = decodeURIComponent(url.pathname)
    const acceptHeader = req.headers.accept || ''
    const wantsMarkdown = prefersMarkdown(acceptHeader)

    // Security & Cache Isolation headers
    res.setHeader('Vary', 'Accept')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Route 1: Root / Home
    if (pathname === '/' || pathname === '/index.html') {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate, s-maxage=300')
      if (wantsMarkdown) {
        const mdBody = readContent('index.md') || '# Orbital Frameworks\n\nEmpresa peruana de desarrollo de software y soluciones digitales.\n\nVer https://orbitalframeworks.qzz.io/llms.txt'
        res.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' })
        return res.end(mdBody)
      } else {
        const htmlBody = readContent('index.html') || '<!doctype html><html><head><title>Orbital Frameworks</title></head><body><h1>Orbital Frameworks</h1></body></html>'
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        return res.end(htmlBody)
      }
    }

    // Route 2: Static assets
    const normalized = pathname.replace(/^\/+/, '')
    let targetFile = findFile(normalized)
    if (!targetFile && pathname.endsWith('/')) {
      targetFile = findFile(join(normalized, 'index.html'))
    }
    if (!targetFile && !extname(normalized)) {
      targetFile = findFile(`${normalized}.html`) || findFile(join(normalized, 'index.html'))
    }

    if (targetFile) {
      const ext = extname(targetFile).toLowerCase()
      const contentType = MIME_TYPES[ext] || 'application/octet-stream'
      res.setHeader('Content-Type', contentType)
      if (ext === '.html' || ext === '.md') {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate, s-maxage=300')
      } else if (ext === '.webp' || ext === '.png' || pathname.startsWith('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
      }
      res.writeHead(200)
      return res.end(readFileSync(targetFile))
    }

    // Route 3: 404 Not Found
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    if (wantsMarkdown) {
      const md404 = readContent('404.md') || '# 404 Not Found\n\nEl recurso solicitado no fue encontrado.\n\n- [llms.txt](https://orbitalframeworks.qzz.io/llms.txt)\n- [sitemap.xml](https://orbitalframeworks.qzz.io/sitemap.xml)\n- Contacto: contact.orbitalframeworks@gmail.com\n'
      res.writeHead(404, { 'Content-Type': 'text/markdown; charset=utf-8' })
      return res.end(md404)
    } else {
      const html404 = '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>404 - No encontrado | Orbital Frameworks</title></head><body><h1>404 - Página no encontrada</h1><p><a href="/">Volver al inicio</a> | <a href="/llms.txt">llms.txt</a></p></body></html>'
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      return res.end(html404)
    }
  })

  return server
}

// CLI runner if invoked directly
if (process.argv[1] && process.argv[1].endsWith('serve-negotiation.mjs')) {
  const port = parseInt(process.env.PORT || '3000', 10)
  const server = createNegotiationServer()
  server.listen(port, () => {
    console.log(`Orbital Frameworks Content Negotiation Server running at http://localhost:${port}`)
    console.log(`- Request with Accept: text/markdown -> delivers Markdown with Vary: Accept`)
    console.log(`- Request with Accept: text/html -> delivers HTML with Vary: Accept`)
    console.log(`- 404 with Accept: text/markdown -> delivers Markdown error with Vary: Accept`)
  })
}
