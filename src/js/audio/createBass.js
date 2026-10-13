import { createPatternLayer } from './patternLayer.js'
import { bassPatterns, LOOP_END } from './patterns.js'

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number(value)))

export function createBass(Tone, destination) {
  const synth = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.008, decay: 0.16, sustain: 0.42, release: 0.18 },
    filterEnvelope: { attack: 0.005, decay: 0.12, sustain: 0.25, release: 0.2, baseFrequency: 70, octaves: 2.6 },
  })
  const filter = new Tone.Filter({ type: 'lowpass', frequency: 1250, Q: 2.4 })
  const distortion = new Tone.Distortion({ distortion: 0.15, wet: 0.2, oversample: '2x' })
  const delay = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.18, wet: 0.08 })
  const output = new Tone.Gain(0.62)
  synth.chain(filter, distortion, delay, output, destination)

  const pattern = createPatternLayer(
    Tone,
    bassPatterns,
    (time, event) => synth.triggerAttackRelease(event.note, event.duration, time, event.velocity),
    LOOP_END,
  )

  const presets = {
    sub: { oscillator: 'sine', cutoff: 620, q: 1.2, drive: 0.04, release: 0.24 },
    soft: { oscillator: 'triangle', cutoff: 1250, q: 2.4, drive: 0.15, release: 0.18 },
    hard: { oscillator: 'sawtooth', cutoff: 2100, q: 3.2, drive: 0.28, release: 0.13 },
    dirty: { oscillator: 'square', cutoff: 1500, q: 2.8, drive: 0.52, release: 0.11 },
  }

  function setPreset(name) {
    const preset = presets[name] ?? presets.soft
    synth.set({ oscillator: { type: preset.oscillator }, envelope: { release: preset.release } })
    filter.frequency.rampTo(preset.cutoff, 0.05)
    filter.Q.rampTo(preset.q, 0.05)
    distortion.set({ distortion: preset.drive })
  }

  function setControl(name, value) {
    const n = Number(value)
    if (name === 'frequency') filter.frequency.rampTo(n, 0.04)
    if (name === 'delay') delay.wet.rampTo(clamp(n), 0.04)
    if (name === 'volume') output.gain.rampTo(clamp(n), 0.04)
    if (name === 'drive') distortion.set({ distortion: clamp(n) })
  }

  return { ...pattern, synth, filter, distortion, delay, output, setPreset, setControl }
}
