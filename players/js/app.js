let appConfig = null;

async function fetchPlayerConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      appConfig = await res.json();
      applyPlayerConfig(appConfig);
    }
  } catch(e) {
    console.warn('Config local fallback:', e);
  }
}

function applyPlayerConfig(cfg) {
  if (!cfg) return;
  appConfig = cfg;
  const numTeams = parseInt(cfg.numeroEquipos || 5, 10);
  renderTeamSelectionButtons(numTeams);
  if (typeof syncPlayerCountdownConfig === 'function') {
    syncPlayerCountdownConfig(cfg);
  }
  if (currentTeamId) {
    applyTeamKeys(currentTeamId);
  }
}

function renderTeamSelectionButtons(count) {
  const container = document.querySelector('.team-buttons-grid');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn-team';
    btn.onclick = () => selectTeam(i);
    btn.innerHTML = `<span class="team-num">0${i}</span>EQUIPO ${i}`;
    container.appendChild(btn);
  }
}

function getTeamKey(teamId, phaseNum) {
  if (appConfig && appConfig.claves && appConfig.claves[teamId]) {
    const tKeys = appConfig.claves[teamId];
    const val = tKeys[phaseNum] || tKeys['reto' + phaseNum] || tKeys['fase' + phaseNum] || tKeys['clave' + phaseNum];
    if (val) return String(val).trim();
  }
  // Fallbacks predeterminados por equipo si no están definidos
  const DEFAULT_MAP = {
    1: { 1: 'HACK', 2: 'ALFA-7743', 3: 'BETA-4491', 4: '23' },
    2: { 1: 'CYBER', 2: 'DELTA-8821', 3: 'GAMMA-3312', 4: '42' },
    3: { 1: 'SHIELD', 2: 'EPSILON-9904', 3: 'OMEGA-1150', 4: '17' },
    4: { 1: 'SECURE', 2: 'SIGMA-6632', 3: 'KAPPA-7721', 4: '35' },
    5: { 1: 'FIREWALL', 2: 'ZETA-5519', 3: 'THETA-8843', 4: '28' }
  };
  const tDefault = DEFAULT_MAP[teamId] || DEFAULT_MAP[1];
  if (phaseNum === 5) {
    return `${tDefault[1]}-${tDefault[2]}-${tDefault[3]}-${tDefault[4]}`;
  }
  return tDefault[phaseNum] || 'HACK';
}

function applyTeamKeys(teamId) {
  for (let p = 1; p <= 5; p++) {
    ANSWERS[p] = getTeamKey(teamId, p);
  }
  console.log(`[CLAVES] Claves personalizadas cargadas para Equipo ${teamId}:`, ANSWERS);
}

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
let currentScreen = 'intro-screen';

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
//  LIVE CLOCK & MISSION COUNTDOWN
// ═══════════════════════════════════════════════════════════
let playerRemainingSeconds = 45 * 60;
let playerTimerStarted = false;

function syncPlayerCountdownConfig(cfg) {
  const mins = parseFloat(cfg.tiempoMinutos || cfg.minutos || cfg.tiempo || 45);
  const totalSecs = Math.max(60, Math.round(mins * 60));
  if (!playerTimerStarted) {
    playerRemainingSeconds = totalSecs;
  }
  updatePlayerCountdown();
}

function updatePlayerCountdown() {
  const el = document.getElementById('player-countdown');
  const badge = document.getElementById('player-timer-badge');
  if (!el) return;

  const total = Math.max(0, playerRemainingSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  let formatted = '';
  if (hours > 0) {
    formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  el.textContent = formatted;

  if (badge) {
    if (total <= 60) {
      badge.classList.add('urgent');
      badge.classList.remove('warning');
    } else if (total <= 300) {
      badge.classList.add('warning');
      badge.classList.remove('urgent');
    } else {
      badge.classList.remove('warning', 'urgent');
    }
  }
}

function updateClock() {
  const el = document.getElementById('live-time');
  if (el) {
    const now = new Date();
    el.textContent = now.toTimeString().slice(0, 8);
  }

  // Si el jugador ya ha empezado la partida (salió de la pantalla de intro)
  const introScreen = document.getElementById('intro-screen');
  if (introScreen && introScreen.classList.contains('hidden')) {
    playerTimerStarted = true;
    if (playerRemainingSeconds > 0) {
      playerRemainingSeconds--;
      updatePlayerCountdown();
    }
  }
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

// Start terminal animation after 600ms
setTimeout(typeTerminal, 600);

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

    // [MULTIJUGADOR] Emitir evento al servidor y al Host
    if (typeof socket !== 'undefined' && socket && socket.connected) {
      socket.emit('player:phase_complete', {
        teamId: currentTeamId,
        teamName: currentTeamName,
        phase: phaseNum,
        fase_completada: phaseNum,
        timestamp: Date.now()
      });
      console.log(`[MULTIJUGADOR] Fase ${phaseNum} emitida para ${currentTeamName}`);
    }

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
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentScreen !== 'intro-screen' && currentScreen !== 'victory-screen') {
    showScreen('briefing-screen');
  }
});


