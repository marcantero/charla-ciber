// ================================================================
//  CHARLA CIBER - Instituto Hackeado
//  Configuration: phases, answers, transitions
// ================================================================

// ================================================================
//  SOUND ENGINE v2 -- Web Audio API | zero external files
// ================================================================
let audioCtx   = null;
let masterGain = null;
let reverbNode = null;
let dryBus     = null;
let wetBus     = null;
let isMuted    = false;
let isHackingActive = false;

function initAudio() {
  if (audioCtx) return;
  try {
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
  } catch (e) {
    console.warn('AudioContext no inicializado:', e);
  }
}

// 1.1 Glitch de interferencia eléctrica inicial
function playHackGlitchSound() {
  initAudio();
  if (isMuted) return;

  const glitchAudio = new Audio('/audio/hack_glitch.mp3');
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

  const sirenAudio = new Audio('/audio/siren_alarm.mp3');
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
  }

  const customVoice = new Audio('/audio/anon_voice.mp3');
  customVoice.play().catch(() => {
    const fallbackVoice = new Audio('/audio/ai_voice.mp3');
    fallbackVoice.play().catch(() => {
      speakSynthesizedAnonymous();
    });
  });
}

function speakSynthesizedAnonymous() {
  if ('speechSynthesis' in window && !isMuted) {
    window.speechSynthesis.cancel();
    const text = "Atención instituto... Si nadie me detiene, todos vuestros sistemas serán cifrados. Tenéis 5 retos para evitarlo.";
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
  const label = document.getElementById('mute-label');
  if (isMuted) {
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3);
    if (btn)   btn.classList.add('muted');
    if (label) label.textContent = 'OFF';
  } else {
    masterGain.gain.setTargetAtTime(0.6, audioCtx.currentTime, 0.3);
    if (btn)   btn.classList.remove('muted');
    if (label) label.textContent = 'ON';
  }
}

document.addEventListener('click',   initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });



const PHASES = [
  { num: '01', name: 'AUDIO',    desc: 'Analiza la señal de audio con Audacity',   tool: 'Audacity'            },
  { num: '02', name: 'TERMINAL', desc: 'Explora los archivos ocultos del servidor', tool: 'Linux (ls -la, cat)' },
  { num: '03', name: 'FORENSE',  desc: 'Inspecciona los metadatos de la imagen',   tool: 'exiftool + unzip'    },
  { num: '04', name: 'CRIPTO',   desc: 'Descifra la función matemática',          tool: 'GeoGebra (y=ax+b)'   },
  { num: '05', name: 'CLÍMAX',   desc: 'Combina todos los códigos y recupera el sistema', tool: 'Colaboración en el aula' },
];

// Answers (case-insensitive). Edit these with your real challenge answers!
const ANSWERS = {
  1: 'HACK',       // Audio clue answer
  2: 'ALFA-7743',  // Terminal key
  3: 'BETA-4491',  // EXIF metadata code
  4: '23',         // GeoGebra: y=2x+3, x=10 -> y=23
  5: 'HACK-ALFA-7743-BETA-4491-23' // Final combination
};

const CORRECT_MSG = [
  '// ACCESO CONCEDIDO — Fase superada correctamente',
  '// CÓDIGO VERIFICADO — Continuad',
  '// AUTENTICACIÓN OK — Excelente trabajo',
  '// SECUENCIA CORRECTA — Sistema parcialmente recuperado',
  '// DESCIFRADO COMPLETO — SISTEMAS RESTAURADOS'
];
const WRONG_MSG = [
  '// ACCESO DENEGADO — Volved a intentarlo',
  '// CÓDIGO INVÁLIDO — Revisad la pista',
  '// ERROR DE AUTENTICACIÓN — Volved a probar',
  '// SECUENCIA INCORRECTA — Hablad con el grupo',
  '// FALLO CRÍTICO — La secuencia no es correcta'
];

// State
let collectedCodes = {};
let currentScreen = 'presentation-screen';

