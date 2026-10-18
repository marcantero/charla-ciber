// ================================================================
//  HOST - socket-client.js
//  Sincronización Híbrida: Socket.io Local + MQTT Cloud en Tiempo Real
// ================================================================

let socket = null;
let mqttHostClient = null;
let localBroadcast = null;
let peerHost = null;
const peerConnections = new Map();
const PEER_HOST_ID = 'charla-ciber-vilaromana-host';

if (typeof BroadcastChannel !== 'undefined') {
  try {
    localBroadcast = new BroadcastChannel('charla_ciber_vilaromana');
    localBroadcast.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.type === 'player_join') {
        handlePlayerJoinEvent(data);
      } else if (data.type === 'player_advance') {
        handlePlayerAdvanceEvent(data);
      } else if (data.type === 'player_heartbeat') {
        handlePlayerHeartbeatEvent(data);
      }
    };
    console.log('[HOST] Canal de comunicación directa entre pestañas activo (BroadcastChannel: 0ms).');
  } catch (e) {}
}

function initHostPeer(retryCount = 0) {
  if (typeof Peer === 'undefined') {
    if (retryCount < 10) {
      setTimeout(() => initHostPeer(retryCount + 1), 300);
    }
    return;
  }

  try {
    console.log(`[PEER P2P] Inicializando servidor Host WebRTC con ID: ${PEER_HOST_ID}...`);
    peerHost = new Peer(PEER_HOST_ID, { debug: 1 });

    peerHost.on('open', (id) => {
      console.log(`[PEER P2P] ✓ Servidor WebRTC Directo P2P LISTO con ID: ${id}`);
      updateHostServerChip('P2P WEBRTC ONLINE', true);
      if (typeof logTerminalEvent === 'function') {
        logTerminalEvent(`Canal WebRTC P2P activo (ID: ${id}). Latencia directa: <2ms.`, 'log-sys');
      }
    });

    peerHost.on('connection', (conn) => {
      console.log('[PEER P2P] Nuevo dispositivo conectado por WebRTC P2P:', conn.peer);
      peerConnections.set(conn.peer, conn);

      conn.on('open', () => {
        conn.send({
          type: 'host_update',
          teams: teamsState,
          config: appConfig,
          timestamp: Date.now()
        });
      });

      conn.on('data', (data) => {
        if (!data) return;
        console.log('[PEER P2P] Paquete recibido de alumno vía WebRTC:', data.type, data);
        if (data.type === 'player_join') {
          handlePlayerJoinEvent(data);
        } else if (data.type === 'player_advance') {
          handlePlayerAdvanceEvent(data);
        } else if (data.type === 'player_heartbeat') {
          handlePlayerHeartbeatEvent(data);
        }
      });

      conn.on('close', () => {
        peerConnections.delete(conn.peer);
      });

      conn.on('error', (err) => {
        console.warn('[PEER P2P] Error en conexión con peer:', err);
        peerConnections.delete(conn.peer);
      });
    });

    peerHost.on('error', (err) => {
      console.warn('[PEER P2P] Error en Host Peer:', err.type, err);
      if (err.type === 'unavailable-id') {
        setTimeout(() => {
          if (peerHost && !peerHost.destroyed) {
            try { peerHost.destroy(); } catch (e) {}
          }
          initHostPeer(0);
        }, 3000);
      }
    });
  } catch (e) {
    console.warn('[PEER P2P] Excepción iniciando PeerJS en Host:', e);
  }
}

const MQTT_BROKERS = [
  'wss://test.mosquitto.org:8081',
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt'
];
const MQTT_CHANNEL = 'charla_ciber_vilaromana';
let currentHostBrokerIndex = 0;
let mqttHostConnectingTimer = null;

function updateHostServerChip(status, isOnline = true) {
  const chipText = document.getElementById('server-status-text');
  const chipDot = document.querySelector('#server-status-chip .chip-dot');
  if (chipText) {
    chipText.textContent = status;
    chipText.style.color = isOnline ? '#00ff88' : '#ff3366';
  }
  if (chipDot) {
    chipDot.style.background = isOnline ? '#00ff88' : '#ff3366';
    chipDot.style.boxShadow = isOnline ? '0 0 10px #00ff88' : 'none';
  }
}

function getHostServerUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('server')) {
    const s = params.get('server');
    return s.startsWith('http') ? s : `http://${s}`;
  }
  if (window.location.protocol.startsWith('http') && window.location.port) {
    return window.location.origin;
  }
  return 'http://' + (window.location.hostname || 'localhost') + ':4000';
}

