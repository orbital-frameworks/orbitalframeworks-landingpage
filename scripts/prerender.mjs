import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = resolve(process.cwd())
const clientHtmlPath = resolve(root, 'dist/index.html')
const serverEntryPath = resolve(root, 'dist-ssr/entry-server.js')

const [{ render }, template] = await Promise.all([
  import(pathToFileURL(serverEntryPath).href),
  readFile(clientHtmlPath, 'utf8'),
])

const appHtml = render()
const marker = '<div id="root"></div>'

if (!template.includes(marker)) {
  throw new Error(`Prerender marker not found in ${clientHtmlPath}`)
}

const output = template.replace(marker, `<div id="root">${appHtml}</div>`)
await writeFile(clientHtmlPath, output, 'utf8')

console.log(`Prerendered ${appHtml.length} characters into dist/index.html`)
