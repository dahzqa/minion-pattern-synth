const stepTime = (step) => {
  const bar = Math.floor(step / 16)
  const insideBar = step % 16
  const beat = Math.floor(insideBar / 4)
  const sixteenth = insideBar % 4
  return `${bar}:${beat}:${sixteenth}`
}

function drumEvents({ kick = [], snare = [], hat = [], openHat = [] }) {
  return [
    ...kick.map((step) => ({ time: stepTime(step), kind: 'kick', velocity: 0.9 })),
    ...snare.map((step) => ({ time: stepTime(step), kind: 'snare', velocity: 0.62 })),
    ...hat.map((step, index) => ({
      time: stepTime(step),
      kind: 'hat',
      velocity: index % 4 === 0 ? 0.24 : 0.16,
    })),
    ...openHat.map((step) => ({ time: stepTime(step), kind: 'openHat', velocity: 0.2 })),
  ]
}

export const BPM = 112
export const LOOP_END = '2m'

// Оригинальные паттерны: современный trap / alt-R&B / club-pop характер,
// без копирования мелодий или ударных партий конкретных песен.
export const drumPatterns = [
  drumEvents({
    kick: [0, 7, 10, 15, 16, 23, 26, 30],
    snare: [4, 12, 20, 28],
    hat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    openHat: [14, 30],
  }),
  drumEvents({
    kick: [0, 4, 8, 12, 16, 20, 24, 28],
    snare: [4, 12, 20, 28],
    hat: [2, 6, 10, 14, 18, 22, 26, 30],
    openHat: [6, 14, 22, 30],
  }),
  drumEvents({
    kick: [0, 3, 7, 10, 14, 16, 19, 23, 25, 30],
    snare: [4, 12, 20, 28],
    hat: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 21, 22, 24, 26, 28, 30, 31],
    openHat: [11, 27],
  }),
]

export const bassPatterns = [
  [
    { time: '0:0:0', note: 'D2', duration: '8n', velocity: 0.86 },
    { time: '0:1:2', note: 'D2', duration: '16n', velocity: 0.7 },
    { time: '0:2:0', note: 'A1', duration: '8n', velocity: 0.82 },
    { time: '0:3:2', note: 'C2', duration: '16n', velocity: 0.68 },
    { time: '1:0:0', note: 'Bb1', duration: '8n', velocity: 0.84 },
    { time: '1:2:0', note: 'C2', duration: '8n', velocity: 0.8 },
    { time: '1:3:2', note: 'A1', duration: '16n', velocity: 0.72 },
  ],
  [
    { time: '0:0:0', note: 'D2', duration: '8n', velocity: 0.82 },
    { time: '0:0:2', note: 'D2', duration: '8n', velocity: 0.72 },
    { time: '0:1:0', note: 'C2', duration: '8n', velocity: 0.78 },
    { time: '0:2:0', note: 'Bb1', duration: '8n', velocity: 0.82 },
    { time: '0:3:0', note: 'C2', duration: '8n', velocity: 0.78 },
    { time: '1:0:0', note: 'D2', duration: '8n', velocity: 0.86 },
    { time: '1:1:0', note: 'F2', duration: '8n', velocity: 0.74 },
    { time: '1:2:0', note: 'C2', duration: '8n', velocity: 0.8 },
    { time: '1:3:0', note: 'A1', duration: '8n', velocity: 0.76 },
  ],
  [
    { time: '0:0:0', note: 'D2', duration: '16n', velocity: 0.9 },
    { time: '0:0:3', note: 'F2', duration: '16n', velocity: 0.72 },
    { time: '0:1:2', note: 'D2', duration: '8n', velocity: 0.82 },
    { time: '0:2:3', note: 'C2', duration: '16n', velocity: 0.78 },
    { time: '0:3:2', note: 'A1', duration: '16n', velocity: 0.74 },
    { time: '1:0:0', note: 'Bb1', duration: '8n', velocity: 0.84 },
    { time: '1:1:3', note: 'C2', duration: '16n', velocity: 0.75 },
    { time: '1:2:2', note: 'D2', duration: '8n', velocity: 0.88 },
    { time: '1:3:3', note: 'A1', duration: '16n', velocity: 0.68 },
  ],
]

