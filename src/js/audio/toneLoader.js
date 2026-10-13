const TONE_VERSION = '14.7.77'

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve(window.Tone)
    script.onerror = () => {
      script.remove()
      reject(new Error(`Failed to load Tone.js from ${src}`))
    }
    document.head.append(script)
  })
}

export async function loadTone() {
  if (window.Tone) return window.Tone

  const sources = [
    './vendor/Tone.js',
    './node_modules/tone/build/Tone.js',
    `https://cdnjs.cloudflare.com/ajax/libs/tone/${TONE_VERSION}/Tone.js`,
  ]

  for (const source of sources) {
    try {
      const Tone = await loadScript(source)
      if (Tone) return Tone
    } catch {
      // Try the next source. The CDN is the final fallback.
    }
  }

  throw new Error('Tone.js could not be loaded')
}

export { TONE_VERSION }