// ═══════════════════════════════════════════════════════════
//  MATRIX RAIN CANVAS
// ═══════════════════════════════════════════════════════════
const matrixCanvas = document.getElementById('matrix-canvas');
const mCtx = matrixCanvas.getContext('2d');
let matrixCols = [];

function resizeMatrix() {
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  const cols = Math.floor(window.innerWidth / 16);
  matrixCols = Array.from({ length: cols }, () => Math.random() * matrixCanvas.height);
}

const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>/\\[]{}';

function drawMatrix() {
  mCtx.fillStyle = 'rgba(10, 6, 8, 0.05)';
  mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  mCtx.fillStyle = '#cc1122';
  mCtx.font = '13px "Share Tech Mono", monospace';

  matrixCols.forEach((y, i) => {
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * 16;
    mCtx.fillText(char, x, y);
    if (y > matrixCanvas.height && Math.random() > 0.975) {
      matrixCols[i] = 0;
    } else {
      matrixCols[i] += 16;
    }
  });
}

resizeMatrix();
window.addEventListener('resize', resizeMatrix);
setInterval(drawMatrix, 50);

// ═══════════════════════════════════════════════════════════
//  LIVE CLOCK
// ═══════════════════════════════════════════════════════════
function updateClock() {
  const el = document.getElementById('live-time');
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);
  const dateStr = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  if (el) el.textContent = timeStr;
  const pClock = document.getElementById('pres-live-clock');
  const pDate = document.getElementById('pres-live-date');
  if (pClock) pClock.textContent = timeStr;
  if (pDate) pDate.textContent = dateStr;
}
updateClock();
setInterval(updateClock, 1000);

// ═══════════════════════════════════════════════════════════
//  BACKGROUND CODE TEXT (Intro)
// ═══════════════════════════════════════════════════════════
const codeSnippets = [
  'ACCESS DENIED', 'SEGFAULT', 'stack overflow', 'KERNEL PANIC',
  'buffer overflow', 'ENCRYPTION_FAIL', 'chmod 777', 'sudo rm -rf',
  'SELECT * FROM users', 'nmap -sV', 'ssh root@', 'nc -lvp 4444',
  'SHELL_EXEC', 'PAYLOAD_INJECTED', 'XSS_DETECTED', 'SQL_INJECTION',
  'FIREWALL_BYPASSED', 'root@0x4A2F', 'metasploit', 'CVE-2024-',
  'BRUTE_FORCE', 'hashcat -a 0', 'john --wordlist', 'MITM_ATTACK'
];

function buildBgCode() {
  const el = document.getElementById('bg-code-text');
  if (!el) return;
  let html = '';
  for (let i = 0; i < 300; i++) {
    const word = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    html += word + ' ';
  }
  el.textContent = html;
}
buildBgCode();

// ═══════════════════════════════════════════════════════════
//  TERMINAL LOOP ANIMATION (Intro)
// ═══════════════════════════════════════════════════════════
const ENCRYPT_FILES = [
  'notas-examen-final-v7.xlsx',
  'apuntes-matematicas-T3.pdf',
  'examenes-parciales-2025.docx',
  'calificaciones-clase-4B.xlsx',
  'trabajos-entregados-abril.zip',
  'notas-fisica-quimica.pdf',
  'control-lengua-castellana.docx',
  'pruebas-acceso-universidad.pdf',
  'passwords-profesores.txt',
  'horarios-examenes-finales.xlsx',
  'notas-historia-mundial.docx',
  'registro-alumnos-2025-26.db',
  'backup-sistema-centro.tar.gz',
  'claves-sistema-SECRETISIMO.txt',
];

let terminalReady = false;
let fileIndex = 0;

function typeTerminal() {
  const cmd = 'encrypt --target=/srv/school --key=AI_MASTER_v4 --all';
  const el = document.getElementById('term-typing-1');
  if (!el) return;
  let i = 0;
  const interval = setInterval(() => {
    if (i < cmd.length) {
      el.textContent += cmd[i++];
      playKeyClick();
    } else {
      clearInterval(interval);
      terminalReady = true;
      setTimeout(() => startNextFile(), 500);
    }
  }, 38);
}

