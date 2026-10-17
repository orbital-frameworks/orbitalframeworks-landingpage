import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const dist = join(process.cwd(), 'dist')
const html = (path) => readFileSync(join(dist, path), 'utf8')

test('blog cards have a single keyboard-accessible link wrapping the full card', () => {
  const page = html('blog/index.html')
  assert.match(page, /<article class="blogPostCard"><a href="\/blog\/software-a-medida-o-saas-como-decidir\/" class="blogPostCardSurface"/)
  assert.match(page, /class="blogPostCardReadLink">Leer análisis/)
  assert.doesNotMatch(page, /<h3 class="blogPostCardTitle"><a /)
  assert.match(page, /href="#articulos"[^>]*>Leer artículos/)
  assert.match(page, /<button[^>]*>Copiar enlace RSS<\/button>/)
  assert.doesNotMatch(page, /Suscribirse vía RSS/)
})

test('four services are fully clickable and the internal systems card has a contact destination', () => {
  const page = html('index.html')
  const anchors = [...page.matchAll(/<a class="serviceCard" data-variant="([1-4])" href="([^"]+)"/g)]
  assert.deepEqual(anchors.map((a) => [a[1], a[2]]), [
    ['1', '/servicios/landing-pages-b2b/'],
    ['2', '/servicios/desarrollo-software-medida/'],
    ['3', '/servicios/automatizacion-procesos/'],
    ['4', '#contacto'],
  ])
  assert.match(page, /Consultar por sistemas internos/)
})

test('service and article primary CTAs open Gmail with the existing contact address', () => {
  for (const path of [
    'blog/software-a-medida-o-saas-como-decidir/index.html',
    'servicios/desarrollo-software-medida/index.html',
    'servicios/automatizacion-procesos/index.html',
    'servicios/landing-pages-b2b/index.html',
  ]) {
    const page = html(path)
    assert.match(page, /href="https:\/\/mail\.google\.com\/mail\/\?view=cm&amp;fs=1&amp;to=contact\.orbitalframeworks%40gmail\.com/)
    assert.match(page, /Consultar por correo/)
    assert.doesNotMatch(page, /Consultar por correo oficial|Consultar por Gmail|Abrir borrador en Gmail/)
  }
})
