// ================================================================
//  PLAYERS - audio.js
//  Motor de sonido v2 (Web Audio API) y reproductor de audio interceptado
// ================================================================

let audioCtx   = null;
let masterGain = null;
let reverbNode = null;
let dryBus     = null;
let wetBus     = null;
let isMuted    = false;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.6;
  masterGain.connect(audioCtx.destination);
  reverbNode = buildReverb();
  dryBus = audioCtx.createGain(); dryBus.gain.value = 0.78;
  wetBus = audioCtx.createGain(); wetBus.gain.value = 0.22;
  reverbNode.connect(wetBus);
  dryBus.connect(masterGain);
  wetBus.connect(masterGain);
  startAmbientDrone();
  startRandomGlitches();
}

// Synthesized convolver reverb
function buildReverb() {
  const len = Math.floor(audioCtx.sampleRate * 1.8);
  const buf = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  const conv = audioCtx.createConvolver();
  conv.buffer = buf;
  return conv;
}

// Route to dry + reverb wet buses
function mix(node) { node.connect(dryBus); node.connect(reverbNode); }

// -- Ambient drone: 5 osc + noise + dual LFOs ------------------
function startAmbientDrone() {
  const filt = audioCtx.createBiquadFilter();
  filt.type = 'lowpass'; filt.frequency.value = 160; filt.Q.value = 2.8;
  // Filter cutoff LFO
  const fLfo = audioCtx.createOscillator(); const fLfoG = audioCtx.createGain();
  fLfo.frequency.value = 0.06; fLfoG.gain.value = 80;
  fLfo.connect(fLfoG); fLfoG.connect(filt.frequency); fLfo.start();
  // Oscillator stack
  [
    { type:'sawtooth', f:36,    g:0.11 },
    { type:'sawtooth', f:36.22, g:0.09 },
    { type:'sine',     f:72.1,  g:0.055 },
    { type:'sine',     f:108.3, g:0.035 },
    { type:'sine',     f:144.8, g:0.022 },
  ].forEach(function(o) {
    var osc = audioCtx.createOscillator(); var g = audioCtx.createGain();
    osc.type = o.type; osc.frequency.value = o.f; g.gain.value = o.g;
    osc.connect(g); g.connect(filt); osc.start();
  });
  // Fan noise (bandpass white noise, looping)
  const nLen = audioCtx.sampleRate * 2;
  const nBuf = audioCtx.createBuffer(1, nLen, audioCtx.sampleRate);
  const nD   = nBuf.getChannelData(0);
  for (let i = 0; i < nLen; i++) nD[i] = Math.random() * 2 - 1;
  const nSrc = audioCtx.createBufferSource();
  const nHPF = audioCtx.createBiquadFilter();
  const nLPF = audioCtx.createBiquadFilter();
  const nG   = audioCtx.createGain();
  nSrc.buffer = nBuf; nSrc.loop = true;
  nHPF.type = 'highpass'; nHPF.frequency.value = 400;
  nLPF.type = 'lowpass';  nLPF.frequency.value = 900;
  nG.gain.value = 0.02;
  nSrc.connect(nHPF); nHPF.connect(nLPF); nLPF.connect(nG); nG.connect(filt);
  nSrc.start();
  // Volume tremolo LFO
  const droneG = audioCtx.createGain(); droneG.gain.value = 0.50;
  const vLfo = audioCtx.createOscillator(); const vLfoG = audioCtx.createGain();
  vLfo.frequency.value = 0.15; vLfoG.gain.value = 0.065;
  vLfo.connect(vLfoG); vLfoG.connect(droneG.gain); vLfo.start();
  filt.connect(droneG); droneG.connect(dryBus); droneG.connect(reverbNode);
}

// -- Glitch bursts (4 varieties) --------------------------------
function startRandomGlitches() {
  (function loop() {
    setTimeout(function() {
      if (!isMuted && audioCtx) {
        [glitchNoise, glitchTone, glitchScratch, glitchStutter][Math.floor(Math.random()*4)]();
      }
      loop();
    }, 1500 + Math.random() * 5000);
  })();
}

