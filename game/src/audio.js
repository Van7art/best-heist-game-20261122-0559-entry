// Midnight Vault — tiny WebAudio synth. No audio files: every sound is an
// oscillator blip, so the game stays a handful of static files.

let ctx = null;
let muted = false;

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

function ac() {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  try {
    if (!ctx) ctx = new window.AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type, gain, when = 0) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, c.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + when);
    o.stop(c.currentTime + when + dur + 0.02);
  } catch {
    // Audio is decoration; a failure never breaks the game.
  }
}

export const sfx = {
  pickup() { tone(880, 0.12, 'sine', 0.16); tone(1320, 0.16, 'sine', 0.12, 0.07); },
  spotted() { tone(220, 0.18, 'square', 0.08); tone(174, 0.22, 'square', 0.08, 0.12); },
  lockdown() { tone(440, 0.14, 'sawtooth', 0.07); tone(440, 0.14, 'sawtooth', 0.07, 0.18); tone(440, 0.14, 'sawtooth', 0.07, 0.36); },
  caught() { tone(160, 0.5, 'sawtooth', 0.1); tone(110, 0.6, 'sawtooth', 0.1, 0.2); },
  clear() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', 0.12, i * 0.09)); },
  click() { tone(660, 0.05, 'sine', 0.08); },
};
