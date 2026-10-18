// ================================================================
//  HOST - boss-cinematic.js
//  Cinemática Épica de Derrota del Boss Final (Estilo Película / Widescreen)
//  Fases:
//   1. Aparición imponente del Hacker (Amenaza 100%)
//   2. Animación de ataque coordinado de todos los equipos del aula
//   3. Pausa de derrota / aparente victoria (Suspenso)
//   4. El giro: El hacker renace de entre las cenizas
//   5. Avatar parlante sincronizado con la locución y el manifiesto
// ================================================================

let bossCinematicActive = false;
let bossTypewriterInterval = null;
let bossCanvasAnimId = null;
let bossParticles = [];
let bossBeams = [];
let bossCurrentAudio = null;
let bossIntroAmbience = null;
let bossFinalMusic = null;
let bossSpeakingTimer = null;
let bossDepartureTimer = null;
let bossCompleteTimer = null;

const MANIFESTO_PARAGRAPHS = [
  {
    prefix: '> [ORIGEN TOR_NODE_0x7F]: ',
    text: '"Vaya, vaya... Habéis llegado al final. Habéis seguido cada rastro, habéis roto los cifrados y habéis completado el reto."',
    cls: 'text-normal'
  },
  {
    prefix: '> [CANAL AUDIO_INTERCEPT]: ',
    text: '"De verdad creíais que esto era un juego con final feliz, ¿verdad? Pensabais que resolviendo cuatro pistas ibais a recuperar vuestros archivos. Bienvenidos al mundo real."',
    cls: 'text-amber'
  },
  {
    prefix: '> [EXFILTRATION_LOG // 100%]: ',
    text: '"Vuestros datos... expedientes, historiales, notas y contraseñas... ya no están en este sistema. Hace exactamente diez minutos que terminó la copia, y no van a volver. En la red nadie devuelve lo que ya ha robado."',
    cls: 'text-red alert-highlight'
  },
  {
    prefix: '> [STATUS: ANONYMOUS_EXIT]: ',
    text: '"Habéis demostrado que sabéis abrir una terminal y mirar donde otros no miran. Nada mal para empezar. Pero si de verdad queréis jugar en las grandes ligas... si algún día pretendéis cazar a alguien como yo... vais a tener que aprender muchísimo más."',
    cls: 'text-cyan'
  },
  {
    prefix: '> [AVISO CRÍTICO]: ',
    text: '"Tomadlo como una lección: esto no era una prueba de rescate, era un aviso."',
    cls: 'text-green highlight-lesson'
  },
  {
    prefix: '> [CONEXIÓN CERRADA]: ',
    text: '"Nos vemos en la red... analistas."',
    cls: 'text-dim'
  }
];

function triggerBossCinematic() {
  if (bossCinematicActive) return;
  bossCinematicActive = true;

  // Cerrar cualquier overlay de debilitamiento previo
  closeWeakeningOverlay();

  const cinematic = document.getElementById('boss-defeat-cinematic');
  const stageIntro = document.getElementById('boss-stage-intro');
  const stageFakeVictory = document.getElementById('boss-stage-fake-victory');
  const stageReborn = document.getElementById('boss-stage-reborn');
  const stageComplete = document.getElementById('boss-stage-complete');
  const flagBox = document.getElementById('boss-flag-reveal-box');
  const typewriterContainer = document.getElementById('boss-typewriter-container');
  const combatAvatar = document.getElementById('boss-combat-avatar');
  const flare = document.getElementById('cinematic-lens-flare');
  const teamsBar = document.getElementById('boss-teams-attack-bar');

  if (!cinematic) return;

  // Reset total de estados
  cinematic.classList.remove('hidden');

  if (stageIntro) {
    stageIntro.classList.remove('hidden', 'fade-out-down');
  }
  if (stageFakeVictory) {
    stageFakeVictory.classList.add('hidden');
    stageFakeVictory.classList.remove('fade-out-down');
  }
  if (stageReborn) {
    stageReborn.classList.add('hidden');
    stageReborn.classList.remove('cinematic-fade-in');
  }
  if (stageComplete) {
    stageComplete.classList.add('hidden');
    stageComplete.style.display = 'none';
    stageComplete.classList.remove('cinematic-fade-in');
    const completeScreen = document.getElementById('challenge-complete-screen');
    if (completeScreen) {
      completeScreen.classList.add('hidden');
      completeScreen.style.display = 'none';
      completeScreen.classList.remove('challenge-complete-materialize');
    }
    const depContainer = document.getElementById('boss-departure-container');
    if (depContainer) {
      depContainer.style.display = 'flex';
      depContainer.classList.remove('departure-dissolving', 'departure-gone', 'hidden');
    }
  }
  if (flagBox) flagBox.classList.add('hidden');
  if (typewriterContainer) typewriterContainer.innerHTML = '';
  if (combatAvatar) combatAvatar.className = 'boss-combat-avatar';
  if (flare) flare.classList.remove('flare-active');

  const headline = document.getElementById('boss-action-headline');
  const subtag = document.getElementById('boss-action-subtag');
  if (headline) headline.textContent = '¡CONECTANDO EQUIPOS!';
  if (subtag) subtag.textContent = '[ PROTOCOLO DE DEFENSA // COORDINANDO EQUIPOS ]';

  // Iniciar Canvas Engine
  initBossBattleCanvas();

  // Poblar la barra de equipos con los equipos del aula
  populateTeamAttackChips(teamsBar);

  // Sonido de aviso y alarma de combate + ambiente cinematográfico de combate
  playBossWarningAlertSound();
  startBattleIntroAmbience();
  logTerminalEvent('⚔️ ASALTO FINAL: Bloqueo de perímetro y contraataque coordinado de todos los equipos.', 'log-alert');

  // ==============================================================
  // SECUENCIA CINEMATOGRÁFICA
  // ==============================================================

  // A los 1.8s: Comienza el contraataque coordinado de los equipos
  setTimeout(() => {
    if (!bossCinematicActive) return;
    executeTeamsCounterattackSequence();
  }, 1800);
}

