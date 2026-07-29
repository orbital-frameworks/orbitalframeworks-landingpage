import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const outputDir = join(root, 'dist', 'portfolio')
mkdirSync(outputDir, { recursive: true })

const images = [
  ['checkio', join(root, 'src', 'assets', 'checkio.png')],
  ['veterp', join(root, 'src', 'assets', 'veterp_sis.png')],
  ['localisa', join(root, 'src', 'assets', 'lisa.png')],
  ['perulog-pallets', join(root, 'src', 'assets', 'PerulogPallets.png')],
]

const widths = [640, 960]
const windowsMagick = join(process.env.ProgramFiles ?? 'C:\\Program Files', 'ImageMagick-7.1.2-Q16-HDRI', 'magick.exe')

function commandExists(command) {
  const probe = spawnSync(command, ['-version'], { stdio: 'ignore' })
  return probe.status === 0
}

function resolveImageMagickCommand() {
  if (process.platform === 'win32' && existsSync(windowsMagick)) return windowsMagick
  if (commandExists('magick')) return 'magick'
  if (commandExists('convert')) return 'convert'
  throw new Error('ImageMagick is required. Install ImageMagick and expose either `magick` or `convert` in PATH.')
}

const command = resolveImageMagickCommand()

for (const [name, input] of images) {
  for (const width of widths) {
    const output = join(outputDir, `${name}-${width}.webp`)
    const result = spawnSync(command, [
      input,
      '-auto-orient',
      '-strip',
      '-resize', `${width}x>`,
      '-quality', '78',
      '-define', 'webp:method=6',
      output,
    ], { stdio: 'inherit' })

    if (result.status !== 0) {
      throw new Error(`Image optimization failed for ${name} at ${width}px`)
    }
  }
}

const faviconSource = join(root, 'public', 'Logo_favicon.png')
const faviconVariants = [
  ['favicon-32.png', 32],
  ['favicon-192.png', 192],
  ['apple-touch-icon.png', 180],
]

for (const [filename, size] of faviconVariants) {
  const result = spawnSync(command, [
    faviconSource,
    '-auto-orient',
    '-strip',
    '-resize', `${size}x${size}`,
    join(root, 'dist', filename),
  ], { stdio: 'inherit' })

  if (result.status !== 0) {
    throw new Error(`Favicon optimization failed for ${filename}`)
  }
}

const copiedSource = join(root, 'dist', 'Logo_favicon.png')
if (existsSync(copiedSource)) unlinkSync(copiedSource)

console.log(`Generated ${images.length * widths.length} responsive WebP images and ${faviconVariants.length} favicon variants`)
