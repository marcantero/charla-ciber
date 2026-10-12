// ================================================================
//  HOST - teams-grid.js
//  Parrilla de equipos, monitorización en vivo y animación de avance
// ================================================================

const PHASES_INFO = [
  { num: 1, name: 'RETO 1' },
  { num: 2, name: 'RETO 2' },
  { num: 3, name: 'RETO 3' },
  { num: 4, name: 'RETO 4' },
  { num: 5, name: 'RETO 5' }
];

let teamsState = {};

function buildInitialTeamsGrid() {
  const grid = document.getElementById('teams-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const numTeams = parseInt((appConfig && appConfig.numeroEquipos) || Object.keys(teamsState).length || 5, 10);

  // Asignar clases dinámicas al grid y al contenedor según el número de equipos
  grid.className = `teams-grid teams-count-${numTeams} ${numTeams >= 6 ? 'many-teams' : ''}`;
  grid.style.setProperty('--teams-cols', numTeams >= 6 ? (numTeams === 6 ? '3' : '4') : numTeams);
  grid.style.setProperty('--teams-count', numTeams);

  const dashScreen = document.getElementById('host-dashboard-screen');
  if (dashScreen) {
    dashScreen.classList.toggle('has-many-teams', numTeams >= 6);
    dashScreen.setAttribute('data-teams-count', numTeams);
  }

  for (let id = 1; id <= numTeams; id++) {
    const card = document.createElement('div');
    card.className = 'team-card tech-frame state-corrupted-100';
    card.id = `team-card-${id}`;
    card.setAttribute('data-team', id);

    const teamCustomName = (appConfig && appConfig.equipos && appConfig.equipos[id] && appConfig.equipos[id].nombre) || `EQUIPO ${id}`;

    card.innerHTML = `
      <div class="frame-corner top-left"></div>
      <div class="frame-corner top-right"></div>
      <div class="frame-corner bottom-left"></div>
      <div class="frame-corner bottom-right"></div>

      <!-- Cabecera de equipo -->
      <div class="card-header">
        <div>
          <div class="team-node-tag mono">// NODO 0${id}</div>
          <h3 class="team-name" id="team-title-${id}">${teamCustomName}</h3>
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
              <div class="slot-name">${p.name}</div>
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

function updateTeamsDisplay(teams) {
  teamsState = teams;
  let totalPhasesSolvedAcrossAll = 0;
  let onlineTeamsCount = 0;

  const numTeams = parseInt((appConfig && appConfig.numeroEquipos) || Object.keys(teamsState).length || 5, 10);

  // Si la cantidad de equipos visualizados difiere de numTeams, reconstruir grid
  const currentCards = document.querySelectorAll('.team-card');
  if (currentCards.length !== numTeams) {
    buildInitialTeamsGrid();
  }

  for (let id = 1; id <= numTeams; id++) {
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
    counterEl.textContent = `EQUIPOS ONLINE: ${onlineTeamsCount} / ${numTeams}`;
  }
}

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
    <div class="decoding-text mono">&gt;&gt; RETO 0${phase} SUPERADO &lt;&lt;</div>
    <div class="mono" style="font-size:0.85rem; color:var(--green); letter-spacing:0.1em;">${PHASES_INFO[phase - 1].name}</div>
  `;
  card.appendChild(banner);
  setTimeout(() => banner.remove(), 2000);

  // Efecto de sonido
  if (isFinished) {
    playVictoryFanfare();
    logTerminalEvent(`🏆 ¡VICTORIA! ${teamName} ha superado los 5 retos y recuperado el control del instituto.`, 'log-advance');
  } else {
    playAdvanceChime();
    logTerminalEvent(`[!] ${teamName} ha superado con éxito el RETO 0${phase}. Progreso: ${totalCompleted}/5`, 'log-advance');
  }
}

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