function startNextFile() {
  const wrapper = document.getElementById('term-progress-wrapper');
  const fill    = document.getElementById('progress-fill');
  const pct     = document.getElementById('progress-pct');
  const fname   = document.getElementById('term-filename');
  if (!wrapper || !fill || !pct || !fname) return;

  // Show wrapper the first time
  wrapper.style.display = 'block';

  // Set filename
  const file = ENCRYPT_FILES[fileIndex % ENCRYPT_FILES.length];
  fileIndex++;

  // Animate filename swap: fade out → change → fade in
  fname.style.opacity = '0';
  setTimeout(() => {
    fname.textContent = file;
    fname.style.opacity = '1';
  }, 180);

  // Reset bar
  fill.style.transition = 'none';
  fill.style.width = '0%';
  pct.textContent = '0%';

  // Animate progress 0 → 100
  let progress = 0;
  let lastTickAt = 0;
  const interval = setInterval(() => {
    // Speed: fast at start, slow near end for drama
    let step;
    if      (progress < 60)  step = 1.4;
    else if (progress < 80)  step = 0.7;
    else if (progress < 92)  step = 0.35;
    else if (progress < 99)  step = 0.12;
    else                     step = 0.04;

    progress = Math.min(100, progress + step);
    fill.style.width   = progress + '%';
    pct.textContent    = Math.floor(progress) + '%';

    // Tick sound every ~10%
    if (Math.floor(progress) % 10 === 0 && Math.floor(progress) !== lastTickAt) {
      lastTickAt = Math.floor(progress);
      playProgressTick(Math.floor(progress));
    }

    if (progress >= 100) {
      clearInterval(interval);
      playFileComplete();
      // Brief pause at 100%, then next file
      setTimeout(() => startNextFile(), 600);
    }
  }, 30);
}

// ═══════════════════════════════════════════════════════════
//  ANIMACIÓN DE HACKEO DE ANONYMOUS
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
//  NAVEGACIÓN FORMAL DE DIAPOSITIVAS (1 a 4)
// ═══════════════════════════════════════════════════════════
let currentSlide = 1;
const totalSlides = 4;

function goToSlide(n) {
  if (isHackingActive) return;
  if (n < 1 || n > totalSlides) return;
  currentSlide = n;
  updateSlideDisplay();
}

function nextSlide() {
  if (isHackingActive) return;
  if (currentSlide < totalSlides) {
    currentSlide++;
    updateSlideDisplay();
  }
}

function prevSlide() {
  if (isHackingActive) return;
  if (currentSlide > 1) {
    currentSlide--;
    updateSlideDisplay();
  }
}

function updateSlideDisplay() {
  document.querySelectorAll('.slide-card').forEach((card) => {
    const num = parseInt(card.getAttribute('data-slide'));
    card.classList.toggle('active', num === currentSlide);
  });

  const counterEl = document.getElementById('current-slide-num');
  if (counterEl) counterEl.textContent = currentSlide;

  const dots = document.querySelectorAll('.slide-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx + 1 === currentSlide);
  });

  const btnPrev = document.getElementById('btn-slide-prev');
  const btnNext = document.getElementById('btn-slide-next');
  if (btnPrev) btnPrev.disabled = currentSlide === 1;
  if (btnNext) btnNext.disabled = currentSlide === totalSlides;
}

function triggerHackAnimation() {
  if (isHackingActive) return;
  isHackingActive = true;

  document.body.classList.remove('in-formal-presentation');
  document.body.classList.add('hacked-mode');

  initAudio();
  playHackGlitchSound();

  const presSlide = document.getElementById('main-slide');
  if (presSlide) {
    presSlide.classList.add('glitching');
  }

  // Tras 1.3s de glitch en la diapositiva, irrupción de Anonymous
  setTimeout(() => {
    showScreen('hack-takeover-screen');

    // Reproducir sirena y voz distorsionada
    playSirenAlarm();
    setTimeout(playAIVoice, 600);

    // Escribir terminal de ataque en tiempo real
    simulateAnonymousTerminal();
  }, 1300);
}

