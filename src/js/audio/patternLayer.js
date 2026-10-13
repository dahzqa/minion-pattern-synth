export function createPatternLayer(Tone, patterns, callback, loopEnd = '2m') {
  let activeIndex = null
  let eventCount = 0

  const parts = patterns.map((events) => {
    const part = new Tone.Part((time, event) => {
      eventCount += 1
      callback(time, event)
    }, events)
    part.loop = true
    part.loopEnd = loopEnd
    part.mute = true
    part.start(0)
    return part
  })

  function setPattern(index) {
    parts.forEach((part) => {
      part.mute = true
    })

    activeIndex = index === null ? null : Number(index)
    if (activeIndex !== null && parts[activeIndex]) {
      parts[activeIndex].mute = false
    }
    return activeIndex
  }

  function togglePattern(index) {
    const next = activeIndex === Number(index) ? null : Number(index)
    return setPattern(next)
  }

  // Methods instead of getters are intentional: layer modules spread this object.
  // Object spread evaluates getters only once, which previously froze `active`
  // at false and prevented Tone.Transport from ever starting.
  function getActiveIndex() {
    return activeIndex
  }

  function isActive() {
    return activeIndex !== null
  }

  function getEventCount() {
    return eventCount
  }

  return {
    parts,
    setPattern,
    togglePattern,
    getActiveIndex,
    isActive,
    getEventCount,
  }
}
