// ================================================================
//  HOST - timer.js
//  Reloj en tiempo real y cuenta atrás configurable de la misión
// ================================================================

let missionTotalSeconds = 45 * 60; // 45 minutos por defecto
let missionRemainingSeconds = 45 * 60;
let missionTimerInterval = null;
let isMissionTimerRunning = false;
let isMissionTimerStarted = false;
let hasPlayedTimerWarning = false;
let hasPlayedTimerUrgent = false;

function syncMissionTimerConfig(cfg) {
  const mins = parseFloat(cfg.tiempoMinutos || cfg.minutos || cfg.tiempo || 45);
  const totalSecs = Math.max(60, Math.round(mins * 60));
  missionTotalSeconds = totalSecs;

  // Si no ha empezado a correr, ajustamos el tiempo restante
  if (!isMissionTimerStarted) {
    missionRemainingSeconds = totalSecs;
    hasPlayedTimerWarning = false;
    hasPlayedTimerUrgent = false;
  }
  renderCountdownDisplay();
}

function startMissionTimer() {
  if (isMissionTimerRunning) return;
  isMissionTimerRunning = true;
  isMissionTimerStarted = true;

  const widget = document.getElementById('hud-countdown-widget');
  const btn = document.getElementById('btn-toggle-timer');
  if (widget) widget.classList.remove('paused');
  if (btn) btn.textContent = '⏸';

  if (!missionTimerInterval) {
    missionTimerInterval = setInterval(tickMissionTimer, 1000);
  }
}

function pauseMissionTimer() {
  // El temporizador de la misión no se puede parar
}

function toggleMissionTimer(e) {
  if (e) e.stopPropagation();
  // El temporizador es implacable y no se puede pausar
}

function resetMissionTimer() {
  isMissionTimerRunning = false;
  isMissionTimerStarted = false;
  hasPlayedTimerWarning = false;
  hasPlayedTimerUrgent = false;
  if (missionTimerInterval) {
    clearInterval(missionTimerInterval);
    missionTimerInterval = null;
  }
  const mins = parseFloat((appConfig && (appConfig.tiempoMinutos || appConfig.minutos)) || 45);
  missionTotalSeconds = Math.max(60, Math.round(mins * 60));
  missionRemainingSeconds = missionTotalSeconds;
  
  const widget = document.getElementById('hud-countdown-widget');
  const btn = document.getElementById('btn-toggle-timer');
  if (widget) {
    widget.classList.remove('paused', 'warning', 'urgent');
  }
  if (btn) btn.textContent = '▶';
  renderCountdownDisplay();
}

function tickMissionTimer() {
  if (!isMissionTimerRunning) return;

  if (missionRemainingSeconds > 0) {
    missionRemainingSeconds--;
  }

  // Notificación auditiva y visual al entrar en últimos 5 minutos (300s)
  if (missionRemainingSeconds <= 300 && missionRemainingSeconds > 60 && !hasPlayedTimerWarning) {
    hasPlayedTimerWarning = true;
    logTerminalEvent('⚠️ ADVERTENCIA: Quedan menos de 5 minutos para el cifrado definitivo.', 'log-alert');
    if (!isMuted && typeof playAdvanceChime === 'function') playAdvanceChime();
  }

  // Notificación auditiva y visual en el último minuto (60s)
  if (missionRemainingSeconds <= 60 && missionRemainingSeconds > 0 && !hasPlayedTimerUrgent) {
    hasPlayedTimerUrgent = true;
    logTerminalEvent('🚨 CRÍTICO: ¡ÚLTIMO MINUTO! Bloqueo inminente del sistema escolar.', 'log-alert');
    if (!isMuted && typeof playHackGlitchSound === 'function') playHackGlitchSound();
  }

  if (missionRemainingSeconds === 0) {
    isMissionTimerRunning = false;
    clearInterval(missionTimerInterval);
    missionTimerInterval = null;
    logTerminalEvent('⌛ TIEMPO AGOTADO: La cuenta atrás ha expirado. Protocolo de bloqueo activado.', 'log-alert');
    if (!isMuted && typeof playHackGlitchSound === 'function') playHackGlitchSound();
  }

  renderCountdownDisplay();
}

function renderCountdownDisplay() {
  const digitsEl = document.getElementById('dash-countdown-digits');
  const widget = document.getElementById('hud-countdown-widget');
  if (!digitsEl) return;

  const total = Math.max(0, missionRemainingSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  let formatted = '';
  if (hours > 0) {
    formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  digitsEl.textContent = formatted;

  if (widget) {
    if (total <= 60) {
      widget.classList.add('urgent');
      widget.classList.remove('warning');
    } else if (total <= 300) {
      widget.classList.add('warning');
      widget.classList.remove('urgent');
    } else {
      widget.classList.remove('warning', 'urgent');
    }
  }
}

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
