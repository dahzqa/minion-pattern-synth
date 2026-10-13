import { createPatternLayer } from './patternLayer.js'
import { melodyPatterns, LOOP_END } from './patterns.js'

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, Number(value)))

export function createMelody(Tone, destination) {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.015, decay: 0.15, sustain: 0.3, release: 0.46 },
  })
  const filter = new Tone.Filter({ type: 'lowpass', frequency: 4700, Q: 1.4 })
  const chorus = new Tone.Chorus({ frequency: 1.2, delayTime: 3.2, depth: 0.42, spread: 180, wet: 0.18 }).start()
  const delay = new Tone.PingPongDelay({ delayTime: '8n.', feedback: 0.28, wet: 0.28 })
  const reverb = new Tone.Reverb({ decay: 3.6, preDelay: 0.02, wet: 0.4 })
  const output = new Tone.Gain(0.44)
  synth.chain(filter, chorus, delay, reverb, output, destination)

  const pattern = createPatternLayer(
    Tone,
    melodyPatterns,
    (time, event) => synth.triggerAttackRelease(event.note, event.duration, time, event.velocity),
    LOOP_END,
  )

  const presets = {
    air: { oscillator: 'sine', attack: 0.035, release: 0.9, cutoff: 5200, chorus: 0.34, reverb: 0.5 },
    glass: { oscillator: 'triangle', attack: 0.008, release: 0.38, cutoff: 7800, chorus: 0.16, reverb: 0.32 },
    pulse: { oscillator: 'square', attack: 0.004, release: 0.2, cutoff: 3600, chorus: 0.08, reverb: 0.22 },
    mist: { oscillator: 'sawtooth', attack: 0.08, release: 1.4, cutoff: 3000, chorus: 0.46, reverb: 0.62 },
  }

  function setPreset(name) {
    const preset = presets[name] ?? presets.glass
    synth.set({
      oscillator: { type: preset.oscillator },
      envelope: { attack: preset.attack, release: preset.release },
    })
    filter.frequency.rampTo(preset.cutoff, 0.05)
    chorus.wet.rampTo(preset.chorus, 0.05)
    reverb.wet.rampTo(preset.reverb, 0.05)
  }

  function setControl(name, value) {
    const n = Number(value)
    if (name === 'frequency') filter.frequency.rampTo(n, 0.04)
    if (name === 'delay') delay.wet.rampTo(clamp(n), 0.04)
    if (name === 'volume') output.gain.rampTo(clamp(n), 0.04)
    if (name === 'space') reverb.wet.rampTo(clamp(n), 0.04)
  }

  return {
    ...pattern,
    synth,
    filter,
    chorus,
    delay,
    reverb,
    output,
    ready: reverb.ready ?? Promise.resolve(),
    setPreset,
    setControl,
    triggerAttack(note, time, velocity = 0.7) {
      synth.triggerAttack(note, time, velocity)
    },
    triggerRelease(note, time) {
      synth.triggerRelease(note, time)
    },
    releaseAll(time) {
      synth.releaseAll(time)
    },
  }
}
