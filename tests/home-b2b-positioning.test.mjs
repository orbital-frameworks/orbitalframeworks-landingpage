import assert from 'node:assert/strict'
import { readFileSync, existsSync, accessSync, constants } from 'node:fs'
import { resolve, join } from 'node:path'
import test from 'node:test'

const root = resolve(process.cwd())
function resolveDistDir() {
  if (process.env.DIST_DIR) return resolve(root, process.env.DIST_DIR)
  const defaultDist = join(root, 'dist')
  if (existsSync('/tmp/orbital-dist')) {
    try {
      accessSync(defaultDist, constants.W_OK)
    } catch {
      return '/tmp/orbital-dist'
    }
  }
  return defaultDist
}

const distDir = resolveDistDir()
const html = readFileSync(join(distDir, 'index.html'), 'utf8')
const source = readFileSync(join(root, 'src/App.tsx'), 'utf8')
const indexMd = readFileSync(join(root, 'public/index.md'), 'utf8')

test('corporate home explains software for companies before presenting its portfolio', () => {
  assert.match(html, /class="heroTitle"/)
  assert.match(html, /aria-label="Software para tu empresa"/)
  assert.ok(html.includes('>SOFTWARE<') && html.includes('>EMPRESA'), 'H1 must explain the category of service')
  assert.match(html, /digitalizar procesos/)
  assert.match(html, /IA realmente aportan valor/)
  assert.match(html, /href="#contacto"[^>]*>Cuéntanos qué necesitas resolver/)
  assert.match(html, /href="#proyectos"[^>]*>Ver proyectos reales/)
})

test('B2B service cards describe problems and conditional IA rather than claim proven outcomes', () => {
  assert.match(source, /Tareas repetitivas/)
  assert.match(source, /Software que no encaja/)
  assert.match(source, /Automatización e IA aplicada/)
  assert.match(source, /IA con supervisión/)
  assert.doesNotMatch(source, /100% garantizado|clientes satisfechos|reducción demostrada de costos/i)
})

test('prerendered metadata and public markdown state the same actual service offer', () => {
  assert.match(html, /<meta name="description" content="Software a medida, automatización de procesos/)
  assert.match(html, /<title>Software a medida y automatización para empresas/)
  assert.match(indexMd, /Desarrollamos software para digitalizar procesos empresariales/)
})
