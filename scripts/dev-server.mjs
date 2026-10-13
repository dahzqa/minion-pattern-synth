import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.env.PORT || 5173)
const clients = new Set()

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
}

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0])
  const requested = clean === '/' ? '/index.html' : clean
  const resolved = path.resolve(root, `.${requested}`)
  return resolved.startsWith(root) ? resolved : null
}

const server = http.createServer((req, res) => {
  if (req.url === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    res.write('\n')
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }

  const filePath = safePath(req.url || '/')
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' })
  fs.createReadStream(filePath).pipe(res)
})

const watchTargets = ['index.html', 'src', 'assets']
for (const target of watchTargets) {
  const targetPath = path.join(root, target)
  fs.watch(targetPath, { recursive: true }, () => {
    for (const client of clients) client.write('event: reload\ndata: changed\n\n')
  })
}

server.listen(port, () => {
  console.log(`Synth is running at http://localhost:${port}`)
})