// ═══════════════════════════════════════════════════════════
//  TERMINAL DE ATAQUE DE ANONYMOUS — BUCLE CONTINUO DE LOGS
// ═══════════════════════════════════════════════════════════
let anonTerminalInterval = null;
let anonLogIndex = 0;

const HACKER_TERMINAL_LOGS = [
  { text: 'Infiltrando servidores DNS y router gateway 192.168.1.1...', cls: 'text-amber' },
  { text: 'Servidor de calificaciones y expedientes: [ENCRIPTADO]', cls: 'text-red' },
  { text: 'Protocolo de extorsión activado en el IES Tecnológico.', cls: 'text-red' },
  { text: '[!] ALERTA: 5 terminales de alumnos detectadas en la subred.', cls: 'text-amber' },
  { text: 'nmap -sS -p- 192.168.1.0/24 -T4 --open -> 14 hosts activos detectados.', cls: 'text-cyan' },
  { text: 'Host 192.168.1.10 (srv-educativo.ies): Puertos 22, 80, 445, 8080 ABIERTOS.', cls: 'text-amber' },
  { text: 'Analizando banner HTTP: Apache/2.4.41 mod_ssl/2.4.41 OpenSSL/1.1.1', cls: '' },
  { text: 'Inyectando exploit de desbordamiento de búfer CVE-2024-3094...', cls: 'text-red' },
  { text: '[OK] Inyección de shellcode ejecutada: retorno a memoria redirigido.', cls: 'text-green' },
  { text: 'Estableciendo reverse shell cifrado: /dev/tcp/0xanon.dark/4444 -> CONECTADO.', cls: 'text-green' },
  { text: 'Comprobando permisos SUID y sudoers: /usr/bin/python3 cap_setuid+ep encontrado.', cls: '' },
  { text: 'ROOT ACCESO CONCEDIDO: uid=0(root) gid=0(root) grupos=0(root)', cls: 'text-green' },
  { text: 'Neutralizando agentes de monitorización Wazuh y antivirus local...', cls: 'text-amber' },
  { text: 'Vaciando reglas de cortafuegos: iptables -F && iptables -t nat -F -> FIREWALL DOWN.', cls: 'text-red' },
  { text: 'Sobrescribiendo registros en /var/log/auth.log y /var/log/syslog con ceros.', cls: '' },
  { text: 'Iniciando envenenamiento ARP con arpspoof en eth0 (192.168.1.1 -> 192.168.1.50).', cls: 'text-cyan' },
  { text: 'Tráfico de red interceptado: capturando paquetes HTTP no seguros del aula.', cls: 'text-amber' },
  { text: 'Aircrack-ng analizando paquetes WPA2 de la red Wi-Fi de dirección...', cls: 'text-cyan' },
  { text: 'Extrayendo hashes NTLMv2 mediante Responder en subred escolar...', cls: 'text-amber' },
  { text: 'Hashcat desencriptando contraseñas con diccionario: 48 credenciales obtenidas.', cls: 'text-green' },
  { text: 'Credencial encontrada: director@ies.edu -> clave institucional vulnerada.', cls: 'text-red' },
  { text: 'Iniciando motor de cifrado AES-256-GCM + clave asimétrica RSA-4096...', cls: 'text-red' },
  { text: 'Cifrando /srv/db/expedientes_alumnos_2026.sql... [BLOQUEADO 100%]', cls: 'text-red' },
  { text: 'Cifrando /home/secretaria/actas_evaluacion_T3.xlsx... [BLOQUEADO 100%]', cls: 'text-red' },
  { text: 'Cifrando /var/backups/copia_seguridad_ies.tar.gz... [BLOQUEADO 100%]', cls: 'text-red' },
  { text: 'Exfiltrando 4.2 GB de datos comprimidos a nodo Tor darknet...', cls: 'text-cyan' },
  { text: 'Secuestrando cámaras del pasillo: rtsp://camaras-ies:554/feed -> STREAM TOMADO.', cls: 'text-amber' },
  { text: 'Interrumpiendo pantallas y proyectores del centro escolar...', cls: 'text-red' },
  { text: 'Desplegando bloqueo de seguridad en 5 fases criptográficas...', cls: 'text-amber' },
  { text: 'FASE 1: Señal de audio esteganográfico inyectada en espectro acústico.', cls: 'text-cyan' },
  { text: 'FASE 2: Servidor Linux cifrado con clave oculta en el sistema de ficheros.', cls: 'text-cyan' },
  { text: 'FASE 3: Evidencia forense encapsulada en metadatos EXIF de imagen.', cls: 'text-cyan' },
  { text: 'FASE 4: Algoritmo de función afín matemática y=ax+b bloqueando el gateway.', cls: 'text-cyan' },
  { text: 'FASE 5: Clímax de descifrado maestro encadenado a los 5 equipos del aula.', cls: 'text-cyan' },
  { text: '[ANONYMOUS]: "El reloj corre. Tenéis 5 retos para evitar el borrado definitivo."', cls: 'text-red' },
  { text: 'Sondeando intentos de conexión de los alumnos: esperando respuestas...', cls: 'text-amber' }
];

