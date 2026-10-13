import { createPatternLayer } from './patternLayer.js'
import { drumPatterns, LOOP_END } from './patterns.js'

export function createDrums(Tone, destination) {
  const bus = new Tone.Gain(0.8).connect(destination)

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.035,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.24, sustain: 0, release: 0.08 },
  }).connect(bus)

  const snareFilter = new Tone.Filter(1800, 'bandpass').connect(bus)
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.02 },
  }).connect(snareFilter)

  const hatFilter = new Tone.Filter(6400, 'highpass').connect(bus)
  const hat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.045, sustain: 0, release: 0.015 },
  }).connect(hatFilter)

  const openHat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.04 },
  }).connect(hatFilter)

  const pattern = createPatternLayer(
    Tone,
    drumPatterns,
    (time, event) => {
      if (event.kind === 'kick') kick.triggerAttackRelease('C1', '8n', time, event.velocity)
      if (event.kind === 'snare') snare.triggerAttackRelease('16n', time, event.velocity)
      if (event.kind === 'hat') hat.triggerAttackRelease('32n', time, event.velocity)
      if (event.kind === 'openHat') openHat.triggerAttackRelease('8n', time, event.velocity)
    },
    LOOP_END,
  )

  return { ...pattern, bus }
}
