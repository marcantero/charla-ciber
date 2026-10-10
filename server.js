// ================================================================
//  SERVER.JS — Escape Room Multijugador en Red Local
//  Tecnología: Node.js, Express y Socket.io
// ================================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 4000;
const TEAMS_COUNT = 5;

// Estado centralizado de la partida en memoria
let teamsState = {};

function initTeamsState() {
  teamsState = {};
  for (let i = 1; i <= TEAMS_COUNT; i++) {
    teamsState[i] = {
      id: i,
      name: `Equipo ${i}`,
      currentPhase: 0,        // 0 = no iniciado, 1..5 = última fase completada
      completedPhases: [],    // Array de números de fase completados [1, 2, ...]
      onlineCount: 0,
      lastActive: null,
      completedAt: null       // Timestamp si completó las 5 fases
    };
  }
}

initTeamsState();

// ----------------------------------------------------------------
// 1. Rutas Estáticas
// ----------------------------------------------------------------
// Ruta para el Host (Proyector de clase)
app.use('/host', express.static(path.join(__dirname, 'host')));

// Ruta para los Jugadores (Alumnos)
app.use('/players', express.static(path.join(__dirname, 'players')));

// Redirección por defecto a /host o portal
app.get('/', (req, res) => {
  res.redirect('/host');
});

// Endpoint API para consultar estado en formato JSON
app.get('/api/status', (req, res) => {
  res.json({
    active: true,
    teams: teamsState,
    timestamp: Date.now()
  });
});

// ----------------------------------------------------------------
// 2. Comunicación en Tiempo Real (Socket.io)
// ----------------------------------------------------------------
io.on('connection', (socket) => {
  let clientTeamId = null;
  let clientRole = 'unknown';

  // --- Registro de Host ---
  socket.on('host:init', () => {
    clientRole = 'host';
    socket.join('hosts_room');
    socket.emit('host:update', {
      teams: teamsState,
      timestamp: Date.now(),
      message: 'Conectado al servidor de control'
    });
  });

  // --- Registro de Jugador ---
  socket.on('player:join', (data) => {
    clientRole = 'player';
    const teamId = parseInt(data.teamId || data.team || 0, 10);

    if (teamId >= 1 && teamId <= TEAMS_COUNT) {
      clientTeamId = teamId;
      teamsState[teamId].onlineCount++;
      teamsState[teamId].lastActive = Date.now();
      if (data.teamName) {
        teamsState[teamId].name = data.teamName;
      }

      socket.join(`team_${teamId}`);

      // Enviar al jugador el estado que lleva su equipo
      socket.emit('player:init_state', {
        team: teamsState[teamId],
        timestamp: Date.now()
      });

      // Notificar a los hosts
      io.to('hosts_room').emit('host:update', {
        teams: teamsState,
        event: 'player_joined',
        teamId: teamId,
        timestamp: Date.now()
      });

      console.log(`[CONEXIÓN] ${teamsState[teamId].name} conectado (Socket: ${socket.id})`);
    }
  });

  // --- Jugador completa una fase ---
  socket.on('player:phase_complete', (data) => {
    const teamId = parseInt(data.teamId || clientTeamId || 0, 10);
    const phase = parseInt(data.phase || data.fase_completada || 0, 10);

    if (teamId >= 1 && teamId <= TEAMS_COUNT && phase >= 1 && phase <= 5) {
      const team = teamsState[teamId];

      if (!team.completedPhases.includes(phase)) {
        team.completedPhases.push(phase);
        team.completedPhases.sort((a, b) => a - b);
        team.currentPhase = Math.max(team.currentPhase, phase);
        team.lastActive = Date.now();

        const isFinished = team.completedPhases.length === 5;
        if (isFinished && !team.completedAt) {
          team.completedAt = Date.now();
        }

        console.log(`[AVANCE] >>> ${team.name} ha completado la FASE ${phase} (Total: ${team.completedPhases.length}/5) <<<`);

        // Evento específico para animaciones y efectos intensos en el Host
        io.to('hosts_room').emit('host:team_advanced', {
          teamId: teamId,
          teamName: team.name,
          phase: phase,
          completedPhases: team.completedPhases,
          totalCompleted: team.completedPhases.length,
          isFinished: isFinished,
          timestamp: Date.now()
        });

        // Actualización de estado general a todos los hosts
        io.to('hosts_room').emit('host:update', {
          teams: teamsState,
          timestamp: Date.now()
        });
      }
    }
  });

  // --- Host reinicia la partida ---
  socket.on('host:reset_game', () => {
    console.log('[CONTROL] Host ha solicitado REINICIAR el escape room.');
    initTeamsState();

    // Notificar a todos los hosts y jugadores
    io.emit('game:reset', {
      timestamp: Date.now(),
      message: 'La partida ha sido reiniciada por el profesor/host'
    });

    io.to('hosts_room').emit('host:update', {
      teams: teamsState,
      timestamp: Date.now()
    });
  });

  // --- Desconexión de cliente ---
  socket.on('disconnect', () => {
    if (clientRole === 'player' && clientTeamId && teamsState[clientTeamId]) {
      teamsState[clientTeamId].onlineCount = Math.max(0, teamsState[clientTeamId].onlineCount - 1);
      io.to('hosts_room').emit('host:update', {
        teams: teamsState,
        event: 'player_disconnected',
        teamId: clientTeamId,
        timestamp: Date.now()
      });
      console.log(`[DESCONEXIÓN] ${teamsState[clientTeamId].name} desconectado.`);
    }
  });
});

// ----------------------------------------------------------------
// 3. Detección de IP Local e Inicio del Servidor
// ----------------------------------------------------------------
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Filtrar IPv4 y no internas (127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
}

server.listen(PORT, '0.0.0.0', () => {
  const localIps = getLocalIpAddresses();
  const primaryIp = localIps[0] || 'localhost';

  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║       ESCAPE ROOM CIBERSEGURIDAD — SISTEMA MULTIJUGADOR LOCAL        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(` [✓] Servidor escuchando en el puerto: ${PORT}\n`);
  console.log(' 📺 PANTALLA DEL HOST (Proyector en clase):');
  console.log(`     • Local:   http://localhost:${PORT}/host`);
  if (localIps.length > 0) {
    console.log(`     • Red:     http://${primaryIp}:${PORT}/host`);
  }
  console.log('\n 👥 ENLACE PARA LOS ALUMNOS (/players):');
  if (localIps.length > 0) {
    console.log(`     • General: http://${primaryIp}:${PORT}/players`);
    console.log('     • Enlaces directos por equipo:');
    for (let i = 1; i <= TEAMS_COUNT; i++) {
      console.log(`       - Equipo ${i}: http://${primaryIp}:${PORT}/players?team=${i}`);
    }
  } else {
    console.log(`     • General: http://localhost:${PORT}/players`);
    console.log(`     • Equipo 1: http://localhost:${PORT}/players?team=1`);
  }
  console.log('══════════════════════════════════════════════════════════════════════\n');
});
