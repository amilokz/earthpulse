// Chhoti si awazein WebAudio se banti hain, koi audio file download nahi hoti.
let ctx: AudioContext | null = null;

function tone(freq: number, dur = 0.12, type: OscillatorType = "sine", gain = 0.08, delay = 0) {
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch {}
}

export const sfx = {
  pop: (combo = 1) => tone(420 + combo * 90, 0.14, "triangle"),
  swap: () => tone(300, 0.06, "sine", 0.05),
  bad: () => tone(160, 0.15, "square", 0.04),
  special: () => [0, 0.06, 0.12].forEach((d, i) => tone(520 + i * 160, 0.12, "triangle", 0.07, d)),
  win: () => [0, 0.12, 0.24, 0.36].forEach((d, i) => tone([523, 659, 784, 1046][i], 0.22, "triangle", 0.08, d)),
  lose: () => [0, 0.15].forEach((d, i) => tone([330, 247][i], 0.25, "sine", 0.07, d)),
};
