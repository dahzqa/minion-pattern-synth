import { AudioEngine } from './audio/audioEngine.js'
import { loadTone } from './audio/toneLoader.js'
import { bindUI } from './ui/bindings.js'

const DESIGN_WIDTH = 1470
const DESIGN_HEIGHT = 823

function fitSynthToViewport() {
  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT)
  document.documentElement.style.setProperty('--stage-scale', String(scale))
}

fitSynthToViewport()
window.addEventListener('resize', fitSynthToViewport)

try {
  const Tone = await loadTone()
  const engine = new AudioEngine(Tone)
  bindUI(engine)
  document.documentElement.classList.add('audio-ready')
} catch (error) {
  console.error(error)
  document.documentElement.classList.add('audio-error')
}

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  const events = new EventSource('/__reload')
  events.addEventListener('reload', () => location.reload())
}
