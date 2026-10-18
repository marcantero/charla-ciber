// ================================================================
//  PLAYERS - socket-client.js
//  Gestión de equipo, persistencia y sincronización Cloud en Tiempo Real
// ================================================================

let socket = null;
let mqttPlayerClient = null;
let localBroadcast = null;
let playerPeer = null;
let playerPeerConn = null;
const PEER_HOST_ID = 'charla-ciber-vilaromana-host';
let currentTeamId = null;
let currentTeamName = 'Equipo 1';
let playerHeartbeatTimer = null;

if (typeof BroadcastChannel !== 'undefined') {
  try {
    localBroadcast = new BroadcastChannel('charla_ciber_vilaromana');
    localBroadcast.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'host_ping') {
        sendPlayerJoinMqtt();
      } else if (data.type === 'game_reset') {
        handlePlayerGameReset();
      } else if (data.type === 'host_update') {
        if (data && data.teams && data.teams[currentTeamId]) {
          applyStateFromHost({ team: data.teams[currentTeamId], config: data.config });
        }
      }
    };
    console.log('[PLAYER] Canal directo entre pestañas activo (BroadcastChannel: 0ms).');
  } catch (e) {}
}

function initPlayerPeer(retryCount = 0) {
  if (typeof Peer === 'undefined') {
    if (retryCount < 10) {
      setTimeout(() => initPlayerPeer(retryCount + 1), 300);
    }
    return;
  }

  try {
    const peerId = 'player_' + currentTeamId + '_' + Math.random().toString(36).substring(2, 7);
    console.log(`[PEER P2P] Creando nodo WebRTC del jugador (${peerId})...`);
    playerPeer = new Peer(peerId, { debug: 1 });

    playerPeer.on('open', (id) => {
      console.log(`[PEER P2P] ✓ Nodo del jugador listo (${id}). Conectando al Host: ${PEER_HOST_ID}`);
      connectToHostPeer();
    });

    playerPeer.on('error', (err) => {
      console.warn('[PEER P2P] Error en Peer jugador:', err);
    });
  } catch (e) {
    console.warn('[PEER P2P] Excepción inicializando jugador PeerJS:', e);
  }
}

function connectToHostPeer() {
  if (!playerPeer) return;
  try {
    playerPeerConn = playerPeer.connect(PEER_HOST_ID, { reliable: true });

    playerPeerConn.on('open', () => {
      console.log('[PEER P2P] ✓ ¡CONECTADO DIRECTO POR WEBRTC P2P AL HOST! Latencia: 0ms.');
      updatePlayerStatusBadge(true);
      sendPlayerJoinP2P();
    });

    playerPeerConn.on('data', (data) => {
      if (!data) return;
      console.log('[PEER P2P] Datos recibidos del Host vía WebRTC:', data.type);
      if (data.type === 'host_update') {
        if (data.teams && data.teams[currentTeamId]) {
          applyStateFromHost({ team: data.teams[currentTeamId], config: data.config });
        }
      } else if (data.type === 'game_reset') {
        handlePlayerGameReset();
      } else if (data.type === 'host_ping') {
        sendPlayerJoinP2P();
      }
    });

    playerPeerConn.on('close', () => {
      console.warn('[PEER P2P] Conexión P2P cerrada con el Host. Reintentando en 3s...');
      setTimeout(connectToHostPeer, 3000);
    });

    playerPeerConn.on('error', (err) => {
      console.warn('[PEER P2P] Error de conexión P2P con el Host:', err);
      setTimeout(connectToHostPeer, 3000);
    });
  } catch (e) {
    console.warn('[PEER P2P] Excepción conectando al Host:', e);
  }
}

function sendPlayerJoinP2P() {
  if (playerPeerConn && playerPeerConn.open) {
    playerPeerConn.send({
      type: 'player_join',
      teamId: currentTeamId,
      teamName: currentTeamName,
      timestamp: Date.now()
    });
  }
}

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

function getPlayerServerUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('server')) {
    const s = params.get('server');
    return s.startsWith('http') ? s : `http://${s}`;
  }
  // Si se sirve desde el servidor Node (ej: http://192.168.1.36:4000/players)
  if (window.location.protocol.startsWith('http') && window.location.port) {
    return window.location.origin;
  }
  return 'http://' + (window.location.hostname || 'localhost') + ':4000';
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

  // Iniciar nodo WebRTC P2P directo con el Host (0ms de latencia en GitHub Pages y LAN)
  initPlayerPeer();

  const serverUrl = getPlayerServerUrl();
  const isGithub = window.location.hostname.includes('github.io');

  // 1. Probar conexión local Socket.io directa (Latencia 0ms)
  if (typeof io !== 'undefined') {
    try {
      console.log(`[SOCKET LOCAL] Conectando a ${serverUrl} como ${currentTeamName}...`);
      socket = io(serverUrl, {
        timeout: 2500,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 25,
        reconnectionDelay: 1000
      });
      let localConnected = false;

      socket.on('connect', () => {
        localConnected = true;
        console.log(`[SOCKET LOCAL] ¡Conectado al servidor Node.js en ${serverUrl}! Latencia: 0ms.`);
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

      if (isGithub) {
        setTimeout(() => {
          if (!localConnected) {
            console.info('[PLAYER] Servidor local no detectado. Iniciando Cloud Realtime (MQTT)...');
            initPlayerMqtt();
          }
        }, 2000);
      }

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
    ], { qos: 0 }, (err) => {
      if (!err) {
        sendPlayerJoinMqtt();
      }
    });

    // Heartbeat periódico (cada 10s)
    if (playerHeartbeatTimer) clearInterval(playerHeartbeatTimer);
    playerHeartbeatTimer = setInterval(() => {
      const hb = { type: 'player_heartbeat', teamId: currentTeamId, timestamp: Date.now() };
      if (playerPeerConn && playerPeerConn.open) {
        try { playerPeerConn.send(hb); } catch (e) {}
      }
      if (localBroadcast) {
        localBroadcast.postMessage(hb);
      }
      if (mqttPlayerClient && mqttPlayerClient.connected) {
        mqttPlayerClient.publish(`${MQTT_CHANNEL}/player/heartbeat`, JSON.stringify(hb), { qos: 0 });
      }
    }, 10000);
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
  const payload = {
    type: 'player_join',
    teamId: currentTeamId,
    teamName: currentTeamName,
    timestamp: Date.now()
  };

  // 1. Notificar por WebRTC P2P directo al Host si está conectado (0-2ms)
  if (playerPeerConn && playerPeerConn.open) {
    try { playerPeerConn.send(payload); } catch(e) {}
  }

  // 2. Notificar por BroadcastChannel si hay pestañas abiertas en el mismo navegador (0ms)
  if (localBroadcast) {
    localBroadcast.postMessage(payload);
  }

  // 3. Notificar por Cloud MQTT
  if (mqttPlayerClient && mqttPlayerClient.connected) {
    mqttPlayerClient.publish(`${MQTT_CHANNEL}/player/join`, JSON.stringify(payload), { qos: 0 });
    console.log(`[CLOUD SYNC] Mensaje de unión emitido para ${currentTeamName}`);
  }
}

function sendPlayerPhaseAdvance(phaseNum) {
  const p = parseInt(phaseNum, 10);
  console.log(`[ADVANCE] Enviando reto ${p} superado por ${currentTeamName}...`);

  const payload = {
    type: 'player_advance',
    teamId: currentTeamId,
    teamName: currentTeamName,
    phase: p,
    fase_completada: p,
    timestamp: Date.now()
  };

  // 1. Notificar por WebRTC P2P DIRECTO al Host (0-2ms, sin pasar por servidores)
  if (playerPeerConn && playerPeerConn.open) {
    try {
      playerPeerConn.send(payload);
      console.log(`[PEER P2P] ✓ Reto ${p} enviado DIRECTO al Host vía WebRTC P2P (0ms).`);
    } catch (e) {
      console.warn('[PEER P2P] Error emitiendo por PeerJS:', e);
    }
  }

  // 2. Notificar por BroadcastChannel entre pestañas (0ms latencia)
  if (localBroadcast) {
    localBroadcast.postMessage(payload);
  }

  // 3. Emitir DIRECTO por Socket.io en RED LOCAL si estuviera disponible
  if (socket && typeof socket.emit === 'function' && socket !== mqttPlayerClient) {
    try {
      socket.emit('player:phase_complete', payload);
      console.log(`[SOCKET LOCAL] ✓ Paquete de avance enviado al Host en red local.`);
    } catch (e) {
      console.warn('[SOCKET LOCAL] Error emitiendo por socket:', e);
    }
  }

  // 4. Emitir por Cloud MQTT como respaldo si estuviera conectado
  if (mqttPlayerClient && mqttPlayerClient.connected) {
    mqttPlayerClient.publish(`${MQTT_CHANNEL}/player/advance`, JSON.stringify(payload), { qos: 0 });
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
