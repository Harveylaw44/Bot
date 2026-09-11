// Web Audio beep cues for the skip timer — no audio file to bundle, and it
// works offline. Silently no-ops if Web Audio is unavailable or blocked.
export function beep(freq = 880, durationMs = 150, volume = 0.2) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
    osc.onended = () => ctx.close();
  } catch {
    // ignore — visual countdown still works without sound
  }
}

export function beepSequence(notes) {
  // notes: [{freq, duration, delay}], each delay is relative to the previous note's start
  let t = 0;
  notes.forEach(({ freq, duration = 150, delay = 0 }) => {
    t += delay;
    setTimeout(() => beep(freq, duration), t);
  });
}