function simulateAnonymousTerminal() {
  const terminalOut = document.getElementById('anon-terminal-output');
  if (!terminalOut) return;

  if (anonTerminalInterval) {
    clearInterval(anonTerminalInterval);
    anonTerminalInterval = null;
  }

  anonLogIndex = 0;

  function appendNextLog() {
    if (!terminalOut) return;
    const logItem = HACKER_TERMINAL_LOGS[anonLogIndex];
    anonLogIndex = (anonLogIndex + 1) % HACKER_TERMINAL_LOGS.length;

    const lineEl = document.createElement('div');
    lineEl.className = 'term-log-line ' + (logItem.cls || '');
    lineEl.textContent = '> ' + logItem.text;
    terminalOut.appendChild(lineEl);

    // Mantener las últimas 60 líneas para fluidez máxima sin saturar el DOM
    while (terminalOut.children.length > 60) {
      terminalOut.removeChild(terminalOut.firstChild);
    }

    terminalOut.scrollTop = terminalOut.scrollHeight;
  }

  // Escribir ráfaga inicial y luego bucle continuo infinito
  setTimeout(appendNextLog, 300);
  setTimeout(appendNextLog, 650);
  setTimeout(appendNextLog, 1000);

  setTimeout(() => {
    if (!anonTerminalInterval) {
      anonTerminalInterval = setInterval(appendNextLog, 480);
    }
  }, 1100);
}

function openIntroFromHack() {
  showScreen('intro-screen');
  startAmbientDrone();
  startRandomGlitches();
  if (!terminalReady) {
    setTimeout(typeTerminal, 400);
  }
}

// ═══════════════════════════════════════════════════════════
//  SCREEN NAVIGATION
// ═══════════════════════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.remove('hidden');
    currentScreen = id;
  }
}

function startMission() {
  showScreen('briefing-screen');
}

function startPhase(num) {
  runTransition(num, () => {
    showScreen('phase-' + num + '-screen');
    updatePhaseDots(num);
  });
}

function updatePhaseDots(activeNum) {
  document.querySelectorAll('.phase-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i + 1 < activeNum) dot.classList.add('done');
    else if (i + 1 === activeNum) dot.classList.add('active');
  });
}

// ═══════════════════════════════════════════════════════════
//  TRANSITION ANIMATION
// ═══════════════════════════════════════════════════════════
function runTransition(phaseNum, callback) {
  const phase = PHASES[phaseNum - 1];
  document.getElementById('trans-num').textContent = phase.num;
  document.getElementById('trans-name').textContent = phase.name;
  document.getElementById('trans-desc').textContent = phase.desc;

  const barFill = document.getElementById('trans-bar-fill');
  const pct = document.getElementById('trans-pct');
  barFill.style.width = '0%';
  pct.textContent = '0%';

  showScreen('transition-screen');
  playWhoosh();

  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    barFill.style.width = progress + '%';
    pct.textContent = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(callback, 200);
    }
  }, 25);
}

