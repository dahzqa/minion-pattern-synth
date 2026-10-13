import { createDrums } from './createDrums.js'
import { createBass } from './createBass.js'
import { createMelody } from './createMelody.js'
import { createTexture } from './createTexture.js'
import { BPM, LOOP_END } from './patterns.js'

export class AudioEngine {
  constructor(Tone) {
    this.Tone = Tone
    this.started = false
    this.initializing = null
    this.layers = null
    this.master = null
    this.limiter = null
    this.transport = null
    this.liveNotes = new Set()
    this.pendingControls = new Map()
  }

  async ensureStarted() {
    if (this.started) return
    if (this.initializing) return this.initializing

    this.initializing = (async () => {
      // IMPORTANT: unlock the browser audio context BEFORE creating the synth graph.
      await this.Tone.start()

      const context = this.Tone.getContext?.() ?? this.Tone.context
      if (context?.state !== 'running' && typeof context?.resume === 'function') {
        await context.resume()
      }
      if (context?.rawContext?.state !== 'running' && typeof context?.rawContext?.resume === 'function') {
        await context.rawContext.resume()
      }

      const destination = this.Tone.getDestination?.() ?? this.Tone.Destination
      if (destination) {
        destination.mute = false
        if (destination.volume) destination.volume.value = -2
      }

      // Configure Transport BEFORE creating/starting any Tone.Part.
      // Tone 14.7.77 can behave badly when BPM is changed after ToneEvents
      // have already been scheduled.
      this.transport = this.Tone.getTransport?.() ?? this.Tone.Transport
      this.transport.stop()
      this.transport.cancel(0)
      this.transport.position = '0:0:0'
      this.transport.bpm.value = BPM
      this.transport.timeSignature = 4
      // Each Tone.Part owns its own 2-measure loop. Keeping Transport itself
      // unlooped avoids double-loop/reset edge cases.
      this.transport.loop = false

      this.limiter = new this.Tone.Limiter(-1).toDestination()
      this.master = new this.Tone.Gain(0.92).connect(this.limiter)

      this.layers = {
        drums: createDrums(this.Tone, this.master),
        texture: createTexture(this.Tone, this.master),
        bass: createBass(this.Tone, this.master),
        melody: createMelody(this.Tone, this.master),
      }

      await Promise.all([
        this.layers.texture.ready,
        this.layers.melody.ready,
      ])

      for (const [key, value] of this.pendingControls) {
        const [layerName, controlName] = key.split(':')
        this.layers[layerName]?.setControl?.(controlName, value)
      }
      this.pendingControls.clear()

      this.started = true
      this.initializing = null
    })()

    try {
      await this.initializing
    } catch (error) {
      this.initializing = null
      throw error
    }
  }

  anyPatternActive() {
    if (!this.layers) return false
    return Object.values(this.layers).some((layer) => layer.isActive?.() === true)
  }

  async syncTransport() {
    if (!this.transport) return

    if (this.anyPatternActive()) {
      if (this.transport.state !== 'started') {
        this.transport.stop()
        this.transport.position = '0:0:0'
        // Tone.Part is already scheduled from position 0; start Transport immediately.
        this.transport.start()
      }
      return
    }

    if (this.transport.state === 'started') {
      this.transport.stop()
      this.transport.position = '0:0:0'
    }
  }

  async togglePattern(layerName, index) {
    await this.ensureStarted()
    const layer = this.layers?.[layerName]
    if (!layer) return null

    const activeIndex = layer.togglePattern(Number(index))
    await this.syncTransport()
    return activeIndex
  }

  setControl(layerName, controlName, value) {
    if (!this.layers) {
      this.pendingControls.set(`${layerName}:${controlName}`, value)
      return
    }
    this.layers[layerName]?.setControl?.(controlName, value)
  }

  setPreset(layerName, preset) {
    this.layers?.[layerName]?.setPreset?.(preset)
  }

  toggleEffect(layerName, effectName, enabled) {
    this.layers?.[layerName]?.toggleEffect?.(effectName, enabled)
  }

  async startLiveNote(note) {
    const token = String(note)
    if (this.liveNotes.has(token)) return
    this.liveNotes.add(token)

    try {
      await this.ensureStarted()
      if (!this.liveNotes.has(token)) return
      this.layers.melody.triggerAttack(note, undefined, 0.72)
    } catch (error) {
      this.liveNotes.delete(token)
      throw error
    }
  }

  stopLiveNote(note) {
    const token = String(note)
    if (!this.liveNotes.has(token) || !this.layers) return
    this.liveNotes.delete(token)
    this.layers.melody.triggerRelease(note)
  }

  releaseLive() {
    this.liveNotes.clear()
    this.layers?.melody?.releaseAll?.()
  }

  getStatus() {
    const context = this.Tone.getContext?.() ?? this.Tone.context
    const destination = this.Tone.getDestination?.() ?? this.Tone.Destination
    return {
      started: this.started,
      contextState: context?.state ?? context?.rawContext?.state ?? 'unknown',
      rawContextState: context?.rawContext?.state ?? 'unknown',
      transportState: this.transport?.state ?? 'not-created',
      transportSeconds: this.transport?.seconds ?? 0,
      destinationMuted: destination?.mute ?? false,
      activeLayers: this.layers
        ? Object.fromEntries(Object.entries(this.layers).map(([name, layer]) => [name, layer.getActiveIndex?.() ?? null]))
        : {},
      eventCounts: this.layers
        ? Object.fromEntries(Object.entries(this.layers).map(([name, layer]) => [name, layer.getEventCount?.() ?? 0]))
        : {},
    }
  }

  async testSound() {
    await this.ensureStarted()
    const synth = new this.Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.08, sustain: 0.25, release: 0.2 },
      volume: -10,
    }).toDestination()
    synth.triggerAttackRelease('C5', '8n')
    setTimeout(() => synth.dispose(), 1000)
  }
}