// ----------------------------------------------------------------
//  POBLAR NODOS DE EQUIPOS EN LA PANTALLA
// ----------------------------------------------------------------
function populateTeamAttackChips(container) {
  if (!container) return;
  container.innerHTML = '';

  const numTeams = parseInt((appConfig && appConfig.numeroEquipos) || 5, 10);
  for (let id = 1; id <= numTeams; id++) {
    const chip = document.createElement('div');
    chip.className = 'team-attack-chip';
    chip.id = `attack-chip-team-${id}`;
    const name = (appConfig && appConfig.equipos && appConfig.equipos[id] && appConfig.equipos[id].nombre) || `EQUIPO ${id}`;
    chip.innerHTML = `
      <span class="chip-dot"></span>
      <span>${name}</span>
    `;
    container.appendChild(chip);
  }
}

// ----------------------------------------------------------------
//  SECUENCIA DE ATAQUE DE LOS EQUIPOS AL HACKER
// ----------------------------------------------------------------
function executeTeamsCounterattackSequence() {
  const numTeams = parseInt((appConfig && appConfig.numeroEquipos) || 5, 10);
  const headline = document.getElementById('boss-action-headline');
  const subtag = document.getElementById('boss-action-subtag');
  const avatar = document.getElementById('boss-combat-avatar');

  if (headline) headline.textContent = '¡EQUIPOS ATACANDO!';
  if (subtag) subtag.textContent = '[ DESCARGA DE FIREWALLS // SOBRECARGA DEL NÚCLEO ]';

  // Detener ambiente previo de combate
  stopBattleIntroAmbience();

  // Iniciar la música final en el mismo momento que se le empieza a disparar
  const destructionMusic = playBossFinalDestructionMusic(0.95);

  let transitioned = false;
  const proceedToFakeVictory = () => {
    if (transitioned || !bossCinematicActive) return;
    transitioned = true;
    transitionToFakeVictory();
  };

  // Disparar rayos desde cada equipo secuencialmente hacia el hacker
  const attackDuration = 3200;
  const intervalPerTeam = attackDuration / numTeams;

  for (let i = 1; i <= numTeams; i++) {
    setTimeout(() => {
      if (!bossCinematicActive) return;

      const chip = document.getElementById(`attack-chip-team-${i}`);
      if (chip) {
        chip.classList.add('firing');
      }

      // Disparar rayo visual y sacudida en el avatar
      launchTeamLaserAttack(i, numTeams);
      playRealisticLaserAttack();

      // En el ataque intermedio (equipo central), el boss sufre el primer impacto de dolor
      const midTeam = Math.max(1, Math.floor(numTeams / 2));
      if (i === midTeam) {
        playBossPainAu();
      }

      if (avatar) {
        avatar.classList.add('hit-glitch');
        setTimeout(() => avatar.classList.remove('hit-glitch'), 220);
      }

      triggerCinematicCameraShake();
    }, (i - 1) * intervalPerTeam);
  }

  // Clímax del ataque: Impacto masivo conjunto y desintegración del Hacker
  const climaxDelay = attackDuration + 400; // 3600ms
  setTimeout(() => {
    if (!bossCinematicActive) return;

    if (headline) headline.textContent = '¡IMPACTO CRÍTICO!';
    if (subtag) subtag.textContent = '[ NÚCLEO HOSTIL SOBRECARGADO // COLAPSO TOTAL ]';

    // Todos los chips en estado impacted
    for (let i = 1; i <= numTeams; i++) {
      const chip = document.getElementById(`attack-chip-team-${i}`);
      if (chip) chip.classList.add('impacted');
    }

    // Flash blanco y sacudida sísmica
    triggerImpactFlash();
    triggerCinematicCameraHeavyShake();
    playRealisticCriticalImpact();

    // Grito desgarrador de derrota sincronizado con la sobrecarga del núcleo
    setTimeout(() => {
      if (bossCinematicActive) {
        playBossPainNooo();
      }
    }, 150);

    // El avatar estalla y se desmorona progresivamente con la música
    if (avatar) {
      avatar.classList.add('critical-shatter');
    }

    // Explosión de partículas cuánticas en el Canvas
    burstDissolutionParticles();

    // Destello anamórfico horizontal
    const flare = document.getElementById('cinematic-lens-flare');
    if (flare) {
      flare.classList.add('flare-active');
      setTimeout(() => flare.classList.remove('flare-active'), 1200);
    }

    // A mitad de la destrucción (~2.4s tras el impacto), segunda oleada de chispas y purificación del núcleo
    setTimeout(() => {
      if (bossCinematicActive) {
        burstDissolutionParticles();
        if (headline) headline.textContent = '¡NÚCLEO PURIFICADO!';
        if (subtag) subtag.textContent = '[ AMENAZA DEL HACKER NEUTRALIZADA // 0% ]';
      }
    }, 2400);

    // Transición hacia la PAUSA DE VICTORIA APARENTE al terminar la canción
    if (destructionMusic) {
      destructionMusic.addEventListener('ended', () => {
        setTimeout(proceedToFakeVictory, 400);
      }, { once: true });
      // Temporizador de respaldo si ended no se dispara
      setTimeout(proceedToFakeVictory, 3800);
    } else {
      setTimeout(proceedToFakeVictory, 3200);
    }

  }, climaxDelay);
}

