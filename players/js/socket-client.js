// ================================================================
//  PLAYERS - socket-client.js
//  Gestión de equipo, persistencia y sincronización Cloud en Tiempo Real
// ================================================================

let socket = null;
let mqttPlayerClient = null;
let currentTeamId = null;
let currentTeamName = 'Equipo 1';
let playerHeartbeatTimer = null;

const MQTT_BROKERS = [
  'wss://test.mosquitto.org:8081',
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt'
];
const MQTT_CHANNEL = 'charla_ciber_vilaromana';
let currentPlayerBrokerIndex = 0;
let mqttPlayerConnectingTimer = null;

function updatePlayerStatusBadge(isOnline) {
  const teamLabel = document.getElementById('player-team-label');
  if (teamLabel && currentTeamId) {
    if (isOnline) {
      teamLabel.innerHTML = `EQUIPO 0${currentTeamId} <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#00ff88; box-shadow:0 0 8px #00ff88; margin-left:6px; vertical-align:middle;" title="En línea con el Host"></span>`;
    } else {
      teamLabel.textContent = `EQUIPO 0${currentTeamId}`;
    }
  }
}

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

  // Cargar claves específicas de este equipo
  if (typeof applyTeamKeys === 'function') {
    applyTeamKeys(currentTeamId);
  }

  const isGithub = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';

  // 1. Si no es GitHub y socket.io está disponible, probar conexión local
  if (!isGithub && typeof io !== 'undefined') {
    try {
      socket = io({ timeout: 3000 });
      let localConnected = false;

      socket.on('connect', () => {
        localConnected = true;
        console.log(`[SOCKET LOCAL] Conectado como ${currentTeamName}`);
        updatePlayerStatusBadge(true);
        socket.emit('player:join', {
          teamId: currentTeamId,
          teamName: currentTeamName
        });
      });

      socket.on('player:init_state', (data) => {
        applyStateFromHost(data);
      });

      socket.on('game:reset', () => {
        handlePlayerGameReset();
      });

      socket.on('disconnect', () => {
        updatePlayerStatusBadge(false);
      });

      setTimeout(() => {
        if (!localConnected) {
          console.info('[PLAYER] Servidor local no detectado. Iniciando Cloud Realtime (MQTT)...');
          initPlayerMqtt();
        }
      }, 2500);

      return;
    } catch (e) {
      console.warn('[PLAYER] Error iniciando Socket.io local:', e);
    }
  }

  // 2. Conexión Cloud Realtime (MQTT)
  initPlayerMqtt();
}

function initPlayerMqtt(retryCount = 0) {
  if (typeof mqtt === 'undefined') {
    if (retryCount < 10) {
      setTimeout(() => initPlayerMqtt(retryCount + 1), 250);
      return;
    }
    console.warn('[PLAYER MQTT] Librería mqtt no disponible tras varios reintentos.');
    return;
  }

  // Mock de socket para que cualquier llamada a socket.emit funcione transparentemente
  socket = {
    connected: true,
    emit: function(event, data) {
      if (event === 'player:phase_complete') {
        sendPlayerPhaseAdvance(data.phase || data.fase_completada);
      } else if (event === 'player:join') {
        sendPlayerJoinMqtt();
      }
    },
    on: function() {}
  };

  const brokerUrl = MQTT_BROKERS[currentPlayerBrokerIndex];
  const clientId = 'player_' + currentTeamId + '_' + Math.random().toString(16).substring(2, 8);
  console.log(`[PLAYER CLOUD] Conectando a ${brokerUrl}...`);

  if (mqttPlayerClient) {
    try { mqttPlayerClient.end(true); } catch(e) {}
    mqttPlayerClient = null;
  }

  let isConnected = false;
  try {
    mqttPlayerClient = mqtt.connect(brokerUrl, {
      clientId: clientId,
      clean: true,
      keepalive: 30,
      connectTimeout: 4000
    });
  } catch (e) {
    console.warn('[PLAYER MQTT] Error en mqtt.connect:', e);
    tryNextPlayerBroker();
    return;
  }

  if (mqttPlayerConnectingTimer) clearTimeout(mqttPlayerConnectingTimer);
  mqttPlayerConnectingTimer = setTimeout(() => {
    if (!isConnected) {
      console.warn(`[PLAYER CLOUD] Timeout conectando a ${brokerUrl}. Probando broker alternativo...`);
      tryNextPlayerBroker();
    }
  }, 4500);

  mqttPlayerClient.on('connect', () => {
    isConnected = true;
    if (mqttPlayerConnectingTimer) clearTimeout(mqttPlayerConnectingTimer);
    console.log(`[CLOUD SYNC] ${currentTeamName} conectado al broker Cloud (${brokerUrl}).`);
    updatePlayerStatusBadge(true);

    // Suscribirse a canales del host
    mqttPlayerClient.subscribe([
      `${MQTT_CHANNEL}/host/update`,
      `${MQTT_CHANNEL}/game/reset`,
      `${MQTT_CHANNEL}/host/ping`
    ], { qos: 1 }, (err) => {
      if (!err) {
        sendPlayerJoinMqtt();
      }
    });

    // Heartbeat periódico (cada 12s)
    if (playerHeartbeatTimer) clearInterval(playerHeartbeatTimer);
    playerHeartbeatTimer = setInterval(() => {
      if (mqttPlayerClient && mqttPlayerClient.connected) {
        mqttPlayerClient.publish(`${MQTT_CHANNEL}/player/heartbeat`, JSON.stringify({
          teamId: currentTeamId,
          timestamp: Date.now()
        }));
      }
    }, 12000);
  });

  mqttPlayerClient.on('message', (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      if (topic === `${MQTT_CHANNEL}/host/ping`) {
        sendPlayerJoinMqtt();
      } else if (topic === `${MQTT_CHANNEL}/game/reset`) {
        handlePlayerGameReset();
      } else if (topic === `${MQTT_CHANNEL}/host/update`) {
        if (data && data.teams && data.teams[currentTeamId]) {
          applyStateFromHost({ team: data.teams[currentTeamId], config: data.config });
        }
      }
    } catch (e) {
      console.warn('[PLAYER MQTT] Error procesando mensaje:', e);
    }
  });

  mqttPlayerClient.on('error', (err) => {
    console.warn('[PLAYER MQTT] Error:', err);
    if (!isConnected) {
      tryNextPlayerBroker();
    } else {
      updatePlayerStatusBadge(false);
    }
  });

  mqttPlayerClient.on('offline', () => {
    updatePlayerStatusBadge(false);
  });
}

