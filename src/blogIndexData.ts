import { blogPosts, blogPostSlugs, type BlogPost } from './blogData.ts'
import { b2b05ArticleHtml } from './blogB2B05Html.ts'

export type BlogCategoryId = 'todos' | 'web-y-conversion' | 'automatizacion-y-operaciones' | 'software-y-sistemas'
export type BlogCategory = readonly [id: BlogCategoryId, label: string]
export type BlogSearchField = [kind: number, label: string, text: string]
export type BlogIndexItem = [post: BlogPost, categoryId: BlogCategoryId, fields: BlogSearchField[]]

export const FIELD_TITLE = 0
export const FIELD_HEADING = 1
export const FIELD_LEAD = 2
export const FIELD_DESCRIPTION = 3
export const FIELD_TABLE = 4
export const FIELD_BODY = 5

const WEB = 'web-y-conversion', OPERATIONS = 'automatizacion-y-operaciones', SOFTWARE = 'software-y-sistemas'

export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  ['todos', 'Todos'],
  [WEB, 'Web y conversión'],
  [OPERATIONS, 'Automatización y operaciones'],
  [SOFTWARE, 'Software y sistemas'],
]

const SLUG_CATEGORIES: Record<string, BlogCategoryId> = {
  'criterios-evaluacion-seleccion-proveedores-software-a-medida': 'software-y-sistemas',
  'como-hacer-un-briefing-tecnico-de-software-b2b': 'software-y-sistemas',
  'web-con-visitas-pero-sin-consultas': WEB,
  'integracion-pedidos-whatsapp-almacen-operaciones': OPERATIONS,
  'software-a-medida-o-saas-como-decidir': SOFTWARE,
  'automatizacion-procesos-vs-excel-riesgo-operativo': OPERATIONS,
  'landing-page-b2b-tecnica-vs-web-corporativa': WEB,
  'digitalizacion-asistencia-personal-campo-trazabilidad': OPERATIONS,
  'lisa-serums-mapa-datos-automatizacion': SOFTWARE,
}

const POST_CATEGORIES = [WEB, OPERATIONS, SOFTWARE, OPERATIONS, WEB, OPERATIONS, SOFTWARE] as const

export const categoryName = (id: BlogCategoryId) => BLOG_CATEGORIES.find(([c]) => c === id)![1]

export function extractHtmlSearchFields(html: string): BlogSearchField[] {
  const text = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
  return text ? [[FIELD_BODY, 'Artículo sobre WhatsApp', text]] : []
}

export const BLOG_CORPUS: BlogIndexItem[] = blogPostSlugs.map((slug, i) => {
  const p = blogPosts[slug]
  const fields: BlogSearchField[] = [
    [FIELD_TITLE, 'Título', p.title],
    [FIELD_DESCRIPTION, 'Descripción', p.metaDescription],
    [FIELD_LEAD, 'Introducción', p.lead],
  ]
  if (slug === 'integracion-pedidos-whatsapp-almacen-operaciones') {
    fields.push(...extractHtmlSearchFields(b2b05ArticleHtml))
  } else {
    for (const s of p.sections) {
      fields.push([FIELD_HEADING, s.heading, s.heading], [FIELD_BODY, s.heading, s.content.join(' ')])
    }
    if (p.decisionMatrix?.length) {
      fields.push([FIELD_TABLE, 'Tabla', p.decisionMatrix.flatMap(Object.values).join(' ')])
    }
  }
  return [p, SLUG_CATEGORIES[slug] || POST_CATEGORIES[i] || SOFTWARE, fields]
})