function initHostSocket() {
  const serverUrl = getHostServerUrl();
  const isGithub = window.location.hostname.includes('github.io');

  // Inicializar WebRTC P2P (PeerJS: 0ms directo en LAN y GitHub Pages)
  initHostPeer();
  
  if (typeof io !== 'undefined') {
    try {
      console.log('[SOCKET HOST] Conectando por red local a:', serverUrl);
      socket = io(serverUrl, {
        timeout: 2500,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000
      });
      let localConnected = false;

      socket.on('connect', () => {
        localConnected = true;
        console.log('[SOCKET HOST] ¡Conectado al servidor local Node.js! Latencia: 0ms.');
        const serverHost = window.location.hostname || 'LAN';
        updateHostServerChip('CONECTADO (RED LOCAL)', true);
        socket.emit('host:init');
        if (typeof logTerminalEvent === 'function') {
          logTerminalEvent('Conexión Socket.io local activa en ' + serverUrl + ' (Latencia: <1ms)', 'log-sys');
        }
      });

      socket.on('disconnect', () => {
        console.warn('[SOCKET HOST] Desconectado del servidor local.');
        updateHostServerChip('DESCONECTADO', false);
      });

      socket.on('host:update', (data) => {
        if (data && data.config) applyConfigToHost(data.config);
        if (data && data.teams) updateTeamsDisplay(data.teams);
      });

      socket.on('host:team_advanced', (data) => {
        if (typeof triggerTeamAdvanceAnimation === 'function') {
          triggerTeamAdvanceAnimation(data);
        }
      });

      socket.on('game:reset', () => {
        handleLocalReset();
      });

      if (isGithub) {
        setTimeout(() => {
          if (!localConnected) {
            console.info('[HOST] Servidor local no disponible. Iniciando Cloud Realtime (MQTT)...');
            initHostMqtt();
          }
        }, 2000);
      }

      return;
    } catch (e) {
      console.warn('[HOST] Error iniciando Socket.io local:', e);
    }
  }

  // 2. Fallback a MQTT
  initHostMqtt();
}

function initHostMqtt(retryCount = 0) {
  if (typeof mqtt === 'undefined') {
    if (retryCount < 10) {
      setTimeout(() => initHostMqtt(retryCount + 1), 250);
      return;
    }
    console.error('[HOST MQTT] Librería mqtt no disponible tras varios reintentos.');
    updateHostServerChip('ERROR LIBRERÍA', false);
    return;
  }

  const brokerUrl = MQTT_BROKERS[currentHostBrokerIndex];
  updateHostServerChip('CONECTANDO CLOUD...', false);
  const clientId = 'host_' + Math.random().toString(16).substring(2, 10);
  console.log(`[HOST CLOUD] Conectando a ${brokerUrl}...`);

  if (mqttHostClient) {
    try { mqttHostClient.end(true); } catch(e) {}
    mqttHostClient = null;
  }

  let isConnected = false;
  try {
    mqttHostClient = mqtt.connect(brokerUrl, {
      clientId: clientId,
      clean: true,
      keepalive: 30,
      connectTimeout: 4000
    });
  } catch (err) {
    console.warn('[HOST MQTT] Error en mqtt.connect:', err);
    tryNextHostBroker();
    return;
  }

  if (mqttHostConnectingTimer) clearTimeout(mqttHostConnectingTimer);
  mqttHostConnectingTimer = setTimeout(() => {
    if (!isConnected) {
      console.warn(`[HOST CLOUD] Timeout conectando a ${brokerUrl}. Probando broker alternativo...`);
      tryNextHostBroker();
    }
  }, 4500);

  mqttHostClient.on('connect', () => {
    isConnected = true;
    if (mqttHostConnectingTimer) clearTimeout(mqttHostConnectingTimer);
    console.log(`[HOST CLOUD] ¡Conectado al broker MQTT (${brokerUrl}) en tiempo real!`);
    updateHostServerChip('EN LÍNEA (CLOUD)', true);
    if (typeof logTerminalEvent === 'function') {
      logTerminalEvent('Conexión Cloud Realtime establecida (' + brokerUrl.split('/')[2] + '). Monitorizando equipos...', 'log-sys');
    }

    // Suscribirse a eventos de jugadores
    mqttHostClient.subscribe([
      `${MQTT_CHANNEL}/player/join`,
      `${MQTT_CHANNEL}/player/advance`,
      `${MQTT_CHANNEL}/player/heartbeat`
    ], { qos: 1 }, (err) => {
      if (err) console.error('[HOST MQTT] Error en suscripción:', err);
      else {
        // Enviar ping para que jugadores ya conectados se presenten
        broadcastHostPing();
      }
    });
  });

  mqttHostClient.on('message', (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      if (topic === `${MQTT_CHANNEL}/player/join`) {
        handlePlayerJoinEvent(data);
      } else if (topic === `${MQTT_CHANNEL}/player/advance`) {
        handlePlayerAdvanceEvent(data);
      } else if (topic === `${MQTT_CHANNEL}/player/heartbeat`) {
        handlePlayerHeartbeatEvent(data);
      }
    } catch (e) {
      console.warn('[HOST MQTT] Mensaje malformado recibido:', e);
    }
  });

  mqttHostClient.on('error', (err) => {
    console.warn('[HOST CLOUD] Error en la conexión MQTT:', err);
    if (!isConnected) {
      tryNextHostBroker();
    } else {
      updateHostServerChip('RECONECTANDO...', false);
    }
  });

  mqttHostClient.on('offline', () => {
    updateHostServerChip('OFFLINE', false);
  });

  mqttHostClient.on('reconnect', () => {
    updateHostServerChip('RECONECTANDO...', false);
  });
}

