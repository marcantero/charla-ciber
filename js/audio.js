// ================================================================
//  STANDALONE - audio.js
//  Motor de sonido procedural Web Audio API y efectos para modo local
// ================================================================

let audioCtx   = null;
let masterGain = null;
let reverbNode = null;
let dryBus     = null;
let wetBus     = null;
let isMuted    = false;
let isHackingActive = false;

function initAudio() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return;
  }
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);
    reverbNode = buildReverb();
    dryBus = audioCtx.createGain(); dryBus.gain.value = 0.78;
    wetBus = audioCtx.createGain(); wetBus.gain.value = 0.22;
    reverbNode.connect(wetBus);
    dryBus.connect(masterGain);
    wetBus.connect(masterGain);
  } catch (e) {
    console.warn('AudioContext no inicializado:', e);
  }
}

// 1.1 Glitch de interferencia eléctrica inicial
function playHackGlitchSound() {
  initAudio();
  if (isMuted) return;

  const glitchAudio = new Audio('audio/laser_attack.wav');
  glitchAudio.play().catch(() => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const dur = 1.2;
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.7;

    const noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = buf;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + dur);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noiseSrc.start(now);

    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.8);
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  });
}

// 1.2 Sirena de alarma de brecha de seguridad
function playSirenAlarm() {
  initAudio();
  if (isMuted) return;

  const sirenAudio = new Audio('audio/boss_alarm.wav');
  sirenAudio.play().catch(() => {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.6);
    osc.frequency.linearRampToValueAtTime(650, now + 1.2);
    osc.frequency.linearRampToValueAtTime(950, now + 1.8);
    osc.frequency.linearRampToValueAtTime(650, now + 2.4);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 2.6);
  });
}

// 1.3 Voz distorsionada del Anónimo
function playAIVoice() {
  initAudio();

  if (audioCtx && !isMuted) {
    try {
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(52, now);
      osc1.frequency.exponentialRampToValueAtTime(36, now + 5.0);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(104, now);
      osc2.frequency.exponentialRampToValueAtTime(72, now + 5.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.Q.value = 6;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 5.8);
      osc2.stop(now + 5.8);
    } catch (e) {}
  }

  // Reproducir audio-hacker-inicio.mp3 y después audio-hacker-inicio2.mp3
  const voice1 = new Audio('audio/audio-hacker-inicio.mp3');
  voice1.play().then(() => {
    voice1.onended = () => {
      const voice2 = new Audio('audio/audio-hacker-inicio2.mp3');
      voice2.play().catch(() => {});
    };
  }).catch(() => {
    const customVoice = new Audio('audio/anon_voice.mp3');
    customVoice.play().catch(() => {
      speakSynthesizedAnonymous();
    });
  });
}

function speakSynthesizedAnonymous() {
  if ('speechSynthesis' in window && !isMuted) {
    window.speechSynthesis.cancel();
    const inst = (appConfig && appConfig.nombreInstituto) ? appConfig.nombreInstituto : 'instituto';
    const numG = (appConfig && appConfig.numeroEquipos) ? appConfig.numeroEquipos : '5';
    const text = `Hola ${inst}, me he infiltrado en vuestro instituto, jajajajaja. Voy a cifrar todos vuestros datos. Pero para que esto sea más divertido voy a dejaros unos retos para que podáis pararme. Tendréis que hacer ${numG} grupos, con el objetivo de intentar pararme con todo lo que habéis aprendido en esta charla. Mucha suerte.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 0.22;
    utterance.rate = 0.82;
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);
  }
}

function toggleMute() {
  isMuted = !isMuted;
  if (masterGain) {
    masterGain.gain.value = isMuted ? 0 : 0.6;
  }
  const onIcon = document.getElementById('mute-icon-on');
  const offIcon = document.getElementById('mute-icon-off');
  const muteBtn = document.getElementById('mute-btn');
  if (onIcon && offIcon) {
    onIcon.style.display = isMuted ? 'none' : 'block';
    offIcon.style.display = isMuted ? 'block' : 'none';
  }
  if (muteBtn) {
    muteBtn.classList.toggle('muted', isMuted);
  }
  if (isMuted && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.warn(err));
  } else {
    document.exitFullscreen().catch(err => console.warn(err));
  }
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
  const nSz  = Math.floor(audioCtx.sampleRate * 0.007);
  const nBuf = audioCtx.createBuffer(1, nSz, audioCtx.sampleRate);
  const nD   = nBuf.getChannelData(0);
  for (let i = 0; i < nSz; i++) nD[i] = (Math.random()*2-1) * (1-i/nSz);
  const nSrc = audioCtx.createBufferSource(); nSrc.buffer = nBuf;
  const nHP  = audioCtx.createBiquadFilter(); nHP.type='highpass'; nHP.frequency.value = 2500;
  const nG   = audioCtx.createGain(); nG.gain.value = 0.2;
  nSrc.connect(nHP); nHP.connect(nG); nG.connect(masterGain); nSrc.start(t);
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

// Intercept audio player
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

const unlockAudio = () => {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
};
['click', 'keydown', 'touchstart', 'pointerdown'].forEach(evt => {
  document.addEventListener(evt, unlockAudio, { passive: true });
});
