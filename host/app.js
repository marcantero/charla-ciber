let appConfig = {
  nombreInstituto: 'IES Tecnológico',
  numeroEquipos: 5,
  claves: {}
};

async function fetchHostConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      applyConfigToHost(data);
    }
  } catch (e) {
    console.warn('Usando configuración local:', e);
  }
}

function applyConfigToHost(cfg) {
  if (!cfg) return;
  appConfig = cfg;
  
  // Actualizar nombre del instituto en los títulos
  document.querySelectorAll('.pres-brand-title').forEach(el => {
    el.textContent = cfg.nombreInstituto || 'IES TECNOLÓGICO';
  });

  // Actualizar mensaje de texto del hacker
  const instEl = document.getElementById('hacker-msg-inst');
  if (instEl) instEl.textContent = cfg.nombreInstituto || 'vuestro instituto';
  
  const teamsEl = document.getElementById('hacker-msg-teams');
  if (teamsEl) teamsEl.textContent = `${cfg.numeroEquipos || 5} grupos`;

  // Reconstruir la parrilla de equipos si aún no ha comenzado la partida
  if (typeof buildInitialTeamsGrid === 'function') {
    buildInitialTeamsGrid();
  }
}

// ================================================================
//  HOST DASHBOARD — APP.JS
//  Presentación Inocente, Hackeo de Anonymous y Monitorización
// ================================================================

// Definición de las 5 fases para visualización
const PHASES_INFO = [
  { num: 1, name: 'AUDIO',    tool: 'Audacity'            },
  { num: 2, name: 'TERMINAL', tool: 'Linux (ls -la, cat)' },
  { num: 3, name: 'FORENSE',  tool: 'exiftool + unzip'    },
  { num: 4, name: 'CRIPTO',   tool: 'GeoGebra (y=ax+b)'   },
  { num: 5, name: 'CLÍMAX',   tool: 'Descifrado Final'    }
];

let teamsState = {};
let isMuted = false;
let audioCtx = null;
let socket = null;
let sirenInterval = null;
let isHackingActive = false;
let hackerMilestones = {
  m1: false, // <= 75%
  m2: false, // <= 40%
  m3: false  // === 0%
};
let weakeningTimerId = null;
let currentWeakeningStage = 0;
let testStageCounter = 1;

// ═══════════════════════════════════════════════════════════
//  1. MOTOR DE AUDIO CIBERNÉTICO & SONIDOS DISTORSIONADOS
// ═══════════════════════════════════════════════════════════
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio no disponible:', e);
  }
}

