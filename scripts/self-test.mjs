import { createPatternLayer } from '../src/js/audio/patternLayer.js'
import { AudioEngine } from '../src/js/audio/audioEngine.js'

class FakePart {
  constructor(callback, events) {
    this.callback = callback
    this.events = events
    this.loop = false
    this.loopEnd = null
    this.mute = false
  }
  start() { return this }
}

const pattern = createPatternLayer(
  { Part: FakePart },
  [[{ time: 0 }], [{ time: 0 }]],
  () => {},
  '2m',
)
const spreadLayer = { ...pattern }

if (spreadLayer.isActive()) throw new Error('Layer must begin inactive')
if (spreadLayer.togglePattern(0) !== 0) throw new Error('Pattern 0 did not activate')
if (!spreadLayer.isActive()) throw new Error('Layer state froze after object spread')
if (spreadLayer.getActiveIndex() !== 0) throw new Error('Active index is not live')
if (spreadLayer.togglePattern(0) !== null) throw new Error('Second click did not disable pattern')
if (spreadLayer.isActive()) throw new Error('Layer did not deactivate')

const engine = new AudioEngine({})
engine.started = true
engine.transport = {
  state: 'stopped',
  position: '0:0:0',
  seconds: 0,
  stop() { this.state = 'stopped' },
  start() { this.state = 'started' },
}

function makeLayer() {
  let index = null
  return {
    togglePattern(next) {
      index = index === next ? null : next
      return index
    },
    isActive() { return index !== null },
    getActiveIndex() { return index },
    getEventCount() { return 0 },
  }
}

engine.layers = {
  drums: makeLayer(),
  texture: makeLayer(),
  bass: makeLayer(),
  melody: makeLayer(),
}

await engine.togglePattern('drums', 0)
if (engine.transport.state !== 'started') throw new Error('Transport did not start with drums')
await engine.togglePattern('bass', 1)
await engine.togglePattern('drums', 0)
if (engine.transport.state !== 'started') throw new Error('Transport stopped while bass is active')
await engine.togglePattern('bass', 1)
if (engine.transport.state !== 'stopped') throw new Error('Transport did not stop after all layers were disabled')

console.log('Self-test PASS: pattern state and Transport switching are correct.')
