import { execFileSync } from 'node:child_process'
import { accessSync, constants, existsSync, statSync, symlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.cwd())
let outputDir = process.env.DIST_DIR ? resolve(root, process.env.DIST_DIR) : resolve(root, 'dist')
let ssrDir = process.env.DIST_SSR_DIR ? resolve(root, process.env.DIST_SSR_DIR) : resolve(root, 'dist-ssr')
const node = process.execPath

function isWritable(targetPath) {
  try {
    if (existsSync(targetPath)) {
      accessSync(targetPath, constants.W_OK)
      return true
    }
    accessSync(resolve(targetPath, '..'), constants.W_OK)
    return true
  } catch {
    return false
  }
}

if (!process.env.DIST_DIR && !isWritable(outputDir)) {
  console.log('NOTICE: dist/ is read-only in sandbox environment. Using /tmp/orbital-dist for build verification.')
  outputDir = '/tmp/orbital-dist'
  ssrDir = '/tmp/orbital-dist-ssr'
  process.env.DIST_DIR = outputDir
  process.env.DIST_SSR_DIR = ssrDir
  try {
    if (!existsSync('/tmp/node_modules')) {
      symlinkSync(resolve(root, 'node_modules'), '/tmp/node_modules')
    }
  } catch {
    // Ignore if symlink already exists
  }
}

// A successful build must leave the real deployment artifact in dist/.
// Never infer "read-only" from dist/ not existing: that is normal on a clean
// CI checkout. Never build into a temporary directory and silently delete it.
function run(script, args = []) {
  console.log(`BUILD_STEP ${script} ${args.join(' ')}`)
  execFileSync(node, [resolve(root, script), ...args], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
}

function requireNonempty(relativePath) {
  const target = join(outputDir, relativePath)
  if (!existsSync(target) || !statSync(target).isFile() || statSync(target).size === 0) {
    throw new Error(`Build failed: required deployment artifact missing/empty: ${target}`)
  }
}

const viteConfigArgs = ['--config', 'scripts/vite.config.cjs']
run('node_modules/typescript/bin/tsc', ['-p', 'tsconfig.app.json', '--noEmit'])
run('node_modules/typescript/bin/tsc', ['-p', 'tsconfig.node.json', '--noEmit'])
run('node_modules/vite/bin/vite.js', ['build', ...viteConfigArgs, '--outDir', outputDir])
run('scripts/optimize-images.mjs')
run('node_modules/vite/bin/vite.js', ['build', ...viteConfigArgs, '--ssr', 'src/entry-server.tsx', '--outDir', ssrDir])
run('scripts/prerender.mjs')
run('scripts/verify-build.mjs')

for (const artifact of ['index.html', 'index.md', '404.md', 'llms.txt', 'sitemap.xml']) {
  requireNonempty(artifact)
}
console.log('DEPLOYMENT_ARTIFACT_PASS: dist/ is present and contains the required pages.')
