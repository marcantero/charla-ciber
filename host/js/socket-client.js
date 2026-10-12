// ================================================================
//  HOST - socket-client.js
//  Conexión Socket.io y sincronización con el servidor
// ================================================================

let socket = null;

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
    if (data && data.config) {
      applyConfigToHost(data.config);
    }
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
    resetMissionTimer();
    logTerminalEvent('Partida reiniciada desde el servidor central.', 'log-sys');
  });
}

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