function tryNextHostBroker() {
  if (mqttHostConnectingTimer) clearTimeout(mqttHostConnectingTimer);
  if (mqttHostClient) {
    try { mqttHostClient.end(true); } catch(e) {}
    mqttHostClient = null;
  }
  currentHostBrokerIndex = (currentHostBrokerIndex + 1) % MQTT_BROKERS.length;
  console.info(`[HOST CLOUD] Reintentando con broker [${currentHostBrokerIndex}]: ${MQTT_BROKERS[currentHostBrokerIndex]}`);
  setTimeout(() => initHostMqtt(), 500);
}

// ----------------------------------------------------------------
// Manejo de eventos de los jugadores
// ----------------------------------------------------------------

function ensureTeamExists(teamId, teamName) {
  const id = parseInt(teamId, 10);
  if (!id) return null;
  if (!teamsState[id]) {
    teamsState[id] = {
      id: id,
      name: teamName || (appConfig && appConfig.equipos && appConfig.equipos[id] && appConfig.equipos[id].nombre) || `Equipo ${id}`,
      currentPhase: 0,
      completedPhases: [],
      onlineCount: 1,
      lastActive: Date.now()
    };
  }
  return teamsState[id];
}

function handlePlayerJoinEvent(data) {
  const teamId = parseInt(data.teamId, 10);
  if (!teamId) return;

  const team = ensureTeamExists(teamId, data.teamName);
  if (team) {
    team.onlineCount = 1;
    team.lastActive = Date.now();
    if (data.teamName) team.name = data.teamName;
  }

  if (typeof updateTeamsDisplay === 'function') {
    updateTeamsDisplay(teamsState);
  }
  if (typeof logTerminalEvent === 'function') {
    logTerminalEvent(`[CONEXIÓN] ${team.name} sincronizado en tiempo real.`, 'log-sys');
  }

  // Responder con el estado actual del juego
  broadcastHostUpdate();
}

function handlePlayerAdvanceEvent(data) {
  const teamId = parseInt(data.teamId, 10);
  const phase = parseInt(data.phase, 10);
  if (!teamId || !phase) return;

  const team = ensureTeamExists(teamId, data.teamName);
  if (!team) return;

  if (!team.completedPhases.includes(phase)) {
    team.completedPhases.push(phase);
    team.completedPhases.sort((a, b) => a - b);
    team.currentPhase = Math.max(team.currentPhase, phase);
    team.lastActive = Date.now();

    const isFinished = team.completedPhases.length === 5;

    // Disparar animación cinemática y fanfarria en el proyector
    if (typeof triggerTeamAdvanceAnimation === 'function') {
      triggerTeamAdvanceAnimation({
        teamId: teamId,
        teamName: team.name,
        phase: phase,
        completedPhases: team.completedPhases,
        totalCompleted: team.completedPhases.length,
        isFinished: isFinished,
        timestamp: Date.now()
      });
    }

    if (typeof updateTeamsDisplay === 'function') {
      updateTeamsDisplay(teamsState);
    }
    if (typeof logTerminalEvent === 'function') {
      logTerminalEvent(`[AVANCE] >>> ${team.name} ha superado el RETO 0${phase} <<<`, 'log-alert');
    }

    broadcastHostUpdate();
  }
}