// ═══════════════════════════════════════════════════════════
//  ANSWER CHECKING
// ═══════════════════════════════════════════════════════════
function checkAnswer(phaseNum) {
  const input = document.getElementById('ans-' + phaseNum);
  const feedback = document.getElementById('feedback-' + phaseNum);
  if (!input || !feedback) return;

  const userAnswer = input.value.trim().toUpperCase();
  const correctAnswer = String(ANSWERS[phaseNum]).toUpperCase();

  if (userAnswer === correctAnswer) {
    playSuccess();
    feedback.textContent = CORRECT_MSG[phaseNum - 1];
    feedback.className = 'answer-feedback correct';
    collectedCodes[phaseNum] = ANSWERS[phaseNum];

    // Update briefing table status
    const row = document.getElementById('row-' + phaseNum);
    if (row) {
      const statusEl = row.querySelector('.ph-status');
      if (statusEl) {
        statusEl.textContent = '[ COMPLETADO ]';
        statusEl.className = 'ph-col ph-status status-done';
      }
    }

    // Update climax codes display
    const codeDisplay = document.getElementById('col-code-' + phaseNum);
    if (codeDisplay) {
      codeDisplay.textContent = ANSWERS[phaseNum];
      codeDisplay.classList.add('revealed');
    }

    // Auto-advance after delay (except phase 5)
    if (phaseNum < 5) {
      input.disabled = true;
      setTimeout(() => {
        if (phaseNum === 4) {
          startPhase(5);
        } else {
          startPhase(phaseNum + 1);
        }
      }, 2000);
    } else {
      // VICTORY
      setTimeout(() => {
        showScreen('victory-screen');
        launchVictoryEffect();
      }, 1500);
    }
  } else {
    playError();
    feedback.textContent = WRONG_MSG[phaseNum - 1];
    feedback.className = 'answer-feedback wrong';
    // Shake input
    input.style.borderColor = '#cc1122';
    input.style.animation = 'none';
    setTimeout(() => {
      input.style.borderColor = '';
    }, 1500);
  }
}

// Allow Enter key on inputs
document.querySelectorAll('.hack-input').forEach((input, i) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const phaseNum = i + 1;
      checkAnswer(phaseNum);
    }
  });
});

// ═══════════════════════════════════════════════════════════
//  VICTORY EFFECT
// ═══════════════════════════════════════════════════════════
function launchVictoryEffect() {
  // Victory chord: full ascending arp
  if (audioCtx && !isMuted) {
    const notes = [261, 329, 392, 523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const t = audioCtx.currentTime + i * 0.08;
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(g); mix(g);
      osc.start(t); osc.stop(t + 0.65);
    });
  }
  // Flash matrix green
  let flashCount = 0;
  const flashInterval = setInterval(() => {
    flashCount++;
    mCtx.fillStyle = flashCount % 2 === 0 ? '#00ff66' : '#0a0608';
    if (flashCount > 6) {
      clearInterval(flashInterval);
      mCtx.fillStyle = '#00ff66';
    }
  }, 150);
}

// ═══════════════════════════════════════════════════════════
//  PHASE 2 TERMINAL — Reveal key with delay for drama
// ═══════════════════════════════════════════════════════════
// The terminal key is already visible in HTML, this keeps immersion
// by making the hidden files appear highlighted

// ═══════════════════════════════════════════════════════════
//  KEYBOARD SHORTCUT: Press ESC to go back to briefing
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
//  ATAJOS DE TECLADO: Tecla H Secreta, Flechas para Diapositivas
// ═══════════════════════════════════════════════════════════
document.addEventListener('keydown', (e) => {
  if (currentScreen === 'presentation-screen') {
    // Tecla 'H' o 'h': Disparador secreto del hackeo de Anonymous
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      triggerHackAnimation();
      return;
    }

    // Teclas estándar para una presentación formal
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    }
  } else if (currentScreen === 'hack-takeover-screen') {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      openIntroFromHack();
    }
  } else if (e.key === 'Escape' && currentScreen !== 'intro-screen' && currentScreen !== 'victory-screen') {
    showScreen('briefing-screen');
  }
});