function glitchNoise() {
  const dur = 0.025 + Math.random() * 0.07;
  const sz  = Math.floor(audioCtx.sampleRate * dur);
  const buf = audioCtx.createBuffer(1, sz, audioCtx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < sz; i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/sz, 1.8);
  const src = audioCtx.createBufferSource(); src.buffer = buf;
  const bp  = audioCtx.createBiquadFilter(); bp.type='bandpass'; bp.Q.value = 4+Math.random()*6;
  bp.frequency.value = 300 + Math.random()*5000;
  const g = audioCtx.createGain(); g.gain.value = 0.07+Math.random()*0.09;
  src.connect(bp); bp.connect(g); g.connect(masterGain); src.start();
}

function glitchTone() {
  const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
  const t = audioCtx.currentTime;
  const f = [110,220,440,880,1760][Math.floor(Math.random()*5)];
  osc.type = Math.random()>.5 ? 'square' : 'sawtooth'; osc.frequency.value = f;
  osc.frequency.exponentialRampToValueAtTime(f*(0.4+Math.random()*1.2), t+0.07);
  g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.0001, t+0.08);
  osc.connect(g); g.connect(masterGain); osc.start(t); osc.stop(t+0.09);
}

function glitchScratch() {
  const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
  const t = audioCtx.currentTime; const dur = 0.12+Math.random()*0.22;
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1400, t);
  osc.frequency.linearRampToValueAtTime(60,   t+dur*0.3);
  osc.frequency.linearRampToValueAtTime(1100,  t+dur*0.6);
  osc.frequency.linearRampToValueAtTime(180,  t+dur);
  g.gain.setValueAtTime(0.0, t); g.gain.linearRampToValueAtTime(0.1, t+0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t+dur+0.02);
  osc.connect(g); g.connect(masterGain); osc.start(t); osc.stop(t+dur+0.04);
}

function glitchStutter() {
  const n = 3+Math.floor(Math.random()*4);
  for (let p = 0; p < n; p++) {
    const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
    const t = audioCtx.currentTime + p*0.038;
    osc.type = 'square'; osc.frequency.value = 500+Math.random()*600;
    g.gain.setValueAtTime(0.065, t); g.gain.exponentialRampToValueAtTime(0.0001, t+0.03);
    osc.connect(g); g.connect(masterGain); osc.start(t); osc.stop(t+0.035);
  }
}

// -- Keyboard click: noise transient + pitched thud ------------
function playKeyClick() {
  if (!audioCtx || isMuted) return;
  const t = audioCtx.currentTime;
  // Noise transient (attack)
  const nSz  = Math.floor(audioCtx.sampleRate * 0.007);
  const nBuf = audioCtx.createBuffer(1, nSz, audioCtx.sampleRate);
  const nD   = nBuf.getChannelData(0);
  for (let i = 0; i < nSz; i++) nD[i] = (Math.random()*2-1) * (1-i/nSz);
  const nSrc = audioCtx.createBufferSource(); nSrc.buffer = nBuf;
  const nHP  = audioCtx.createBiquadFilter(); nHP.type='highpass'; nHP.frequency.value = 2500;
  const nG   = audioCtx.createGain(); nG.gain.value = 0.2;
  nSrc.connect(nHP); nHP.connect(nG); nG.connect(masterGain); nSrc.start(t);
  // Pitched thud
  const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(260 + Math.random()*130, t);
  osc.frequency.exponentialRampToValueAtTime(75, t+0.028);
  g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.0001, t+0.032);
  osc.connect(g); g.connect(masterGain); osc.start(t); osc.stop(t+0.036);
}

// -- Progress tick: pitch rises with bar % --------------------
function playProgressTick(pct) {
  if (!audioCtx || isMuted) return;
  pct = pct || 50;
  const t    = audioCtx.currentTime;
  const freq = 330 * Math.pow(4, pct/100);
  const osc  = audioCtx.createOscillator(); const g = audioCtx.createGain();
  const osc2 = audioCtx.createOscillator(); const g2= audioCtx.createGain();
  osc.type='sine';  osc.frequency.value = freq;
  osc2.type='sine'; osc2.frequency.value = freq*2; g2.gain.value = 0.25;
  osc2.connect(g2); g2.connect(g);
  g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t+0.09);
  osc.connect(g); mix(g); osc.start(t); osc.stop(t+0.11); osc2.start(t); osc2.stop(t+0.11);
}