function handlePlayerHeartbeatEvent(data) {
  const teamId = parseInt(data.teamId, 10);
  if (!teamId) return;
  const team = teamsState[teamId];
  if (team) {
    team.onlineCount = 1;
    team.lastActive = Date.now();
    const badge = document.getElementById(`team-online-${teamId}`);
    if (badge && !badge.classList.contains('online')) {
      badge.className = 'online-badge online mono';
      const textEl = badge.querySelector('.online-text');
      if (textEl) textEl.textContent = 'ONLINE';
    }
  }
}

function broadcastHostUpdate() {
  const updatePayload = {
    type: 'host_update',
    teams: teamsState,
    config: appConfig,
    timestamp: Date.now()
  };

  // 1. Canal entre pestañas del mismo navegador (0ms)
  if (localBroadcast) {
    localBroadcast.postMessage(updatePayload);
  }

  // 2. WebRTC P2P a todos los dispositivos conectados (0-2ms directo en LAN)
  peerConnections.forEach((conn) => {
    if (conn.open) {
      try { conn.send(updatePayload); } catch (e) {}
    }
  });

  // 3. Cloud MQTT
  if (mqttHostClient && mqttHostClient.connected) {
    mqttHostClient.publish(`${MQTT_CHANNEL}/host/update`, JSON.stringify(updatePayload), { qos: 0 });
  }
}

function broadcastHostPing() {
  const pingPayload = { type: 'host_ping', timestamp: Date.now() };
  if (localBroadcast) {
    localBroadcast.postMessage(pingPayload);
  }
  peerConnections.forEach((conn) => {
    if (conn.open) {
      try { conn.send(pingPayload); } catch (e) {}
    }
  });
  if (mqttHostClient && mqttHostClient.connected) {
    mqttHostClient.publish(`${MQTT_CHANNEL}/host/ping`, JSON.stringify(pingPayload), { qos: 0 });
  }
}

// ----------------------------------------------------------------
// Reinicio de partida
// ----------------------------------------------------------------

function requestResetGame() {
  const modal = document.getElementById('reset-confirm-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeResetModal() {
  const modal = document.getElementById('reset-confirm-modal');
  if (modal) modal.classList.add('hidden');
}

function handleLocalReset() {
  hackerMilestones = { m1: false, m2: false, m3: false };
  testStageCounter = 1;
  if (typeof closeWeakeningOverlay === 'function') closeWeakeningOverlay();
  if (typeof resetMissionTimer === 'function') resetMissionTimer();
  if (typeof logTerminalEvent === 'function') {
    logTerminalEvent('Partida reiniciada desde el servidor central.', 'log-sys');
  }
}

function confirmResetGame() {
  closeResetModal();
  handleLocalReset();

  const numTeams = parseInt((appConfig && appConfig.numeroEquipos) || 5, 10);
  for (let i = 1; i <= numTeams; i++) {
    teamsState[i] = {
      id: i,
      name: (appConfig && appConfig.equipos && appConfig.equipos[i] && appConfig.equipos[i].nombre) || `Equipo ${i}`,
      currentPhase: 0,
      completedPhases: [],
      onlineCount: (teamsState[i] && teamsState[i].onlineCount) || 0,
      lastActive: Date.now()
    };
  }

  if (typeof updateTeamsDisplay === 'function') {
    updateTeamsDisplay(teamsState);
  }
  if (typeof logTerminalEvent === 'function') {
    logTerminalEvent('Se ha emitido la orden de REINICIAR toda la partida a todos los alumnos.', 'log-alert');
  }

  const resetPayload = { type: 'game_reset', timestamp: Date.now() };

  // 1. Notificar por BroadcastChannel local (0ms)
  if (localBroadcast) {
    localBroadcast.postMessage(resetPayload);
  }

  // 2. Notificar por WebRTC P2P directo a cada móvil/PC (0ms)
  peerConnections.forEach((conn) => {
    if (conn.open) {
      try { conn.send(resetPayload); } catch (e) {}
    }
  });

  // 3. Notificar por Socket.io local si existe (0ms)
  if (socket && socket.connected && typeof socket.emit === 'function') {
    socket.emit('host:reset_game');
  }

  // 4. Notificar por Cloud Realtime (MQTT)
  if (mqttHostClient && mqttHostClient.connected) {
    mqttHostClient.publish(`${MQTT_CHANNEL}/game/reset`, JSON.stringify(resetPayload), { qos: 0 });
    broadcastHostUpdate();
  }
}