function tryNextPlayerBroker() {
  if (mqttPlayerConnectingTimer) clearTimeout(mqttPlayerConnectingTimer);
  if (mqttPlayerClient) {
    try { mqttPlayerClient.end(true); } catch(e) {}
    mqttPlayerClient = null;
  }
  currentPlayerBrokerIndex = (currentPlayerBrokerIndex + 1) % MQTT_BROKERS.length;
  console.info(`[PLAYER CLOUD] Reintentando con broker [${currentPlayerBrokerIndex}]: ${MQTT_BROKERS[currentPlayerBrokerIndex]}`);
  setTimeout(() => initPlayerMqtt(), 500);
}

function sendPlayerJoinMqtt() {
  if (mqttPlayerClient && mqttPlayerClient.connected) {
    mqttPlayerClient.publish(`${MQTT_CHANNEL}/player/join`, JSON.stringify({
      teamId: currentTeamId,
      teamName: currentTeamName,
      timestamp: Date.now()
    }), { qos: 1 });
    console.log(`[CLOUD SYNC] Mensaje de unión emitido para ${currentTeamName}`);
  }
}

// Función global para emitir el avance de fase del alumno al Host
function sendPlayerPhaseAdvance(phaseNum) {
  const p = parseInt(phaseNum, 10);
  console.log(`[CLOUD SYNC] Enviando reto ${p} superado por ${currentTeamName}...`);

  // 1. Emitir por Cloud MQTT
  if (mqttPlayerClient && mqttPlayerClient.connected) {
    mqttPlayerClient.publish(`${MQTT_CHANNEL}/player/advance`, JSON.stringify({
      teamId: currentTeamId,
      teamName: currentTeamName,
      phase: p,
      fase_completada: p,
      timestamp: Date.now()
    }), { qos: 1 });
  }

  // 2. Emitir por Socket.io si existe y está conectado
  if (socket && typeof socket.emit === 'function' && socket !== mqttPlayerClient) {
    try {
      socket.emit('player:phase_complete', {
        teamId: currentTeamId,
        teamName: currentTeamName,
        phase: p,
        fase_completada: p,
        timestamp: Date.now()
      });
    } catch (e) {}
  }
}

function applyStateFromHost(data) {
  if (data && data.team && Array.isArray(data.team.completedPhases)) {
    data.team.completedPhases.forEach(p => {
      if (typeof collectedCodes !== 'undefined' && typeof ANSWERS !== 'undefined') {
        collectedCodes[p] = ANSWERS[p];
      }
      const row = document.getElementById('row-' + p);
      if (row) {
        const statusEl = row.querySelector('.ph-status');
        if (statusEl) {
          statusEl.textContent = '[ COMPLETADO ]';
          statusEl.className = 'ph-col ph-status status-done';
        }
      }
      const codeDisplay = document.getElementById('col-code-' + p);
      if (codeDisplay && typeof ANSWERS !== 'undefined') {
        codeDisplay.textContent = ANSWERS[p];
        codeDisplay.classList.add('revealed');
      }
    });
  }
}

function handlePlayerGameReset() {
  console.warn('[ESCAPE ROOM] La partida ha sido reiniciada por el Host.');
  alert('⚠️ ATENCIÓN: El Host ha reiniciado la partida.');
  location.reload();
}

function selectTeam(num) {
  if (typeof playKeyClick === 'function') playKeyClick();
  initPlayerSocket(num);
}
