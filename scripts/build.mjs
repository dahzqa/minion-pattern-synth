import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

fs.rmSync(dist, { recursive: true, force: true })
fs.mkdirSync(dist, { recursive: true })

for (const item of ['index.html', 'src', 'assets', 'scripts']) {
  fs.cpSync(path.join(root, item), path.join(dist, item), { recursive: true })
}

const installedTone = path.join(root, 'node_modules', 'tone', 'build', 'Tone.js')
if (fs.existsSync(installedTone)) {
  const vendor = path.join(dist, 'vendor')
  fs.mkdirSync(vendor, { recursive: true })
  fs.copyFileSync(installedTone, path.join(vendor, 'Tone.js'))
}

console.log('Build ready in dist/')