// 1.1 Glitch de interferencia eléctrica inicial
function playHackGlitchSound() {
  initAudio();
  if (isMuted) return;

  // Intentar cargar MP3 local primero si existe
  const glitchAudio = new Audio('/audio/hack_glitch.mp3');
  glitchAudio.play().catch(() => {
    // Fallback: Sintetizador procedural Web Audio API de cortocircuito
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Ruido blanco filtrado (estática CRT)
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

    // Tono digital chirriante
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

  // Intentar cargar MP3 local primero
  const sirenAudio = new Audio('/audio/siren_alarm.mp3');
  sirenAudio.play().catch(() => {
    // Fallback: Sirena de alarma sintetizada
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

// 1.3 Voz distorsionada del Anónimo / IA
function playAIVoice() {
  initAudio();

  // 1. Generador de graves misteriosos y zumbido de fondo
  if (audioCtx && !isMuted) {
    const now = audioCtx.currentTime;
    
    // Subgraves de tensión (50Hz y 100Hz)
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

  // 2. Comprobar si hay archivo de voz MP3 personalizado en audio/
  const customVoice = new Audio('/audio/anon_voice.mp3');
  customVoice.play().catch(() => {
    // Si no está anon_voice.mp3, probar ai_voice.mp3
    const fallbackVoice = new Audio('/audio/ai_voice.mp3');
    fallbackVoice.play().catch(() => {
      // Fallback a SpeechSynthesis robótica demoníaca
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
    utterance.pitch = 0.22; // Voz ultra grave y amenazante
    utterance.rate = 0.82;  // Ritmo pausado
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);
  }
}

// 1.4 Sonido de avance de fase y victoria
function playAdvanceChime() {
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const freqs = [330, 440, 554, 659, 880];
  freqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const t = now + i * 0.06;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

function playVictoryFanfare() {
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const chord = [261, 329, 392, 523, 659, 784, 1047];
  chord.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const t = now + i * 0.07;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 1.0);
  });
}

// 1.5 Efectos sonoros y voz de debilitamiento del hacker
function playWeakeningSoundFX(stage) {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  if (stage === 1) {
    // Ruido eléctrico + zumbido descendente de desestabilización
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.8);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  } else if (stage === 2) {
    // Alarma disonante triple + chispazo de distorsión
    [320, 480, 240].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const t = now + idx * 0.12;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.5);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  } else if (stage === 3) {
    // Fanfarria triunfal de liberación del instituto
    playVictoryFanfare();
  }
}

function playHackerWeakeningAudio(audioFileName, speechText, stage) {
  if (isMuted) return;
  initAudio();

  // 1. Efecto sonoro de impacto procedural
  playWeakeningSoundFX(stage);

  // Activar animación del ecualizador
  const eqWidget = document.getElementById('weakening-audio-freq');
  if (eqWidget) eqWidget.classList.add('playing');

  // 2. Intentar cargar MP3 personalizado de la carpeta /audio/
  const customAudio = new Audio(`/audio/${audioFileName}`);
  customAudio.play().then(() => {
    console.log(`[AUDIO] Reproduciendo archivo personalizado: /audio/${audioFileName}`);
    customAudio.onended = () => {
      if (eqWidget) eqWidget.classList.remove('playing');
    };
  }).catch((err) => {
    console.log(`[AUDIO] /audio/${audioFileName} no encontrado, usando síntesis de voz procedimental.`);
    // 3. Fallback a voz sintetizada con tono de villano y risa malvada
    speakHackerPhrase(speechText, stage, () => {
      if (eqWidget) eqWidget.classList.remove('playing');
    });
  });
}

function speakHackerPhrase(text, stage, onEndCallback) {
  if (!('speechSynthesis' in window) || isMuted) {
    if (onEndCallback) onEndCallback();
    return;
  }
  window.speechSynthesis.cancel();

  // Convertir marcas como "(risa malvada)" en onomatopeyas legibles para el sintetizador
  let spokenText = text.replace(/\(risa malvada\)/gi, 'jajajajajaja!');
  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = 'es-ES';

  if (stage === 1) {
    utterance.pitch = 0.35; // Grave y amenazante
    utterance.rate = 0.85;
  } else if (stage === 2) {
    utterance.pitch = 0.28; // Tono más inestable y burlón
    utterance.rate = 0.88;
  } else {
    utterance.pitch = 0.22; // Debilitado, colapso final
    utterance.rate = 0.78;
  }
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith('es'));
  if (esVoice) utterance.voice = esVoice;

  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };
  utterance.onerror = () => {
    if (onEndCallback) onEndCallback();
  };

  window.speechSynthesis.speak(utterance);
}

function triggerHackerWeakening(stage, customPhrase, customAudioFile) {
  const overlay = document.getElementById('hacker-weakening-overlay');
  const card = document.getElementById('weakening-card');
  const titleEl = document.getElementById('weakening-status-title');
  const quoteEl = document.getElementById('weakening-dialogue-text');
  const valEl = document.getElementById('weakening-integrity-val');
  const fillEl = document.getElementById('weakening-meter-fill');
  const timerFill = document.getElementById('weakening-timer-fill');

  if (!overlay || !card) return;

  currentWeakeningStage = stage;

  let phrase = customPhrase;
  let audioFile = customAudioFile;
  let title = '';
  let integrityPct = 100;

  if (stage === 1) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito1 && appConfig.mensajesDebilitamiento.hito1.frase) || "Sois más buenos de lo que pensaba, pero esto no ha terminado aún";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito1 && appConfig.mensajesDebilitamiento.hito1.audio) || "hacker_debil1.mp3";
    title = "[!] ANOMALÍA EN EL SERVIDOR // CIFRADO AGRIETADO [75%]";
    integrityPct = 75;
  } else if (stage === 2) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito2 && appConfig.mensajesDebilitamiento.hito2.frase) || "Parece que estabais escuchando en la charla. JAJAJA (risa malvada)";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito2 && appConfig.mensajesDebilitamiento.hito2.audio) || "hacker_debil2.mp3";
    title = "[!!] ALERTA CRÍTICA: FISURA MASIVA EN EL NÚCLEO [40%]";
    integrityPct = 40;
  } else if (stage === 3) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.frase) || "Me habéis derrotado, pero esto no va acabar así, que sepáis que volveré.";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.audio) || "hacker_derrota.mp3";
    title = "[✓✓] ¡VICTORIA TOTAL! SISTEMA DEL INSTITUTO RESTAURADO [0%]";
    integrityPct = 0;
  }

  // Actualizar apariencia
  card.className = `weakening-card tech-frame stage-weakening-${stage}`;
  if (titleEl) titleEl.textContent = title;
  if (quoteEl) quoteEl.textContent = phrase;
  if (valEl) valEl.textContent = integrityPct === 0 ? '0% (NEUTRALIZADO)' : `${integrityPct}%`;
  if (fillEl) fillEl.style.width = `${integrityPct}%`;

  overlay.classList.remove('hidden');

  // Reproducir audio personalizado o voz procedimental
  playHackerWeakeningAudio(audioFile, phrase, stage);

  // Registrar en terminal de eventos
  logTerminalEvent(`[!] INTERCEPTACIÓN: Anonymous se debilita (Fase ${stage}/3). Mensaje transmitido al aula.`, stage === 3 ? 'log-advance' : 'log-alert');

  // Barra de progreso y auto-cierre tras 7.5 segundos
  if (weakeningTimerId) clearTimeout(weakeningTimerId);
  if (timerFill) {
    timerFill.style.transition = 'none';
    timerFill.style.transform = 'scaleX(1)';
    void timerFill.offsetWidth;
    timerFill.style.transition = 'transform 7.5s linear';
    timerFill.style.transform = 'scaleX(0)';
  }

  weakeningTimerId = setTimeout(() => {
    closeWeakeningOverlay();
  }, 7500);
}

