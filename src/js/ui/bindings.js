import { keyMap } from '../audio/notes.js'

const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]

function reportAudioError(error) {
  const message = error?.message || String(error || 'Не удалось запустить звук')
  console.error(error)
  document.documentElement.classList.add('audio-error')
  document.documentElement.dataset.audioError = message
  document.querySelector('.synth')?.setAttribute('data-audio-error', message)
}

function setExclusiveActive(buttons, activeIndex) {
  buttons.forEach((button, index) => {
    const active = index === activeIndex
    button.classList.toggle('is-active', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function bindPatternGroup(engine, layerName, selector) {
  const buttons = $$(selector)
  buttons.forEach((button, index) => {
    button.addEventListener('click', async () => {
      try {
        const activeIndex = await engine.togglePattern(layerName, index)
        setExclusiveActive(buttons, activeIndex)
      } catch (error) {
        reportAudioError(error)
      }
    })
  })
}

function bindControls(engine, layerName, selector) {
  $$(selector).forEach((input) => {
    input.addEventListener('input', () => {
      engine.setControl(layerName, input.dataset.control, input.value)
    })
  })
}

function bindPresets(engine, layerName, selector) {
  const buttons = $$(selector)
  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await engine.ensureStarted()
        engine.setPreset(layerName, button.dataset.preset)
        buttons.forEach((candidate) => candidate.classList.toggle('is-active', candidate === button))
      } catch (error) {
        reportAudioError(error)
      }
    })
  })
}

export function bindUI(engine) {
  bindPatternGroup(engine, 'drums', '[data-drum-pattern]')
  bindPatternGroup(engine, 'texture', '[data-texture-pattern]')
  bindPatternGroup(engine, 'bass', '[data-bass-pattern]')
  bindPatternGroup(engine, 'melody', '[data-melody-pattern]')

  bindControls(engine, 'texture', '[data-layer="texture"][data-control]')
  bindControls(engine, 'bass', '[data-layer="bass"][data-control]')
  bindControls(engine, 'melody', '[data-layer="melody"][data-control]')

  bindPresets(engine, 'bass', '[data-bass-preset]')
  bindPresets(engine, 'melody', '[data-melody-preset]')

  $$('[data-texture-effect]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await engine.ensureStarted()
        const enabled = button.classList.toggle('is-active')
        button.setAttribute('aria-pressed', String(enabled))
        engine.toggleEffect('texture', button.dataset.textureEffect, enabled)
      } catch (error) {
        reportAudioError(error)
      }
    })
  })

  const heldKeys = new Map()

  window.addEventListener('keydown', async (event) => {
    const key = event.key.toLowerCase()
    const note = keyMap[key]
    if (!note || event.repeat || heldKeys.has(key)) return
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return

    event.preventDefault()
    heldKeys.set(key, note)
    try {
      await engine.startLiveNote(note)
    } catch (error) {
      heldKeys.delete(key)
      reportAudioError(error)
    }
  })

  window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase()
    const note = heldKeys.get(key)
    if (!note) return
    heldKeys.delete(key)
    engine.stopLiveNote(note)
  })

  const panic = () => {
    heldKeys.clear()
    engine.releaseLive()
  }

  window.addEventListener('blur', panic)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) panic()
  })
}