// ═══════════════════════════════════════════════════════════
//  MULTIJUGADOR LOCAL — SOCKET.IO & GESTIÓN DE EQUIPOS
// ═══════════════════════════════════════════════════════════
let socket = null;
let currentTeamId = null;
let currentTeamName = 'Equipo 1';

function initPlayerSocket(teamId) {
  currentTeamId = parseInt(teamId, 10);
  currentTeamName = `Equipo ${currentTeamId}`;

  // Persistir en sessionStorage
  sessionStorage.setItem('ciber_team_id', currentTeamId);

  // Actualizar indicador en la barra superior
  const teamLabel = document.getElementById('player-team-label');
  if (teamLabel) {
    teamLabel.textContent = `EQUIPO 0${currentTeamId}`;
  }

  // Ocultar modal si está abierto
  const modal = document.getElementById('team-modal');
  if (modal) {
    modal.classList.add('hidden');
  }

  // Conectar a Socket.io
  if (typeof io !== 'undefined') {
    if (!socket) {
      socket = io();

      socket.on('connect', () => {
        console.log(`[SOCKET] Conectado al servidor central como ${currentTeamName}`);
        socket.emit('player:join', {
          teamId: currentTeamId,
          teamName: currentTeamName
        });
      });

      socket.on('player:init_state', (data) => {
        console.log('[SOCKET] Estado recibido del servidor:', data);
        if (data && data.team && Array.isArray(data.team.completedPhases)) {
          data.team.completedPhases.forEach(p => {
            collectedCodes[p] = ANSWERS[p];
            const row = document.getElementById('row-' + p);
            if (row) {
              const statusEl = row.querySelector('.ph-status');
              if (statusEl) {
                statusEl.textContent = 'COMPLETADO';
                statusEl.className = 'ph-col ph-status status-done';
              }
            }
            const codeDisplay = document.getElementById('col-code-' + p);
            if (codeDisplay) {
              codeDisplay.textContent = ANSWERS[p];
              codeDisplay.classList.add('revealed');
            }
          });
        }
      });

      socket.on('game:reset', (data) => {
        console.warn('[SOCKET] El escape room ha sido reiniciado por el host.');
        alert('⚠️ ATENCIÓN: El Host ha reiniciado la partida.');
        location.reload();
      });
    } else {
      socket.emit('player:join', {
        teamId: currentTeamId,
        teamName: currentTeamName
      });
    }
  } else {
    console.warn('[SOCKET] Cliente de Socket.io no disponible (modo individual).');
  }
}

function selectTeam(num) {
  if (typeof playKeyClick === 'function') playKeyClick();
  initPlayerSocket(num);
}

// Auto-selección por parámetro URL ?team=X o sesión previa
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const teamParam = urlParams.get('team');
  const savedTeam = sessionStorage.getItem('ciber_team_id');

  if (teamParam && parseInt(teamParam, 10) >= 1 && parseInt(teamParam, 10) <= 20) {
    initPlayerSocket(parseInt(teamParam, 10));
  } else if (savedTeam && parseInt(savedTeam, 10) >= 1 && parseInt(savedTeam, 10) <= 20) {
    initPlayerSocket(parseInt(savedTeam, 10));
  } else {
    const modal = document.getElementById('team-modal');
    if (modal) modal.classList.remove('hidden');
  }
});

fetchPlayerConfig();