function closeWeakeningOverlay() {
  const overlay = document.getElementById('hacker-weakening-overlay');
  if (overlay) overlay.classList.add('hidden');
  if (weakeningTimerId) clearTimeout(weakeningTimerId);
  const eqWidget = document.getElementById('weakening-audio-freq');
  if (eqWidget) eqWidget.classList.remove('playing');
}

function previewWeakeningSequence(specificStage) {
  const stage = specificStage || testStageCounter;
  triggerHackerWeakening(stage);
  testStageCounter = (testStageCounter % 3) + 1;
}

function checkThreatMilestones(threatRemaining, totalSolved) {
  // Disparar solo una vez por hito si ya se ha resuelto alguna fase
  if (totalSolved === 0) return;

  // Hito 1: amenazada reducida a 75% o menos
  if (threatRemaining <= 75 && threatRemaining > 40 && !hackerMilestones.m1) {
    hackerMilestones.m1 = true;
    triggerHackerWeakening(1);
    return;
  }

  // Hito 2: amenaza reducida a 40% o menos
  if (threatRemaining <= 40 && threatRemaining > 0 && !hackerMilestones.m2) {
    hackerMilestones.m1 = true;
    hackerMilestones.m2 = true;
    triggerHackerWeakening(2);
    return;
  }

  // Hito 3: amenaza reducida al 0% (victoria total)
  if (threatRemaining === 0 && !hackerMilestones.m3) {
    hackerMilestones.m1 = true;
    hackerMilestones.m2 = true;
    hackerMilestones.m3 = true;
    triggerHackerWeakening(3);
    return;
  }
}