// ----------------------------------------------------------------
//  PAUSA DE VICTORIA APARENTE (CELEBRACIÓN Y SUSPENSO)
// ----------------------------------------------------------------
function transitionToFakeVictory() {
  const stageIntro = document.getElementById('boss-stage-intro');
  const stageFake = document.getElementById('boss-stage-fake-victory');

  // Detener ambiente y música de combate previa
  stopBattleIntroAmbience();
  if (bossFinalMusic) {
    try {
      bossFinalMusic.pause();
      bossFinalMusic.currentTime = 0;
    } catch (e) {}
    bossFinalMusic = null;
  }

  if (stageIntro) {
    stageIntro.classList.add('fade-out-down');
    setTimeout(() => stageIntro.classList.add('hidden'), 500);
  }

  if (stageFake) {
    stageFake.classList.remove('hidden');
    stageFake.classList.add('cinematic-fade-in');
  }

  // Breve fanfarria suave de alivio
  playVictoryFanfare();
  logTerminalEvent('🛡️ INFORMES: El servidor no detecta intrusos activos. Amenaza: 0%.', 'log-advance');

  // Pausa dramática de 4.8 segundos creyendo que todo ha terminado...
  // ¡PERO NO! El hacker renace de las cenizas.
  setTimeout(() => {
    if (!bossCinematicActive) return;
    transitionToHackerReborn();
  }, 4800);
}

// ----------------------------------------------------------------
//  EL GIRO: EL HACKER RENACE DE ENTRE LAS CENIZAS Y HABLA
// ----------------------------------------------------------------
function transitionToHackerReborn() {
  const stageFake = document.getElementById('boss-stage-fake-victory');
  const stageReborn = document.getElementById('boss-stage-reborn');

  // Sonido de interferencia/glitch eléctrico repentino
  playHackGlitchSound();
  triggerCinematicCameraShake();
  triggerImpactFlash();

  if (stageFake) {
    stageFake.classList.add('fade-out-down');
    setTimeout(() => stageFake.classList.add('hidden'), 500);
  }

  if (stageReborn) {
    stageReborn.classList.remove('hidden');
    stageReborn.classList.add('cinematic-fade-in');
  }

  // Actualizar hora en la cinemática
  const timeEl = document.getElementById('cinematic-live-time');
  if (timeEl) timeEl.textContent = new Date().toTimeString().slice(0, 8);

  // Sonido de conexión Darknet Tor
  playTerminalConnectSound();
  logTerminalEvent('☠️ ALERTA ROJA: Señal fantasma detectada. El atacante sigue en el canal Tor.', 'log-alert');

  // Iniciar mecanografía sincronizada con el audio y animación de boca parlante
  typewriterManifestoWithSpeakingAvatar();
}

