// All audio is synthesized with Web Audio — no files, no licenses.
// Unlocked by the title-screen click (a user gesture must create the context).

let ctx = null;
let ambientNodes = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// One soft bell-like note. Each vibe is one note of the leitmotif.
const CHIME_FREQ = { tide: 196.0, masque: 293.66, memory: 392.0 }; // G3, D4, G4

export function playChime(vibe) {
  const f = CHIME_FREQ[vibe];
  if (!f) return;
  const a = ac();
  const t = a.currentTime;
  const osc = a.createOscillator();
  const osc2 = a.createOscillator();
  const g = a.createGain();
  osc.type = "sine";
  osc.frequency.value = f;
  osc2.type = "sine";
  osc2.frequency.value = f * 2.01; // slight shimmer
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
  osc.connect(g);
  osc2.connect(g);
  g.connect(a.destination);
  osc.start(t);
  osc2.start(t);
  osc.stop(t + 1.5);
  osc2.stop(t + 1.5);
}

// Waves: looped filtered noise swelling slowly; distant-party warmth: a low triad, very quiet.
export function playAmbient() {
  if (ambientNodes) return;
  const a = ac();
  const len = 4 * a.sampleRate;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const noise = a.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  const g = a.createGain();
  g.gain.value = 0.05;
  const lfo = a.createOscillator();
  lfo.frequency.value = 0.09; // slow swell, like tide
  const lfoGain = a.createGain();
  lfoGain.gain.value = 0.03;
  lfo.connect(lfoGain);
  lfoGain.connect(g.gain);
  noise.connect(lp);
  lp.connect(g);
  g.connect(a.destination);
  noise.start();
  lfo.start();
  ambientNodes = { noise, lfo, g };
}

export function stopAmbient() {
  if (!ambientNodes) return;
  const { noise, lfo, g } = ambientNodes;
  const t = ac().currentTime;
  g.gain.linearRampToValueAtTime(0.0001, t + 1.2);
  setTimeout(() => { noise.stop(); lfo.stop(); }, 1400);
  ambientNodes = null;
}

// Ending stingers: tiny chord phrases, one mood per ending.
const STINGERS = {
  sea_rises:    { notes: [98.0, 103.8, 196.0],        type: "sawtooth", gain: 0.05, dur: 3.2 }, // dark swell
  perfect_night:{ notes: [220.0, 261.6, 329.6],       type: "sine",     gain: 0.10, dur: 3.0 }, // warm, fading
  almost:       { notes: [246.9, 261.6],              type: "sine",     gain: 0.09, dur: 3.4 }, // unresolved 2nd
  found:        { notes: [196.0, 246.9, 293.7, 392.0],"type": "triangle","gain": 0.10, "dur": 4.0 }, // the leitmotif resolved
};

export function playStinger(key) {
  const s = STINGERS[key];
  if (!s) return;
  const a = ac();
  const t = a.currentTime;
  s.notes.forEach((f, i) => {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = s.type;
    osc.frequency.value = f;
    const start = t + i * 0.22;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(s.gain, start + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, start + s.dur);
    osc.connect(g);
    g.connect(a.destination);
    osc.start(start);
    osc.stop(start + s.dur + 0.1);
  });
}