// -- File complete: sweep down + double-ping ------------------
function playFileComplete() {
  if (!audioCtx || isMuted) return;
  const t = audioCtx.currentTime;
  const sw = audioCtx.createOscillator(); const swG = audioCtx.createGain();
  sw.type = 'sawtooth';
  sw.frequency.setValueAtTime(1046, t); sw.frequency.exponentialRampToValueAtTime(52, t+0.5);
  swG.gain.setValueAtTime(0.16, t); swG.gain.exponentialRampToValueAtTime(0.0001, t+0.52);
  sw.connect(swG); mix(swG); sw.start(t); sw.stop(t+0.55);
  [0.56, 0.68].forEach(function(d) {
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = 1319;
    g.gain.setValueAtTime(0.11, t+d); g.gain.exponentialRampToValueAtTime(0.0001, t+d+0.12);
    o.connect(g); mix(g); o.start(t+d); o.stop(t+d+0.14);
  });
}

// -- Success: ascending arp + shimmer -------------------------
function playSuccess() {
  if (!audioCtx || isMuted) return;
  const t = audioCtx.currentTime;
  [392, 523, 659, 784, 1047].forEach(function(freq, i) {
    const d  = i * 0.1;
    const o  = audioCtx.createOscillator(); const g  = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0, t+d); g.gain.linearRampToValueAtTime(0.17, t+d+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t+d+0.4);
    o.connect(g); mix(g); o.start(t+d); o.stop(t+d+0.42);
    const o2 = audioCtx.createOscillator(); const g2 = audioCtx.createGain();
    o2.type = 'triangle'; o2.frequency.value = freq*2;
    g2.gain.setValueAtTime(0.06, t+d); g2.gain.exponentialRampToValueAtTime(0.0001, t+d+0.22);
    o2.connect(g2); mix(g2); o2.start(t+d); o2.stop(t+d+0.24);
  });
  [523,659,784,1047,1319].forEach(function(f, i) {
    const d = 0.62+i*0.038;
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.07, t+d); g.gain.exponentialRampToValueAtTime(0.0001, t+d+0.45);
    o.connect(g); mix(g); o.start(t+d); o.stop(t+d+0.48);
  });
}

// -- Error: 3-layer alarm (rumble + buzz + clipped noise) ----
function playError() {
  if (!audioCtx || isMuted) return;
  const t = audioCtx.currentTime;
  const r = audioCtx.createOscillator(); const rG = audioCtx.createGain();
  r.type = 'sawtooth';
  r.frequency.setValueAtTime(85, t); r.frequency.exponentialRampToValueAtTime(38, t+0.45);
  rG.gain.setValueAtTime(0.24, t); rG.gain.exponentialRampToValueAtTime(0.0001, t+0.47);
  r.connect(rG); rG.connect(masterGain); r.start(t); r.stop(t+0.5);
  const b = audioCtx.createOscillator(); const bG = audioCtx.createGain();
  b.type = 'square';
  b.frequency.setValueAtTime(170, t+0.04); b.frequency.exponentialRampToValueAtTime(82, t+0.45);
  bG.gain.setValueAtTime(0.13, t+0.04); bG.gain.exponentialRampToValueAtTime(0.0001, t+0.47);
  b.connect(bG); bG.connect(masterGain); b.start(t+0.04); b.stop(t+0.5);
  const nSz  = Math.floor(audioCtx.sampleRate * 0.18);
  const nBuf = audioCtx.createBuffer(1, nSz, audioCtx.sampleRate);
  const nD   = nBuf.getChannelData(0);
  for (let i=0; i<nSz; i++) nD[i] = Math.max(-1,Math.min(1,(Math.random()*2-1)*5)) * (1-i/nSz);
  const nSrc = audioCtx.createBufferSource(); nSrc.buffer = nBuf;
  const nLP  = audioCtx.createBiquadFilter(); nLP.type='lowpass'; nLP.frequency.value = 700;
  const nG   = audioCtx.createGain(); nG.gain.value = 0.12;
  nSrc.connect(nLP); nLP.connect(nG); nG.connect(masterGain); nSrc.start(t);
}

