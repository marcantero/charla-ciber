// ================================================================
//  PLAYERS - socket-client.js
//  Gestión de equipo, persistencia y comunicación Socket.io
// ================================================================

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
    console.info('[SOCKET] Modo individual / offline activado.');
  }
}

function selectTeam(num) {
  if (typeof playKeyClick === 'function') playKeyClick();
  initPlayerSocket(num);
}
