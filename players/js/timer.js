// ================================================================
//  PLAYERS - timer.js
//  Reloj local y cuenta atrás de la misión para el jugador
// ================================================================

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