function toggleMute() {
  isMuted = !isMuted;
  const icon = document.getElementById('mute-icon');
  if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
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

// ═══════════════════════════════════════════════════════════
//  2. MATRIX RAIN CANVAS (Efecto lluvia de datos)
// ═══════════════════════════════════════════════════════════
const matrixCanvas = document.getElementById('matrix-canvas');
const mCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
let matrixCols = [];
const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*<>/[]{}+=';

function resizeMatrix() {
  if (!matrixCanvas) return;
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  const cols = Math.floor(window.innerWidth / 18);
  matrixCols = Array.from({ length: cols }, () => Math.random() * matrixCanvas.height);
}

function drawMatrix() {
  if (!mCtx) return;
  if (document.body.classList.contains('in-formal-presentation')) return;
  mCtx.fillStyle = 'rgba(4, 2, 4, 0.08)';
  mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  mCtx.fillStyle = '#ff003c';
  mCtx.font = '14px "Share Tech Mono", monospace';

  matrixCols.forEach((y, i) => {
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * 18;
    mCtx.fillText(char, x, y);
    if (y > matrixCanvas.height && Math.random() > 0.975) {
      matrixCols[i] = 0;
    } else {
      matrixCols[i] += 16;
    }
  });
}

if (matrixCanvas) {
  resizeMatrix();
  window.addEventListener('resize', resizeMatrix);
  setInterval(drawMatrix, 50);
}

// ═══════════════════════════════════════════════════════════
//  3. RELOJ EN VIVO
// ═══════════════════════════════════════════════════════════
function updateClock() {
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);
  const dateStr = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
  
  const el1 = document.getElementById('pres-live-clock');
  const el2 = document.getElementById('pres-live-date');
  const el3 = document.getElementById('dash-live-time');
  
  if (el1) el1.textContent = timeStr;
  if (el2) el2.textContent = dateStr;
  if (el3) el3.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// ═══════════════════════════════════════════════════════════
//  4. ANIMACIÓN INICIAL DEL HACKEO DE ANONYMOUS
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
  if (btnNext) {
    btnNext.disabled = currentSlide === totalSlides;
  }
}

function triggerHackAnimation() {
  if (isHackingActive) return;
  isHackingActive = true;

  // Romper el modo formal de la presentación
  document.body.classList.remove('in-formal-presentation');
  document.body.classList.add('hacked-mode');

  initAudio();
  playHackGlitchSound();

  // Glitch en el viewport de diapositivas
  const presSlide = document.getElementById('main-slide');
  if (presSlide) {
    presSlide.classList.add('glitching');
  }
  const activeSlide = document.querySelector('.slide-card.active');
  if (activeSlide) {
    activeSlide.classList.add('glitching');
  }

  // Tras 1.3s de glitch destructivo en la diapositiva, irrupción de Anonymous
  setTimeout(() => {
    const presScreen = document.getElementById('presentation-screen');
    const hackScreen = document.getElementById('hack-takeover-screen');

    if (presScreen) presScreen.classList.add('hidden');
    if (hackScreen) hackScreen.classList.remove('hidden');

    // Reproducir sirena y voz distorsionada del Anónimo
    playSirenAlarm();
    setTimeout(playAIVoice, 600);

    // Simular escritura en tiempo real de la terminal de ataque
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

function openHostDashboardFromHack() {
  const hackScreen = document.getElementById('hack-takeover-screen');
  const dashScreen = document.getElementById('host-dashboard-screen');

  if (hackScreen) hackScreen.classList.add('hidden');
  if (dashScreen) dashScreen.classList.remove('hidden');

  logTerminalEvent('Monitorización activada. 5 equipos convocados para neutralizar a Anonymous.', 'log-sys');
}

// Atajos de teclado formales para la presentación y tecla H secreta
window.addEventListener('keydown', (e) => {
  const presScreen = document.getElementById('presentation-screen');
  const isPresVisible = presScreen && !presScreen.classList.contains('hidden');
  const dashScreen = document.getElementById('host-dashboard-screen');
  const isDashVisible = dashScreen && !dashScreen.classList.contains('hidden');

  if (isDashVisible) {
    // Tecla Escape para cerrar overlay o modales
    if (e.key === 'Escape') {
      closeWeakeningOverlay();
      closeResetModal();
      return;
    }

    // Teclas 1, 2, 3 para probar rápidamente las 3 animaciones y audios de debilitamiento
    if (e.key === '1') {
      previewWeakeningSequence(1);
      return;
    } else if (e.key === '2') {
      previewWeakeningSequence(2);
      return;
    } else if (e.key === '3') {
      previewWeakeningSequence(3);
      return;
    }
  }

  if (isPresVisible) {
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
  }
});

// ═══════════════════════════════════════════════════════════
//  5. RENDERIZADO DINÁMICO DE LOS 5 BLOQUES DE EQUIPOS
// ═══════════════════════════════════════════════════════════
function buildInitialTeamsGrid() {
  const grid = document.getElementById('teams-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const numTeams = parseInt((appConfig && appConfig.numeroEquipos) || Object.keys(teamsState).length || 5, 10);
  for (let id = 1; id <= numTeams; id++) {
    const card = document.createElement('div');
    card.className = 'team-card tech-frame state-corrupted-100';
    card.id = `team-card-${id}`;
    card.setAttribute('data-team', id);

    card.innerHTML = `
      <div class="frame-corner top-left"></div>
      <div class="frame-corner top-right"></div>
      <div class="frame-corner bottom-left"></div>
      <div class="frame-corner bottom-right"></div>

      <!-- Cabecera de equipo -->
      <div class="card-header">
        <div>
          <div class="team-node-tag mono">// NODO 0${id}</div>
          <h3 class="team-name" id="team-title-${id}">EQUIPO ${id}</h3>
        </div>
        <div class="online-badge mono" id="team-online-${id}">
          <span class="online-dot"></span> <span class="online-text">EN ESPERA</span>
        </div>
      </div>

      <!-- Medidor de estabilidad del nodo -->
      <div class="stability-section mono">
        <div class="stability-meta">
          <span class="stability-label">ESTABILIDAD:</span>
          <span class="stability-val text-red" id="stability-val-${id}">0% (CORRUPTO)</span>
        </div>
        <div class="stability-bar">
          <div class="stability-fill" id="stability-fill-${id}" style="width: 0%;"></div>
        </div>
      </div>

      <!-- Lista de los 5 retos -->
      <div class="phases-list mono" id="phases-list-${id}">
        ${PHASES_INFO.map(p => `
          <div class="phase-slot" id="slot-${id}-${p.num}">
            <div class="slot-left">
              <span class="slot-num">0${p.num}</span>
              <div>
                <div class="slot-name">${p.name}</div>
                <div class="slot-tool">${p.tool}</div>
              </div>
            </div>
            <span class="slot-badge" id="badge-${id}-${p.num}">BLOQUEADO</span>
          </div>
        `).join('')}
      </div>

      <!-- Pie de tarjeta -->
      <div class="card-footer mono">
        <span id="footer-status-${id}">FASES: 0 / 5</span>
        <span class="winner-badge hidden" id="winner-badge-${id}">★ RESUELTO</span>
      </div>
    `;

    grid.appendChild(card);
  }
}
buildInitialTeamsGrid();

// ═══════════════════════════════════════════════════════════
//  6. ACTUALIZACIÓN DEL ESTADO DE LOS EQUIPOS
// ═══════════════════════════════════════════════════════════
function updateTeamsDisplay(teams) {
  teamsState = teams;
  let totalPhasesSolvedAcrossAll = 0;
  let onlineTeamsCount = 0;

  for (let id = 1; id <= 5; id++) {
    const team = teams[id] || { currentPhase: 0, completedPhases: [], onlineCount: 0 };
    const card = document.getElementById(`team-card-${id}`);
    if (!card) continue;

    const completed = team.completedPhases || [];
    const count = completed.length;
    totalPhasesSolvedAcrossAll += count;

    if (team.onlineCount > 0) onlineTeamsCount++;

    // 1. Estado online
    const onlineBadge = document.getElementById(`team-online-${id}`);
    if (onlineBadge) {
      if (team.onlineCount > 0) {
        onlineBadge.className = 'online-badge online mono';
        onlineBadge.querySelector('.online-text').textContent = 'ONLINE';
      } else {
        onlineBadge.className = 'online-badge mono';
        onlineBadge.querySelector('.online-text').textContent = 'EN ESPERA';
      }
    }

    // 2. Progreso y estabilidad
    const pct = count * 20;
    const stabilityFill = document.getElementById(`stability-fill-${id}`);
    const stabilityVal = document.getElementById(`stability-val-${id}`);
    const footerStatus = document.getElementById(`footer-status-${id}`);
    const winnerBadge = document.getElementById(`winner-badge-${id}`);

    if (stabilityFill) {
      stabilityFill.style.width = pct + '%';
      if (count === 5) {
        stabilityFill.style.background = 'var(--green)';
      } else if (count >= 3) {
        stabilityFill.style.background = 'var(--amber)';
      } else {
        stabilityFill.style.background = 'var(--red)';
      }
    }

    if (stabilityVal) {
      if (count === 5) {
        stabilityVal.textContent = '100% (RESTAURADO)';
        stabilityVal.className = 'stability-val text-green';
      } else if (count >= 3) {
        stabilityVal.textContent = `${pct}% (ESTABILIZANDO)`;
        stabilityVal.className = 'stability-val text-amber';
      } else {
        stabilityVal.textContent = `${pct}% (CIFRADO)`;
        stabilityVal.className = 'stability-val text-red';
      }
    }

    if (footerStatus) {
      footerStatus.textContent = `FASES: ${count} / 5`;
    }

    // 3. Clases de estado del contenedor (de corrupto a purificado)
    card.classList.remove('state-corrupted-100', 'state-corrupted-80', 'state-corrupted-60', 'state-corrupted-40', 'state-corrupted-20', 'state-purified');
    if (count === 0) card.classList.add('state-corrupted-100');
    else if (count === 1) card.classList.add('state-corrupted-80');
    else if (count === 2) card.classList.add('state-corrupted-60');
    else if (count === 3) card.classList.add('state-corrupted-40');
    else if (count === 4) card.classList.add('state-corrupted-20');
    else if (count === 5) {
      card.classList.add('state-purified');
      if (winnerBadge) winnerBadge.classList.remove('hidden');
    }

    // 4. Indicadores individuales de cada fase (1..5)
    for (let p = 1; p <= 5; p++) {
      const slot = document.getElementById(`slot-${id}-${p}`);
      const badge = document.getElementById(`badge-${id}-${p}`);
      if (!slot || !badge) continue;

      if (completed.includes(p)) {
        slot.classList.add('completed');
        badge.textContent = 'VERIFICADO ✓';
      } else {
        slot.classList.remove('completed');
        badge.textContent = 'BLOQUEADO';
      }
    }
  }

  // 5. Actualizar widget de Amenaza Global del Instituto
  const numTeams = parseInt((appConfig && appConfig.numeroEquipos) || Object.keys(teamsState).length || 5, 10);
  const maxPossible = numTeams * 5;
  const threatRemaining = Math.max(0, Math.round(((maxPossible - totalPhasesSolvedAcrossAll) / maxPossible) * 100));

  // 5.1 Comprobar si el nuevo porcentaje activa hitos de debilitamiento
  checkThreatMilestones(threatRemaining, totalPhasesSolvedAcrossAll);
  const threatPctEl = document.getElementById('global-threat-pct');
  const threatFillEl = document.getElementById('global-threat-fill');

  if (threatPctEl) {
    threatPctEl.textContent = threatRemaining + '%';
    if (threatRemaining <= 25) {
      threatPctEl.className = 'threat-pct text-green mono';
    } else if (threatRemaining <= 60) {
      threatPctEl.className = 'threat-pct text-amber mono';
    } else {
      threatPctEl.className = 'threat-pct text-red mono';
    }
  }

  if (threatFillEl) {
    threatFillEl.style.width = threatRemaining + '%';
    if (threatRemaining <= 25) {
      threatFillEl.style.background = 'linear-gradient(90deg, #00ff66, #00e5ff)';
      threatFillEl.style.boxShadow = '0 0 10px var(--green-glow)';
    } else if (threatRemaining <= 60) {
      threatFillEl.style.background = 'linear-gradient(90deg, #ffb000, #ff8800)';
      threatFillEl.style.boxShadow = '0 0 10px var(--amber-glow)';
    } else {
      threatFillEl.style.background = 'linear-gradient(90deg, #ff003c, #ff3355)';
      threatFillEl.style.boxShadow = '0 0 10px var(--red-glow)';
    }
  }

  // 6. Contador de equipos online
  const counterEl = document.getElementById('active-teams-counter');
  if (counterEl) {
    counterEl.textContent = `EQUIPOS ONLINE: ${onlineTeamsCount} / 5`;
  }
}

// ═══════════════════════════════════════════════════════════
//  7. ANIMACIÓN EN TIEMPO REAL: AVANCE DE EQUIPO
// ═══════════════════════════════════════════════════════════
function triggerTeamAdvanceAnimation(data) {
  const { teamId, teamName, phase, totalCompleted, isFinished } = data;
  const card = document.getElementById(`team-card-${teamId}`);
  if (!card) return;

  // Flash intenso y pulso
  card.classList.remove('flash-advance');
  void card.offsetWidth; // Forzar reflow
  card.classList.add('flash-advance');

  // Overlay "Descifrando..."
  const banner = document.createElement('div');
  banner.className = 'decoding-banner';
  banner.innerHTML = `
    <div class="decoding-text mono">&gt;&gt; FASE 0${phase} DESCIFRADA &lt;&lt;</div>
    <div class="mono" style="font-size:0.8rem; color:var(--white-soft);">${PHASES_INFO[phase - 1].name}</div>
  `;
  card.appendChild(banner);
  setTimeout(() => banner.remove(), 2000);

  // Efecto de sonido
  if (isFinished) {
    playVictoryFanfare();
    logTerminalEvent(`🏆 ¡VICTORIA! ${teamName} ha descifrado las 5 fases y recuperado el control del instituto.`, 'log-advance');
  } else {
    playAdvanceChime();
    logTerminalEvent(`[!] ${teamName} ha superado con éxito la FASE 0${phase} (${PHASES_INFO[phase - 1].name}). Progreso: ${totalCompleted}/5`, 'log-advance');
  }
}

// Registro en el terminal de eventos
function logTerminalEvent(msg, typeClass = 'log-sys') {
  const container = document.getElementById('terminal-logs');
  if (!container) return;
  const now = new Date();
  const time = now.toTimeString().slice(0, 8);
  const entry = document.createElement('div');
  entry.className = `log-entry ${typeClass}`;
  entry.textContent = `[${time}] ${msg}`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;
}

// ═══════════════════════════════════════════════════════════
//  8. CLIENTE SOCKET.IO
// ═══════════════════════════════════════════════════════════
function initHostSocket() {
  if (typeof io === 'undefined') {
    console.error('Socket.io no cargado.');
    return;
  }

  socket = io();

  socket.on('connect', () => {
    console.log('[SOCKET HOST] Conectado al servidor.');
    const chipText = document.getElementById('server-status-text');
    if (chipText) chipText.textContent = 'CONECTADO';
    socket.emit('host:init');
    logTerminalEvent('Conexión con el servidor Socket.io establecida con éxito.', 'log-sys');
  });

  socket.on('disconnect', () => {
    console.warn('[SOCKET HOST] Desconectado del servidor.');
    const chipText = document.getElementById('server-status-text');
    if (chipText) chipText.textContent = 'DESCONECTADO';
    logTerminalEvent('Pérdida de señal con el servidor central.', 'log-alert');
  });

  socket.on('host:update', (data) => {
    if (data && data.teams) {
      updateTeamsDisplay(data.teams);
    }
  });

  socket.on('host:team_advanced', (data) => {
    triggerTeamAdvanceAnimation(data);
  });

  socket.on('game:reset', () => {
    hackerMilestones = { m1: false, m2: false, m3: false };
    testStageCounter = 1;
    closeWeakeningOverlay();
    logTerminalEvent('Partida reiniciada desde el servidor central.', 'log-sys');
  });
}

// ═══════════════════════════════════════════════════════════
//  9. MODAL Y REINICIO DE PARTIDA
// ═══════════════════════════════════════════════════════════
function requestResetGame() {
  const modal = document.getElementById('reset-confirm-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeResetModal() {
  const modal = document.getElementById('reset-confirm-modal');
  if (modal) modal.classList.add('hidden');
}

function confirmResetGame() {
  closeResetModal();
  closeWeakeningOverlay();
  hackerMilestones = { m1: false, m2: false, m3: false };
  testStageCounter = 1;
  if (socket && socket.connected) {
    socket.emit('host:reset_game');
    logTerminalEvent('Se ha emitido la orden de REINICIAR toda la partida.', 'log-alert');
  }
}

// Inicializar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  initHostSocket();
});

fetchHostConfig();