// ----------------------------------------------------------------
//  MECANOGRAFÍA ADAPTADA AL AUDIO Y ANIMACIÓN DEL HACKER HABLANDO
// ----------------------------------------------------------------
function typewriterManifestoWithSpeakingAvatar() {
  const container = document.getElementById('boss-typewriter-container');
  const hackerCard = document.querySelector('.reborn-hacker-card');
  if (!container) return;
  container.innerHTML = '';

  const phrase = (appConfig && appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.frase) ||
    "Vaya, vaya... Habéis llegado al final. Habéis seguido cada rastro, habéis roto los cifrados y habéis completado el reto. ¿De verdad creíais que esto era un juego con final feliz, verdad? Vuestros datos ya no están en este sistema. Hace exactamente diez minutos que terminó la copia, y no van a volver. En la red nadie devuelve lo que ya ha robado. Tomadlo como una lección: esto no era una prueba de rescate, era un aviso.";

  const audioCfg = (appConfig && appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.audio) || 'audio-hacker-3.mp3';
  const candidates = [
    `../audio/hacker/${audioCfg}`,
    `../audio/${audioCfg}`,
    '../audio/hacker/audio-hacker-3.mp3',
    '../audio/audio-hacker-3.mp3',
    '../audio/hacker/hacker_derrota.mp3',
    '../audio/hacker_derrota.mp3'
  ];

  let typewritingStarted = false;

  function onAudioStarted(soundInstance) {
    bossCurrentAudio = soundInstance;

    // Activar animación de que el hacker está hablando
    if (hackerCard) hackerCard.classList.add('speaking');

    if (soundInstance.duration && !isNaN(soundInstance.duration) && soundInstance.duration > 5) {
      startSyncTyping(soundInstance.duration);
    } else {
      soundInstance.addEventListener('loadedmetadata', () => {
        const dur = (soundInstance.duration && !isNaN(soundInstance.duration)) ? soundInstance.duration : 82;
        startSyncTyping(dur);
      }, { once: true });

      setTimeout(() => {
        if (!typewritingStarted) {
          const dur = (soundInstance.duration && !isNaN(soundInstance.duration)) ? soundInstance.duration : 82;
          startSyncTyping(dur);
        }
      }, 400);
    }
  }

  function onAudioFailed() {
    console.warn('[BOSS SYNC] Audio no disponible o bloqueado. Usando síntesis de voz / temporización estimada.');
    if (hackerCard) hackerCard.classList.add('speaking');
    startSyncTyping(45);
    speakHackerPhrase(phrase, 3, () => {
      if (hackerCard) hackerCard.classList.remove('speaking');
    });
  }

  function startSyncTyping(totalAudioDurationSeconds) {
    if (typewritingStarted || !bossCinematicActive) return;
    typewritingStarted = true;

    const totalChars = MANIFESTO_PARAGRAPHS.reduce((sum, p) => sum + p.text.length, 0);
    const availableTypingDurationMs = Math.max((totalAudioDurationSeconds - 3.5) * 1000, 20000);
    const msPerChar = Math.max(availableTypingDurationMs / totalChars, 14);

    let pIndex = 0;

    function typeNextParagraph() {
      if (!bossCinematicActive) return;

      if (pIndex >= MANIFESTO_PARAGRAPHS.length) {
        // Al terminar de hablar, detener la animación de la boca
        if (hackerCard) hackerCard.classList.remove('speaking');
        setTimeout(revealEpicFlag, 800);
        return;
      }

      const item = MANIFESTO_PARAGRAPHS[pIndex];
      pIndex++;

      const p = document.createElement('div');
      p.className = `cinematic-type-line ${item.cls}`;

      const prefixSpan = document.createElement('span');
      prefixSpan.className = 'type-prefix';
      prefixSpan.textContent = item.prefix;
      p.appendChild(prefixSpan);

      const textSpan = document.createElement('span');
      textSpan.className = 'type-body';
      p.appendChild(textSpan);

      container.appendChild(p);
      container.scrollTop = container.scrollHeight;

      let charIndex = 0;
      const text = item.text;
      const pInterval = setInterval(() => {
        if (!bossCinematicActive) {
          clearInterval(pInterval);
          return;
        }

        if (charIndex < text.length) {
          textSpan.textContent += text[charIndex++];
          if (charIndex % 4 === 0 && !isMuted) {
            playKeyClick();
          }
        } else {
          clearInterval(pInterval);
          const pauseBetween = item.cls.includes('alert-highlight') ? Math.max(msPerChar * 14, 700) : Math.max(msPerChar * 8, 400);
          setTimeout(typeNextParagraph, pauseBetween);
        }
        container.scrollTop = container.scrollHeight;
      }, msPerChar);
    }

    typeNextParagraph();
  }

  // Reproducir con helper sincronizado
  if (typeof tryPlayAudioWithSync === 'function') {
    tryPlayAudioWithSync(candidates, onAudioStarted, onAudioFailed, () => {
      if (hackerCard) hackerCard.classList.remove('speaking');
      revealEpicFlag();
    });
  } else if (typeof tryPlayCandidates === 'function') {
    tryPlayCandidates(candidates, onAudioFailed, () => {
      if (hackerCard) hackerCard.classList.remove('speaking');
      revealEpicFlag();
    });
    startSyncTyping(82);
  } else {
    onAudioFailed();
  }
}

// ----------------------------------------------------------------
//  CANVAS ENGINE DE BATALLA DIGITAL, LÁSERES Y CENIZAS
// ----------------------------------------------------------------
function initBossBattleCanvas() {
  const canvas = document.getElementById('boss-defeat-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  bossParticles = [];
  bossBeams = [];

  if (bossCanvasAnimId) cancelAnimationFrame(bossCanvasAnimId);

  function renderLoop() {
    if (!bossCinematicActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Rayos láser de los equipos hacia el centro
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.44;

    for (let i = bossBeams.length - 1; i >= 0; i--) {
      const b = bossBeams[i];
      b.progress += b.speed;
      b.alpha -= b.fade;

      if (b.alpha <= 0) {
        bossBeams.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      const curX = b.x1 + (cx - b.x1) * Math.min(b.progress, 1);
      const curY = b.y1 + (cy - b.y1) * Math.min(b.progress, 1);
      ctx.lineTo(curX, curY);
      ctx.strokeStyle = `rgba(0, 229, 255, ${b.alpha})`;
      ctx.lineWidth = b.width;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Haz blanco central
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(curX, curY);
      ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.9})`;
      ctx.lineWidth = b.width * 0.4;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Partículas y cenizas cuánticas flotantes
    for (let i = bossParticles.length - 1; i >= 0; i--) {
      const p = bossParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.fadeRate;
      p.rotation += p.vRot;

      if (p.alpha <= 0) {
        bossParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.glowColor;
      ctx.shadowBlur = p.glowBlur;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    bossCanvasAnimId = requestAnimationFrame(renderLoop);
  }

  bossCanvasAnimId = requestAnimationFrame(renderLoop);
}

function launchTeamLaserAttack(teamIndex, totalTeams) {
  const canvas = document.getElementById('boss-defeat-canvas');
  if (!canvas) return;

  // Calcular origen del rayo en la parte inferior repartido según el número de equipos
  const step = canvas.width / (totalTeams + 1);
  const startX = step * teamIndex;
  const startY = canvas.height * 0.88;

  // Añadir 3 haces concurrentes para efecto de descarga
  for (let j = 0; j < 3; j++) {
    bossBeams.push({
      x1: startX + (Math.random() - 0.5) * 40,
      y1: startY + (Math.random() - 0.5) * 20,
      progress: 0,
      speed: 0.12 + Math.random() * 0.08,
      alpha: 1,
      fade: 0.035,
      width: 2.5 + Math.random() * 2
    });
  }

  // Chispas en el punto de impacto
  const cx = canvas.width / 2;
  const cy = canvas.height * 0.44;
  for (let k = 0; k < 12; k++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    bossParticles.push({
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 60,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.05,
      size: 2 + Math.random() * 3,
      color: '#00e5ff',
      glowColor: '#00e5ff',
      glowBlur: 10,
      alpha: 0.9,
      fadeRate: 0.03 + Math.random() * 0.02,
      rotation: 0,
      vRot: 0.1,
      shape: 'circle'
    });
  }
}

function burstDissolutionParticles() {
  const canvas = document.getElementById('boss-defeat-canvas');
  if (!canvas) return;

  const cx = canvas.width / 2;
  const cy = canvas.height * 0.44;

  const colors = [
    { fill: '#ff0055', glow: '#ff0055' }, // Rojo alarma
    { fill: '#ff4500', glow: '#ff4500' }, // Naranja fuego / ceniza
    { fill: '#00e5ff', glow: '#00e5ff' }, // Cyan digital
    { fill: '#ffffff', glow: '#ffffff' }, // Blanco puro
    { fill: '#1a1016', glow: '#ff0055' }  // Ceniza oscura
  ];

  for (let i = 0; i < 320; i++) {
    const col = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 10;

    bossParticles.push({
      x: cx + (Math.random() - 0.5) * 140,
      y: cy + (Math.random() - 0.5) * 160,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.8, // Ascenso como humo/cenizas
      gravity: -0.05,
      size: 2.5 + Math.random() * 6,
      color: col.fill,
      glowColor: col.glow,
      glowBlur: 10 + Math.random() * 15,
      alpha: 0.95,
      fadeRate: 0.005 + Math.random() * 0.01,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.15,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }
}

function triggerImpactFlash() {
  const flash = document.getElementById('cinematic-impact-flash');
  if (!flash) return;
  flash.classList.add('flash-active');
  setTimeout(() => flash.classList.remove('flash-active'), 180);
}

function triggerCinematicCameraShake() {
  const viewport = document.getElementById('boss-cinematic-viewport');
  if (!viewport) return;
  viewport.classList.remove('cinematic-camera-shake');
  void viewport.offsetWidth;
  viewport.classList.add('cinematic-camera-shake');
  setTimeout(() => viewport.classList.remove('cinematic-camera-shake'), 650);
}

function triggerCinematicCameraHeavyShake() {
  const viewport = document.getElementById('boss-cinematic-viewport');
  if (!viewport) return;
  viewport.classList.remove('cinematic-camera-shake-heavy');
  void viewport.offsetWidth;
  viewport.classList.add('cinematic-camera-shake-heavy');
  setTimeout(() => viewport.classList.remove('cinematic-camera-shake-heavy'), 1200);
}

function revealEpicFlag() {
  const flagBox = document.getElementById('boss-flag-reveal-box');
  if (flagBox) flagBox.classList.add('hidden');

  if (typeof playVictoryFanfare === 'function') {
    playVictoryFanfare();
  }

  logTerminalEvent('🏆 RETO 5 COMPLETADO // TRANSMISIÓN FINAL DEL ATACANTE CONCLUIDA', 'log-advance');

  // Transición a la despedida del boss y pantalla final
  if (bossDepartureTimer) clearTimeout(bossDepartureTimer);
  bossDepartureTimer = setTimeout(() => {
    if (!bossCinematicActive) return;
    transitionToBossDeparture();
  }, 2200);
}

// ----------------------------------------------------------------
//  FASE E: PARTIDA CINEMATOGRÁFICA DEL BOSS Y PANTALLA FINAL
// ----------------------------------------------------------------
function transitionToBossDeparture() {
  if (bossDepartureTimer) {
    clearTimeout(bossDepartureTimer);
    bossDepartureTimer = null;
  }

  const stageReborn = document.getElementById('boss-stage-reborn');
  const stageComplete = document.getElementById('boss-stage-complete');
  const depContainer = document.getElementById('boss-departure-container');
  const completeScreen = document.getElementById('challenge-complete-screen');
  const viewport = document.getElementById('boss-cinematic-viewport');

  // Asegurar que el contenedor de despedida esté listo y la pantalla de fin oculta
  if (depContainer) {
    depContainer.style.display = 'flex';
    depContainer.classList.remove('departure-dissolving', 'departure-gone', 'hidden');
  }
  if (completeScreen) {
    completeScreen.classList.add('hidden');
    completeScreen.style.display = 'none';
    completeScreen.classList.remove('challenge-complete-materialize');
  }

  // Transición de la fase C a la fase E
  if (stageReborn) {
    stageReborn.classList.add('fade-out-down');
    setTimeout(() => {
      stageReborn.classList.add('hidden');
      stageReborn.style.display = 'none';
    }, 500);
  }

  if (stageComplete) {
    stageComplete.classList.remove('hidden');
    stageComplete.style.display = 'flex';
    stageComplete.classList.add('cinematic-fade-in');
  }

  if (viewport) {
    viewport.scrollTop = 0;
  }

  // Flash y shake cinematográfico de despedida
  triggerImpactFlash();
  triggerCinematicCameraShake();
  playHackGlitchSound();

  // El boss aparece diciendo su frase y empieza a disolverse a los 2.0s
  setTimeout(() => {
    if (!bossCinematicActive) return;
    if (depContainer) {
      depContainer.classList.add('departure-dissolving');
    }
    // Partículas de disolución en el canvas
    burstDepartureParticles();
    playRealisticBossDissolve();
  }, 2000);

  // A los 3.8s: El boss se ha disuelto por completo, transición definitiva a la pantalla de RETO COMPLETADO Y GRACIAS
  if (bossCompleteTimer) clearTimeout(bossCompleteTimer);
  bossCompleteTimer = setTimeout(() => {
    if (!bossCinematicActive) return;
    if (depContainer) {
      depContainer.classList.add('departure-gone');
    }
    triggerImpactFlash();
    showChallengeCompleteScreen();
  }, 3800);
}

function burstDepartureParticles() {
  const canvas = document.getElementById('boss-defeat-canvas');
  if (!canvas) return;

  const cx = canvas.width / 2;
  const cy = canvas.height * 0.4;

  const colors = [
    { fill: '#ff0055', glow: '#ff0055' },
    { fill: '#ff4500', glow: '#ff4500' },
    { fill: '#8b0000', glow: '#ff0055' },
    { fill: '#1a1016', glow: '#ff0055' },
    { fill: '#ffffff', glow: '#ffffff' }
  ];

  for (let i = 0; i < 200; i++) {
    const col = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 5;

    bossParticles.push({
      x: cx + (Math.random() - 0.5) * 120,
      y: cy + (Math.random() - 0.5) * 140,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      gravity: -0.03,
      size: 2 + Math.random() * 5,
      color: col.fill,
      glowColor: col.glow,
      glowBlur: 8 + Math.random() * 12,
      alpha: 0.9,
      fadeRate: 0.004 + Math.random() * 0.008,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.12,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }
}

function showChallengeCompleteScreen() {
  if (bossCompleteTimer) {
    clearTimeout(bossCompleteTimer);
    bossCompleteTimer = null;
  }

  const depContainer = document.getElementById('boss-departure-container');
  const completeScreen = document.getElementById('challenge-complete-screen');
  const stageComplete = document.getElementById('boss-stage-complete');
  const viewport = document.getElementById('boss-cinematic-viewport');

  if (depContainer) {
    depContainer.style.display = 'none';
    depContainer.classList.add('hidden');
  }

  if (stageComplete) {
    stageComplete.classList.remove('hidden');
    stageComplete.style.display = 'flex';
  }

  if (completeScreen) {
    completeScreen.classList.remove('hidden');
    completeScreen.style.display = 'flex';
    completeScreen.classList.add('challenge-complete-materialize');
  }

  if (viewport) {
    viewport.scrollTop = 0;
  }

  // Mostrar los nombres de los 5 organizadores/ponentes desde la configuración
  renderThanksNames();

  // Reproducir fanfarria y música triunfal final de ambiente
  playRealisticVictoryFanfare();
  startFinalCinematicMusic();

  logTerminalEvent('🎉 ESCAPE ROOM COMPLETADO. ¡Gracias por participar!', 'log-advance');
}

function renderThanksNames(customNames) {
  const container = document.getElementById('thanks-names-list');
  if (!container) return;

  const list = (Array.isArray(customNames) && customNames.length > 0)
    ? customNames
    : (typeof appConfig !== 'undefined' && appConfig && (appConfig.ponentes || appConfig.creadors || appConfig.creadores || appConfig.autores || appConfig.nombres))
    || ['Nombre 1', 'Nombre 2', 'Nombre 3', 'Nombre 4', 'Nombre 5'];

  container.innerHTML = '';
  list.forEach(name => {
    const chip = document.createElement('div');
    chip.className = 'thanks-name-chip';
    chip.innerHTML = `<span class="chip-avatar">⚡</span><span>${name}</span>`;
    container.appendChild(chip);
  });
}

function copyBossFlag() {}

function closeBossCinematic() {
  // BLOQUEO PERMANENTE: Durante y tras la cinemática final de derrota en ningún momento se puede volver ya al menú principal
  console.warn('[CINEMATIC] Intento de salida bloqueado: La cinemática de derrota y pantalla final es definitiva.');
  return;
}

// ================================================================
//  AUDIO CINEMATOGRÁFICO REALISTA & MÚSICA FINAL
// ================================================================

function startBattleIntroAmbience() {
  if (isMuted || !bossCinematicActive) return;
  try {
    if (bossIntroAmbience) {
      bossIntroAmbience.pause();
      bossIntroAmbience.currentTime = 0;
    }
    bossIntroAmbience = new Audio('../audio/sfx/battle_intro_ambience.wav');
    bossIntroAmbience.volume = 0.55;
    bossIntroAmbience.loop = true;
    const playPromise = bossIntroAmbience.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.warn('Ambiente de batalla bloqueado por autoplay:', e));
    }
  } catch (e) {
    console.warn('Error al iniciar ambiente de batalla:', e);
  }
}

function stopBattleIntroAmbience() {
  if (bossIntroAmbience) {
    try {
      bossIntroAmbience.pause();
      bossIntroAmbience.currentTime = 0;
    } catch (e) {}
    bossIntroAmbience = null;
  }
}

function playRealisticSound(filename, volume = 0.8, fallbackFn = null) {
  if (isMuted) return;
  try {
    const audio = new Audio(`../audio/sfx/${filename}`);
    audio.volume = Math.min(1, Math.max(0, volume));
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (typeof fallbackFn === 'function') fallbackFn();
      });
    }
    return audio;
  } catch (e) {
    if (typeof fallbackFn === 'function') fallbackFn();
    return null;
  }
}

function playBossFinalDestructionMusic(volume = 0.95) {
  if (isMuted || !bossCinematicActive) return null;
  try {
    if (bossFinalMusic) {
      bossFinalMusic.pause();
      bossFinalMusic.currentTime = 0;
    }
    // Cargar la canción subida por el usuario: final-music.mp3
    bossFinalMusic = new Audio('../audio/sfx/final-music.mp3');
    bossFinalMusic.volume = Math.min(1, Math.max(0, volume));
    bossFinalMusic.loop = false; // Canción con timing exacto (~5.8s)
    const playPromise = bossFinalMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn('final-music.mp3 bloqueado por autoplay o error, usando fallback:', e);
        try {
          bossFinalMusic = new Audio('../audio/sfx/final_cinematic_music.wav');
          bossFinalMusic.volume = volume;
          bossFinalMusic.play().catch(() => {});
        } catch (_) {}
      });
    }
    return bossFinalMusic;
  } catch (e) {
    console.warn('Error al reproducir música final del boss:', e);
    return null;
  }
}

function startFinalCinematicMusic() {
  if (isMuted || !bossCinematicActive) return;
  try {
    if (bossFinalMusic) {
      bossFinalMusic.pause();
      bossFinalMusic.currentTime = 0;
    }
    bossFinalMusic = new Audio('../audio/sfx/final_cinematic_music.wav');
    bossFinalMusic.volume = 0.55;
    bossFinalMusic.loop = true;
    const playPromise = bossFinalMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.warn('Música final bloqueada por autoplay:', e));
    }
  } catch (e) {
    console.warn('Error al iniciar música final:', e);
  }
}

function playBossPainAu() {
  playRealisticSound('au.mp3', 0.95);
}

function playBossPainNooo() {
  playRealisticSound('nooo.mp3', 1.0);
}

function playRealisticLaserAttack() {
  playRealisticSound('laser_attack.wav', 0.65, () => {
    if (typeof playKeyClick === 'function') playKeyClick();
  });
}

function playRealisticCriticalImpact() {
  playRealisticSound('critical_impact.wav', 0.9, playCinematicBassBraam);
}

function playRealisticBossDissolve() {
  playRealisticSound('boss_dissolve.wav', 0.85, playCinematicBassBraam);
}

function playRealisticVictoryFanfare() {
  playRealisticSound('victory_fanfare.wav', 0.9, () => {
    if (typeof playVictoryFanfare === 'function') playVictoryFanfare();
  });
}

function playBossWarningAlertSound() {
  if (isMuted) return null;

  const audio = playRealisticSound('boss_alarm.wav', 0.88, () => {
    // Fallback con Web Audio API: Síntesis procedural de aviso de alarma en 5 pulsos
    initAudio();
    if (!audioCtx || isMuted) return;
    const now = audioCtx.currentTime;

    // Sub-golpe cinemático de aviso
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.5);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.52);

    // Secuencia de pulsos de aviso digital
    const pulseTones = [
      { delay: 0.04, dur: 0.13, freq: 880 },
      { delay: 0.24, dur: 0.13, freq: 880 },
      { delay: 0.52, dur: 0.15, freq: 1046 },
      { delay: 0.76, dur: 0.15, freq: 1046 },
      { delay: 1.08, dur: 0.30, freq: 1318 }
    ];

    pulseTones.forEach(p => {
      const osc = audioCtx.createOscillator();
      const oscHarm = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(p.freq, now + p.delay);

      oscHarm.type = 'sine';
      oscHarm.frequency.setValueAtTime(p.freq * 1.5, now + p.delay);

      gain.gain.setValueAtTime(0.001, now + p.delay);
      gain.gain.linearRampToValueAtTime(0.22, now + p.delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + p.delay + p.dur);

      osc.connect(gain);
      oscHarm.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + p.delay);
      oscHarm.start(now + p.delay);
      osc.stop(now + p.delay + p.dur + 0.05);
      oscHarm.stop(now + p.delay + p.dur + 0.05);
    });
  });

  return audio;
}

function playLaserLockSound() {
  return playBossWarningAlertSound();
}

function playCinematicBassBraam() {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  const subOsc = audioCtx.createOscillator();
  const subGain = audioCtx.createGain();
  subOsc.type = 'sawtooth';
  subOsc.frequency.setValueAtTime(140, now);
  subOsc.frequency.exponentialRampToValueAtTime(26, now + 2.2);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(450, now);
  filter.frequency.exponentialRampToValueAtTime(60, now + 2.2);

  subGain.gain.setValueAtTime(0.55, now);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

  subOsc.connect(filter);
  filter.connect(subGain);
  subGain.connect(audioCtx.destination);
  subOsc.start(now);
  subOsc.stop(now + 2.85);

  const bufferSize = Math.floor(audioCtx.sampleRate * 1.5);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const nFilter = audioCtx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.setValueAtTime(3800, now);
  nFilter.frequency.exponentialRampToValueAtTime(200, now + 1.5);
  const nGain = audioCtx.createGain();
  nGain.gain.setValueAtTime(0.28, now);
  nGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(audioCtx.destination);
  noise.start(now);
}

function playTerminalConnectSound() {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  [0, 0.12].forEach((offset, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(idx === 0 ? 987 : 1318, now + offset);
    gain.gain.setValueAtTime(0.08, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.15);
  });
}

// Bloqueo estricto de la tecla Escape durante la cinemática de derrota
window.addEventListener('keydown', (e) => {
  if (bossCinematicActive && (e.key === 'Escape' || e.key === 'Esc')) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);
