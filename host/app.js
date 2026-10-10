// ================================================================
//  HOST DASHBOARD — APP.JS
//  Control Central, Animaciones en Tiempo Real y Voz IA
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
let isFirstHostInit = true;

// ═══════════════════════════════════════════════════════════
//  1. MOTOR DE AUDIO CIBERNÉTICO (Web Audio API)
// ═══════════════════════════════════════════════════════════
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio no disponible:', e);
  }
}

// Reproduce la voz siniestra distorsionada de la IA al iniciar
function playAIVoice() {
  initAudio();

  // 1. Sintetizador de graves y modulación robótica mediante Web Audio API
  if (audioCtx && !isMuted) {
    const now = audioCtx.currentTime;
    
    // Osciladores de subgrave distorsionado (55Hz y 110Hz)
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, now);
    osc1.frequency.exponentialRampToValueAtTime(38, now + 4.5);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(110, now);
    osc2.frequency.exponentialRampToValueAtTime(75, now + 4.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.Q.value = 8;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 5.0);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 5.2);
    osc2.stop(now + 5.2);

    // Ruido estático de glitch
    playGlitchBurst();
    setTimeout(playGlitchBurst, 800);
    setTimeout(playGlitchBurst, 2100);
  }

  // 2. Intento de cargar audio MP3 si el usuario lo colocó en audio/ai_voice.mp3
  const mp3Audio = new Audio('audio/ai_voice.mp3');
  mp3Audio.play().catch(() => {
    // Si no hay mp3, usamos SpeechSynthesis con pitch ultra grave distorsionado
    speakSynthesizedAI();
  });
}

function speakSynthesizedAI() {
  if ('speechSynthesis' in window && !isMuted) {
    window.speechSynthesis.cancel();
    const text = "Si nadie me detiene, el instituto será cifrado. Tenéis 5 retos para evitarlo.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 0.25; // Voz demoníaca/robótica grave
    utterance.rate = 0.85;  // Ritmo pausado y amenazante
    utterance.volume = 1.0;
    
    // Buscar voz grave si está disponible
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);
  }
}

function playGlitchBurst() {
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const dur = 0.08 + Math.random() * 0.1;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.12, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  src.connect(g);
  g.connect(audioCtx.destination);
  src.start(now);
}

// Sonido cibernético de avance de fase
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

// Sonido épico de victoria para equipo que completa los 5 retos
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
  const el1 = document.getElementById('intro-live-time');
  const el2 = document.getElementById('dash-live-time');
  if (el1) el1.textContent = timeStr;
  if (el2) el2.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// ═══════════════════════════════════════════════════════════
//  4. TRANSICIÓN DE INTRO A DASHBOARD
// ═══════════════════════════════════════════════════════════
function startHostDashboard() {
  playAIVoice();

  const intro = document.getElementById('host-intro-screen');
  const dash = document.getElementById('host-dashboard-screen');

  if (intro) intro.classList.add('hidden');
  if (dash) dash.classList.remove('hidden');

  logTerminalEvent('[HOST] Monitorización central activada. Defensas del instituto en línea.', 'log-sys');
}

// ═══════════════════════════════════════════════════════════
//  5. RENDERIZADO DINÁMICO DE LOS 5 BLOQUES DE EQUIPOS
// ═══════════════════════════════════════════════════════════
function buildInitialTeamsGrid() {
  const grid = document.getElementById('teams-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let id = 1; id <= 5; id++) {
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
  // 5 equipos x 5 fases = 25 fases totales posibles
  const maxPossible = 25;
  const threatRemaining = Math.max(0, Math.round(((maxPossible - totalPhasesSolvedAcrossAll) / maxPossible) * 100));
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
  if (socket && socket.connected) {
    socket.emit('host:reset_game');
    logTerminalEvent('Se ha emitido la orden de REINICIAR toda la partida.', 'log-alert');
  }
}

// Inicializar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  initHostSocket();
});