// -- Whoosh: noise sweep + rising tone ------------------------
function playWhoosh() {
  if (!audioCtx || isMuted) return;
  const t = audioCtx.currentTime; const dur = 0.6;
  const nSz  = Math.floor(audioCtx.sampleRate * dur);
  const nBuf = audioCtx.createBuffer(1, nSz, audioCtx.sampleRate);
  const nD   = nBuf.getChannelData(0);
  for (let i = 0; i < nSz; i++) nD[i] = Math.random() * 2 - 1;
  const nSrc = audioCtx.createBufferSource(); nSrc.buffer = nBuf;
  const nBP  = audioCtx.createBiquadFilter(); nBP.type = 'bandpass'; nBP.Q.value = 1.2;
  nBP.frequency.setValueAtTime(70, t); nBP.frequency.exponentialRampToValueAtTime(7000, t+dur);
  const nG   = audioCtx.createGain();
  nG.gain.setValueAtTime(0, t); nG.gain.linearRampToValueAtTime(0.2, t+dur*0.28);
  nG.gain.exponentialRampToValueAtTime(0.0001, t+dur+0.04);
  nSrc.connect(nBP); nBP.connect(nG); mix(nG); nSrc.start(t); nSrc.stop(t+dur+0.08);
  const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(48, t); osc.frequency.exponentialRampToValueAtTime(960, t+dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.11, t+dur*0.22);
  g.gain.exponentialRampToValueAtTime(0.0001, t+dur+0.04);
  osc.connect(g); mix(g); osc.start(t); osc.stop(t+dur+0.08);
}

// -- Mute toggle -----------------------------------------------
function toggleMute() {
  if (!audioCtx) return;
  isMuted = !isMuted;
  const btn   = document.getElementById('mute-btn');
  const iconOn = document.getElementById('mute-icon-on');
  const iconOff = document.getElementById('mute-icon-off');
  if (isMuted) {
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    if (btn) btn.classList.add('muted');
    if (iconOn) iconOn.style.display = 'none';
    if (iconOff) iconOff.style.display = 'block';
  } else {
    masterGain.gain.setTargetAtTime(0.6, audioCtx.currentTime, 0.05);
    if (btn) btn.classList.remove('muted');
    if (iconOn) iconOn.style.display = 'block';
    if (iconOff) iconOff.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════
//  REPRODUCTOR DE AUDIO CIBERNÉTICO (FASE 01)
// ═══════════════════════════════════════════════════════════
function formatAudioTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function initInterceptAudioPlayer() {
  const audio = document.getElementById('audio-intercept');
  const fill = document.getElementById('audio-timeline-fill');
  const currTime = document.getElementById('audio-time-current');
  const totalTime = document.getElementById('audio-time-total');
  const playBtn = document.getElementById('audio-play-btn');
  const playLabel = document.getElementById('audio-play-label');
  const playIcon = document.getElementById('audio-play-icon');
  const waveBars = document.getElementById('wave-bars');
  if (!audio) return;

  audio.addEventListener('loadedmetadata', () => {
    if (totalTime) totalTime.textContent = formatAudioTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (fill) fill.style.width = pct + '%';
      if (currTime) currTime.textContent = formatAudioTime(audio.currentTime);
      if (totalTime && audio.duration) totalTime.textContent = formatAudioTime(audio.duration);
    }
  });

  audio.addEventListener('play', () => {
    if (playLabel) playLabel.textContent = 'PAUSAR';
    if (playIcon) playIcon.innerHTML = '&#10074;&#10074;';
    if (waveBars) waveBars.classList.add('playing');
  });

  audio.addEventListener('pause', () => {
    if (playLabel) playLabel.textContent = 'REPRODUCIR';
    if (playIcon) playIcon.innerHTML = '&#9658;';
    if (waveBars) waveBars.classList.remove('playing');
  });

  audio.addEventListener('ended', () => {
    if (playLabel) playLabel.textContent = 'REPRODUCIR';
    if (playIcon) playIcon.innerHTML = '&#9658;';
    if (waveBars) waveBars.classList.remove('playing');
    if (fill) fill.style.width = '0%';
    if (currTime) currTime.textContent = '00:00';
  });
}

function toggleInterceptAudio() {
  const audio = document.getElementById('audio-intercept');
  if (!audio) return;
  if (audio.paused) {
    audio.play().catch(err => {
      console.warn('Autoplay bloqueado o error al reproducir audio interceptado:', err);
    });
  } else {
    audio.pause();
  }
}

function seekInterceptAudio(e) {
  const audio = document.getElementById('audio-intercept');
  const timeline = document.getElementById('audio-timeline');
  if (!audio || !timeline || !audio.duration) return;
  const rect = timeline.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
  audio.currentTime = ratio * audio.duration;
}

document.addEventListener('click',   initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });
