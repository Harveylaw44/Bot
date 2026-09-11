// Web Audio beep cues for the skip timer — no audio file to bundle, and it
// works offline. Silently no-ops if Web Audio is unavailable or blocked.
// Square wave + higher default volume so it actually cuts through when the
// phone isn't right next to your ear; a short attack/release envelope keeps
// it from clicking/popping at that volume.
export function beep(freq = 880, durationMs = 200, volume = 0.5, type = 'square') {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
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
    osc.onended = () => ctx.close();
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
