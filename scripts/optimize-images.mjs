import { existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const distDir = process.env.DIST_DIR ? resolve(root, process.env.DIST_DIR) : join(root, 'dist')
const outputDir = join(distDir, 'portfolio')
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
  return null
}

const command = resolveImageMagickCommand()
const ffmpeg = command ? null : commandExists('ffmpeg') ? 'ffmpeg' : null
if (!command && !ffmpeg) {
  throw new Error('Image optimization requires ImageMagick (magick/convert) or FFmpeg on PATH.')
}

function optimize(input, output, { width, height, webp = false }) {
  const args = command
    ? [input, '-auto-orient', '-strip', '-resize', height ? `${width}x${height}` : `${width}x>`,
        ...(webp ? ['-quality', '78', '-define', 'webp:method=6'] : []), output]
    : ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', '-i', input,
        '-vf', height
          ? `scale=${width}:${height}:flags=lanczos`
          : `scale=w='min(iw,${width})':h=-2:flags=lanczos`,
        ...(webp ? ['-c:v', 'libwebp', '-quality', '78', '-compression_level', '6'] : []),
        '-frames:v', '1', '-update', '1', output]
  const result = spawnSync(command ?? ffmpeg, args, { stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`Image optimization failed for ${output}`)
}

for (const [name, input] of images) {
  for (const width of widths) {
    const output = join(outputDir, `${name}-${width}.webp`)
    optimize(input, output, { width, webp: true })
  }
}

const faviconSource = join(root, 'public', 'Logo_favicon.png')
const faviconVariants = [
  ['favicon-32.png', 32],
  ['favicon-192.png', 192],
  ['apple-touch-icon.png', 180],
]

for (const [filename, size] of faviconVariants) {
  optimize(faviconSource, join(distDir, filename), { width: size, height: size })
}

const copiedSource = join(distDir, 'Logo_favicon.png')
if (existsSync(copiedSource)) unlinkSync(copiedSource)

console.log(`Generated ${images.length * widths.length} responsive WebP images and ${faviconVariants.length} favicon variants`)
