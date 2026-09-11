// Web Audio beep cues — no audio file to bundle, works offline.
//
// iOS Safari only lets an AudioContext actually produce sound if it was
// created (or resumed) synchronously inside a real user gesture (a tap).
// A context created later — e.g. from inside a setInterval callback, as
// every subsequent beep during a running timer is — starts silently
// suspended and never plays. So there's exactly one shared context for
// the whole app: unlockAudio() must be called directly inside a click
// handler (e.g. the timer's Start button) to create/resume it, and every
// later beep(), even from a timer, reuses that same already-unlocked
// context instead of creating a new (silently dead) one.
let sharedCtx = null;

function getContext() {
  if (!sharedCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    sharedCtx = new Ctx();
  }
  return sharedCtx;
}

// Call this directly inside a click/tap handler before any beeps are
// needed later from timers — this is what actually unlocks audio on iOS.
export function unlockAudio() {
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// Square wave + a fairly high default volume so it cuts through when the
// phone isn't right next to your ear; a short attack/release envelope
// keeps it from clicking/popping at that volume.
export function beep(freq = 880, durationMs = 200, volume = 0.5, type = 'square') {
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    const dur = durationMs / 1000;
    const attack = Math.min(0.01, dur / 4);
    const release = Math.min(0.03, dur / 4);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.setValueAtTime(volume, Math.max(now + attack, now + dur - release));
    gain.gain.linearRampToValueAtTime(0, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
    // The context is shared and reused for later beeps — never close it here.
  } catch {
    // ignore — visual countdown still works without sound
  }
}

export function beepSequence(notes) {
  // notes: [{freq, duration, delay, volume, type}], each delay is relative to the previous note's start
  let t = 0;
  notes.forEach(({ freq, duration = 200, delay = 0, volume, type }) => {
    t += delay;
    setTimeout(() => beep(freq, duration, volume, type), t);
  });
}
