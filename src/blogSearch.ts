import {
  type BlogIndexItem,
  type BlogSearchField,
} from './blogIndexData.ts'

export type SearchSnippet = [label: string, text: string]
export type SearchResultItem = [item: BlogIndexItem, score: number, snippet: SearchSnippet]

export const normalizeSearchText = (t: string) =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

export const tokenizeSearchQuery = (q: string) =>
  [...new Set(normalizeSearchText(q).split(' ').filter(Boolean))]

export const buildHighlightRegex = (tokens: string[]): RegExp | null =>
  tokens.length ? new RegExp('(' + tokens.join('|') + ')', 'gi') : null

export function extractSnippet(f: BlogSearchField, tok: string[], max = 140): SearchSnippet {
  const r = f[2], i = buildHighlightRegex(tok)?.exec(r)?.index ?? -1
  if (i < 0 || r.length <= max) return [f[1], r.slice(0, max).trim()]
  const s = Math.max(0, i - 35), e = i + max - 35
  return [f[1], (s ? '…' : '') + r.slice(s, e).trim() + (e < r.length ? '…' : '')]
}

export function filterAndSearchBlogPosts(
  items: BlogIndexItem[],
  query: string,
): SearchResultItem[] {
  const tok = tokenizeSearchQuery(query)
  const def = (item: BlogIndexItem): SearchSnippet => ['Descripción', item[0].metaDescription]
  if (!tok.length) return items.map((item) => [item, 0, def(item)])

  const res: SearchResultItem[] = []

  for (const item of items) {
    let score = 0, best: BlogSearchField | null = null, max = 0
    const m = new Set<string>()

    for (const f of item[2]) {
      const n = normalizeSearchText(f[2])
      let cnt = 0
      for (const t of tok) if (n.includes(t)) { cnt++; m.add(t) }
      if (cnt) {
        const rank = (6 - f[0]) * cnt
        score += rank
        if (rank > max) { max = rank; best = f }
      }
    }

    if (m.size === tok.length) {
      res.push([item, score, best ? extractSnippet(best, tok) : def(item)])
    }
  }

  return res.sort((a, b) => b[1] - a[1])
}
