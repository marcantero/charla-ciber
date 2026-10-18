// ================================================================
//  PLAYERS - app.js
//  Punto de entrada, configuración de equipo e inicialización DOM
// ================================================================

let appConfig = null;

async function fetchPlayerConfig() {
  try {
    if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') {
      const res = await fetch('../config.json');
      if (res.ok) {
        appConfig = await res.json();
        applyPlayerConfig(appConfig);
        return;
      }
    }
    let res = await fetch('/api/config');
    if (!res.ok) {
      res = await fetch('../config.json');
    }
    if (res.ok) {
      appConfig = await res.json();
      applyPlayerConfig(appConfig);
      return;
    }
  } catch(e) {
    try {
      const res = await fetch('../config.json');
      if (res.ok) {
        appConfig = await res.json();
        applyPlayerConfig(appConfig);
      }
    } catch(err) {
      console.warn('Config local fallback:', err);
    }
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
    1: { 1: 'FLAG{127.0.0.1}', 2: 'ALFA-7743', 3: 'BETA-4491', 4: 'R3CT4_C0D1F1C4D4' },
    2: { 1: 'FLAG{127.0.0.1}', 2: 'DELTA-8821', 3: 'GAMMA-3312', 4: 'CR1PT0GR4F14_4F1N' },
    3: { 1: 'FLAG{127.0.0.1}', 2: 'EPSILON-9904', 3: 'OMEGA-1150', 4: '3CU4C10N_R3CT4' },
    4: { 1: 'FLAG{127.0.0.1}', 2: 'SIGMA-6632', 3: 'KAPPA-7721', 4: 'C1FR4D0_L1N34L' },
    5: { 1: 'FLAG{127.0.0.1}', 2: 'ZETA-5519', 3: 'THETA-8843', 4: 'CL4V3_1NV3RS4' }
  };
  const tDefault = DEFAULT_MAP[teamId] || DEFAULT_MAP[1];
  if (phaseNum === 5) {
    return `${tDefault[1]}-${tDefault[2]}-${tDefault[3]}-${tDefault[4]}`;
  }
  return tDefault[phaseNum] || 'FLAG{127.0.0.1}';
}

function applyTeamKeys(teamId) {
  for (let p = 1; p <= 5; p++) {
    ANSWERS[p] = getTeamKey(teamId, p);
  }
  console.log(`[CLAVES] Claves personalizadas cargadas para Equipo ${teamId}:`, ANSWERS);
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

  initInterceptAudioPlayer();
});

fetchPlayerConfig();
