import { createPatternLayer } from './patternLayer.js'
import { texturePatterns, LOOP_END } from './patterns.js'

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number(value)))

export function createTexture(Tone, destination) {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.45, decay: 0.5, sustain: 0.62, release: 2.4 },
  })
  const filter = new Tone.Filter({ type: 'lowpass', frequency: 5200, Q: 0.65 })
  const chorus = new Tone.Chorus({ frequency: 0.65, delayTime: 4.2, depth: 0.56, spread: 180, wet: 0.18 }).start()
  const tremolo = new Tone.Tremolo({ frequency: 3.2, depth: 0.46, wet: 0 }).start()
  const reverb = new Tone.Reverb({ decay: 5.4, preDelay: 0.03, wet: 0.58 })
  const output = new Tone.Gain(0.32)
  synth.chain(filter, chorus, tremolo, reverb, output, destination)

  const pattern = createPatternLayer(
    Tone,
    texturePatterns,
    (time, event) => synth.triggerAttackRelease(event.note, event.duration, time, event.velocity),
    LOOP_END,
  )

  function setControl(name, value) {
    const n = Number(value)
    if (name === 'volume') output.gain.rampTo(clamp(n), 0.04)
    if (name === 'space') reverb.wet.rampTo(clamp(n), 0.04)
  }

  function toggleEffect(name, enabled) {
    if (name === 'wide') chorus.wet.rampTo(enabled ? 0.56 : 0.18, 0.06)
    if (name === 'pulse') tremolo.wet.rampTo(enabled ? 0.62 : 0, 0.06)
  }

  return {
    ...pattern,
    synth,
    chorus,
    tremolo,
    reverb,
    output,
    ready: reverb.ready ?? Promise.resolve(),
    setControl,
    toggleEffect,
  }
}