export const melodyPatterns = [
  [
    { time: '0:0:0', note: 'D5', duration: '8n', velocity: 0.56 },
    { time: '0:0:2', note: 'F5', duration: '8n', velocity: 0.5 },
    { time: '0:1:2', note: 'A5', duration: '8n', velocity: 0.58 },
    { time: '0:2:2', note: 'G5', duration: '8n', velocity: 0.5 },
    { time: '0:3:0', note: 'F5', duration: '4n', velocity: 0.48 },
    { time: '1:0:0', note: 'C5', duration: '8n', velocity: 0.5 },
    { time: '1:1:0', note: 'D5', duration: '8n', velocity: 0.54 },
    { time: '1:2:0', note: 'F5', duration: '8n', velocity: 0.52 },
    { time: '1:3:0', note: 'A4', duration: '4n', velocity: 0.44 },
  ],
  [
    { time: '0:0:0', note: 'A4', duration: '16n', velocity: 0.56 },
    { time: '0:0:2', note: 'D5', duration: '16n', velocity: 0.58 },
    { time: '0:1:0', note: 'F5', duration: '8n', velocity: 0.54 },
    { time: '0:2:0', note: 'A5', duration: '16n', velocity: 0.58 },
    { time: '0:2:2', note: 'G5', duration: '16n', velocity: 0.48 },
    { time: '0:3:0', note: 'F5', duration: '8n', velocity: 0.52 },
    { time: '1:0:0', note: 'C5', duration: '16n', velocity: 0.5 },
    { time: '1:0:2', note: 'F5', duration: '16n', velocity: 0.54 },
    { time: '1:1:0', note: 'A5', duration: '8n', velocity: 0.58 },
    { time: '1:2:0', note: 'G5', duration: '8n', velocity: 0.5 },
    { time: '1:3:0', note: 'D5', duration: '4n', velocity: 0.48 },
  ],
  [
    { time: '0:0:0', note: 'D5', duration: '16n', velocity: 0.58 },
    { time: '0:0:3', note: 'C5', duration: '16n', velocity: 0.44 },
    { time: '0:1:2', note: 'A4', duration: '16n', velocity: 0.5 },
    { time: '0:2:1', note: 'F5', duration: '16n', velocity: 0.56 },
    { time: '0:3:2', note: 'E5', duration: '8n', velocity: 0.46 },
    { time: '1:0:0', note: 'D5', duration: '16n', velocity: 0.58 },
    { time: '1:0:2', note: 'A5', duration: '16n', velocity: 0.55 },
    { time: '1:1:3', note: 'G5', duration: '16n', velocity: 0.5 },
    { time: '1:2:2', note: 'F5', duration: '16n', velocity: 0.54 },
    { time: '1:3:1', note: 'C5', duration: '8n', velocity: 0.46 },
  ],
]

export const texturePatterns = [
  [
    { time: '0:0:0', note: ['D4', 'F4', 'A4', 'C5'], duration: '2n', velocity: 0.32 },
    { time: '0:2:0', note: ['Bb3', 'D4', 'F4', 'A4'], duration: '2n', velocity: 0.3 },
    { time: '1:0:0', note: ['F3', 'A3', 'C4', 'G4'], duration: '2n', velocity: 0.3 },
    { time: '1:2:0', note: ['C4', 'E4', 'G4', 'D5'], duration: '2n', velocity: 0.28 },
  ],
  [
    { time: '0:0:0', note: ['D4', 'A4', 'E5'], duration: '4n', velocity: 0.27 },
    { time: '0:1:2', note: ['C4', 'G4', 'D5'], duration: '4n', velocity: 0.25 },
    { time: '0:3:0', note: ['Bb3', 'F4', 'C5'], duration: '4n', velocity: 0.28 },
    { time: '1:0:2', note: ['A3', 'E4', 'C5'], duration: '4n', velocity: 0.25 },
    { time: '1:2:0', note: ['C4', 'G4', 'D5'], duration: '2n', velocity: 0.27 },
  ],
]
