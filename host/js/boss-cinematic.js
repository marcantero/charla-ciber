// ================================================================
//  HOST - boss-cinematic.js
//  Cinemática de Derrota Final y Exfiltración (Estilo Película / Widescreen)
// ================================================================

let bossCinematicActive = false;
let bossTypewriterInterval = null;
let bossCanvasAnimId = null;
let bossParticles = [];
let bossLasers = [];

const MANIFESTO_PARAGRAPHS = [
  {
    prefix: '> [ORIGEN TOR_NODE_0x7F]: ',
    text: '"Vaya, vaya... Habéis llegado al final. Habéis seguido cada rastro, habéis roto los cifrados y habéis completado el reto."',
    cls: 'text-normal'
  },
  {
    prefix: '> [CANAL AUDIO_INTERCEPT]: ',
    text: '"¿De verdad creíais que esto era un juego con final feliz, verdad? Pensabais que resolviendo cuatro pistas ibais a recuperar vuestros archivos... Bienvenidos al mundo real."',
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
    prefix: '> [SYSTEM_FLAG]: ',
    text: 'Vuestra flag final: FLAG{NUNC4_C0NF13S_Y_S1GU3_4PR3ND13ND0}',
    cls: 'text-flag'
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
  const stage1 = document.getElementById('boss-cinematic-stage1');
  const stage2 = document.getElementById('boss-cinematic-stage2');
  const flagBox = document.getElementById('boss-flag-reveal-box');
  const container = document.getElementById('boss-typewriter-container');
  const avatar = document.getElementById('boss-hologram-avatar');
  const flare = document.getElementById('cinematic-lens-flare');

  if (!cinematic) return;

  // Reset de estados
  cinematic.classList.remove('hidden');
  if (stage1) {
    stage1.classList.remove('hidden');
    stage1.classList.remove('fade-out-down');
  }
  if (stage2) {
    stage2.classList.add('hidden');
    stage2.classList.remove('cinematic-fade-in');
  }
  if (flagBox) flagBox.classList.add('hidden');
  if (container) container.innerHTML = '';
  if (avatar) avatar.classList.remove('dissolving');
  if (flare) flare.classList.remove('flare-active');

  // Actualizar hora en la cinemática
  const timeEl = document.getElementById('cinematic-live-time');
  if (timeEl) timeEl.textContent = new Date().toTimeString().slice(0, 8);

  // Iniciar motor de renderizado de partículas y lásers en Canvas
  initBossCanvasEngine();

  // Iniciar sonido atmosférico de encierro
  playLaserLockSound();

  // Registrar en terminal de eventos
  logTerminalEvent('⚡ AISLAMIENTO DE NÚCLEO HOSTIL: Protocolo de expulsión forzada activado (0% amenaza).', 'log-alert');

  // Momento Clímax 1 (a los 2.0s): Disolución del Avatar y Onda de Choque Anamórfica
  setTimeout(() => {
    if (!bossCinematicActive) return;

    // Disolución visual del avatar en pantalla
    if (avatar) avatar.classList.add('dissolving');

    // Desatar ráfaga masiva de partículas digitales cuánticas
    burstDissolutionParticles();

    // Destello de lente anamórfica horizontal (estilo cinematográfico JJ Abrams / Blade Runner)
    if (flare) {
      flare.classList.add('flare-active');
      setTimeout(() => flare.classList.remove('flare-active'), 1200);
    }

    // Impacto subgrave masivo y chisporroteo eléctrico
    playCinematicBassBraam();

    // Sacudida física controlada de la cámara
    triggerCinematicCameraShake();
  }, 2000);

  // Momento Clímax 2 (a los 4.8s): Transición fluida al Acto 2 (Terminal Tor & Manifiesto)
  setTimeout(() => {
    if (!bossCinematicActive) return;

    if (stage1) {
      stage1.classList.add('fade-out-down');
      setTimeout(() => {
        stage1.classList.add('hidden');
      }, 600);
    }

    if (stage2) {
      stage2.classList.remove('hidden');
      stage2.classList.add('cinematic-fade-in');
    }

    // Sonido de conexión a proxy Tor
    playTerminalConnectSound();

    // Iniciar el efecto de mecanografía del manifiesto
    typewriterManifesto();
  }, 4800);
}

// ================================================================
//  MOTOR DE CANVAS DE DESINTEGRACIÓN Y LÁSERES DE CONFINAMIENTO
// ================================================================

function initBossCanvasEngine() {
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
  bossLasers = [];

  const cx = window.innerWidth / 2;
  const cy = window.innerHeight * 0.46;

  // Inicializar rayos láser de contención apuntando al avatar
  const corners = [
    { x: 0, y: 0 },
    { x: window.innerWidth, y: 0 },
    { x: 0, y: window.innerHeight },
    { x: window.innerWidth, y: window.innerHeight }
  ];

  corners.forEach(c => {
    bossLasers.push({
      x1: c.x,
      y1: c.y,
      x2: cx,
      y2: cy,
      alpha: 0.1,
      targetAlpha: 0.75,
      width: 1.5,
      pulse: Math.random() * Math.PI
    });
  });

  if (bossCanvasAnimId) cancelAnimationFrame(bossCanvasAnimId);

  let frameCount = 0;

  function renderLoop() {
    if (!bossCinematicActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    // 1. Dibujar rayos láser de contención hacia el núcleo
    const currentCx = canvas.width / 2;
    const currentCy = canvas.height * 0.44;

    bossLasers.forEach(l => {
      l.pulse += 0.08;
      l.alpha += (l.targetAlpha - l.alpha) * 0.05;

      const glow = Math.sin(l.pulse) * 0.3 + 0.7;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(currentCx, currentCy);
      ctx.strokeStyle = `rgba(0, 229, 255, ${l.alpha * glow})`;
      ctx.lineWidth = l.width;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Haz interior fino blanco
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(currentCx, currentCy);
      ctx.strokeStyle = `rgba(255, 255, 255, ${l.alpha * glow * 0.8})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    });

    // 2. Animar partículas cuánticas de desintegración
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

function burstDissolutionParticles() {
  const canvas = document.getElementById('boss-defeat-canvas');
  if (!canvas) return;

  const cx = canvas.width / 2;
  const cy = canvas.height * 0.44;

  const colors = [
    { fill: '#00e5ff', glow: '#00e5ff' }, // Cyan digital
    { fill: '#00ff66', glow: '#00ff66' }, // Verde matrix
    { fill: '#ff0055', glow: '#ff0055' }, // Rojo alarma
    { fill: '#ffffff', glow: '#ffffff' }  // Núcleo blanco
  ];

  // Desvanecer láseres de contención
  bossLasers.forEach(l => {
    l.targetAlpha = 0;
  });

  // Generar 280 partículas digitales que se dispersan en abanico
  for (let i = 0; i < 280; i++) {
    const col = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.8 + Math.random() * 9.5;

    bossParticles.push({
      x: cx + (Math.random() - 0.5) * 140,
      y: cy + (Math.random() - 0.5) * 160,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5, // Impulso ascendente
      gravity: -0.06, // Flotan hacia arriba como cenizas cuánticas
      size: 2.5 + Math.random() * 5.5,
      color: col.fill,
      glowColor: col.glow,
      glowBlur: 10 + Math.random() * 15,
      alpha: 0.9 + Math.random() * 0.1,
      fadeRate: 0.006 + Math.random() * 0.012,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.15,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }
}

function triggerCinematicCameraShake() {
  const viewport = document.getElementById('boss-cinematic-viewport');
  if (!viewport) return;
  viewport.classList.remove('cinematic-camera-shake');
  void viewport.offsetWidth;
  viewport.classList.add('cinematic-camera-shake');
  setTimeout(() => viewport.classList.remove('cinematic-camera-shake'), 900);
}

// ================================================================
//  MECANOGRAFÍA DEL MANIFIESTO ENCRIPTADO Y REVELACIÓN DE FLAG
//  Sincronización milimétrica con la duración real del audio del hacker
// ================================================================

let bossCurrentAudio = null;

function typewriterManifesto() {
  const container = document.getElementById('boss-typewriter-container');
  if (!container) return;
  container.innerHTML = '';

  const phrase = (appConfig && appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.frase) ||
    "Vaya, vaya... Habéis llegado al final. Habéis seguido cada rastro, habéis roto los cifrados y habéis completado el reto. ¿De verdad creíais que esto era un juego con final feliz, verdad? Vuestros datos ya no están en este sistema. Hace exactamente diez minutos que terminó la copia, y no van a volver. En la red nadie devuelve lo que ya ha robado. Tomadlo como una lección: esto no era una prueba de rescate, era un aviso.";

  const audioCfg = (appConfig && appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.audio) || 'audio-hacker-3.mp3';
  const candidates = [
    `/audio/hacker/${audioCfg}`,
    `/audio/${audioCfg}`,
    '/audio/hacker/audio-hacker-3.mp3',
    '/audio/audio-hacker-3.mp3',
    '/audio/hacker/hacker_derrota.mp3',
    '/audio/hacker_derrota.mp3'
  ];

  // Iniciar audio con helper sincronizado
  let audioStarted = false;

  function onAudioStarted(soundInstance) {
    audioStarted = true;
    bossCurrentAudio = soundInstance;

    // Obtener duración (o esperar evento loadedmetadata si aún no está lista)
    if (soundInstance.duration && !isNaN(soundInstance.duration) && soundInstance.duration > 5) {
      startSynchronizedTypewriting(soundInstance.duration);
    } else {
      soundInstance.addEventListener('loadedmetadata', () => {
        const dur = (soundInstance.duration && !isNaN(soundInstance.duration)) ? soundInstance.duration : 82;
        startSynchronizedTypewriting(dur);
      }, { once: true });

      // Fallback de seguridad si loadedmetadata tarda
      setTimeout(() => {
        if (!typewritingStarted) {
          const dur = (soundInstance.duration && !isNaN(soundInstance.duration)) ? soundInstance.duration : 82;
          startSynchronizedTypewriting(dur);
        }
      }, 400);
    }
  }

  function onAudioFailed() {
    console.warn('[BOSS SYNC] Audio no disponible o bloqueado. Usando síntesis de voz / temporización estimada.');
    // Duración estimada para locución hablada (~45 segundos para el manifiesto completo)
    startSynchronizedTypewriting(45);
    speakHackerPhrase(phrase, 3);
  }

  let typewritingStarted = false;

  function startSynchronizedTypewriting(totalAudioDurationSeconds) {
    if (typewritingStarted || !bossCinematicActive) return;
    typewritingStarted = true;

    // Calcular distribución de tiempo proporcional a los caracteres de cada párrafo
    const totalChars = MANIFESTO_PARAGRAPHS.reduce((sum, p) => sum + p.text.length, 0);
    // Reservamos 3.5s antes del final del audio para la revelación y pausa final
    const availableTypingDurationMs = Math.max((totalAudioDurationSeconds - 3.5) * 1000, 20000);

    // Tiempo promedio por caracter adaptado dinámicamente al audio
    const msPerChar = Math.max(availableTypingDurationMs / totalChars, 14);

    console.log(`[BOSS SYNC] Duración audio: ${totalAudioDurationSeconds.toFixed(1)}s. ms/carácter calculado: ${msPerChar.toFixed(2)}ms`);

    let pIndex = 0;

    function typeNextParagraph() {
      if (!bossCinematicActive) return;

      if (pIndex >= MANIFESTO_PARAGRAPHS.length) {
        // Al terminar el manifiesto, revelar la FLAG de forma épica
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

      // Mecanografiar caracter por caracter adaptado
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
          // Pausa proporcional entre párrafos
          const pauseBetween = item.cls.includes('alert-highlight') ? Math.max(msPerChar * 14, 700) : Math.max(msPerChar * 8, 400);
          setTimeout(typeNextParagraph, pauseBetween);
        }
        container.scrollTop = container.scrollHeight;
      }, msPerChar);
    }

    typeNextParagraph();
  }

  // Ejecutar reproductor con callbacks sincronizados
  if (typeof tryPlayAudioWithSync === 'function') {
    tryPlayAudioWithSync(candidates, onAudioStarted, onAudioFailed, () => {
      // Al terminar el audio, asegurar que la flag esté revelada
      revealEpicFlag();
    });
  } else if (typeof tryPlayCandidates === 'function') {
    tryPlayCandidates(candidates, onAudioFailed, () => {
      revealEpicFlag();
    });
    startSynchronizedTypewriting(82);
  } else {
    onAudioFailed();
  }
}

function revealEpicFlag() {
  const flagBox = document.getElementById('boss-flag-reveal-box');
  if (!flagBox) return;

  // Si ya está visible, no duplicar efectos
  if (!flagBox.classList.contains('hidden')) return;

  flagBox.classList.remove('hidden');
  flagBox.classList.add('flag-card-materialize');

  // Auto-scroll para que el contenedor siempre muestre la flag completa
  const viewport = document.getElementById('boss-cinematic-viewport');
  if (viewport) {
    viewport.scrollTop = viewport.scrollHeight;
  }

  // Fanfarria triunfal sintética
  if (typeof playVictoryFanfare === 'function') {
    playVictoryFanfare();
  }

  logTerminalEvent('🏆 FLAG DE SEGURIDAD EMITIDA: FLAG{NUNC4_C0NF13S_Y_S1GU3_4PR3ND13ND0}', 'log-advance');
}

function copyBossFlag(btn) {
  const flagCode = 'FLAG{NUNC4_C0NF13S_Y_S1GU3_4PR3ND13ND0}';
  navigator.clipboard.writeText(flagCode).then(() => {
    const original = btn.innerHTML;
    btn.innerHTML = '<span>✓ ¡COPIADA!</span>';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('copied');
    }, 2200);
  }).catch(() => {
    prompt('Copia tu FLAG de seguridad:', flagCode);
  });
}

function closeBossCinematic() {
  bossCinematicActive = false;
  if (bossCurrentAudio) {
    try {
      bossCurrentAudio.pause();
      bossCurrentAudio.currentTime = 0;
    } catch (e) {}
    bossCurrentAudio = null;
  }
  const cinematic = document.getElementById('boss-defeat-cinematic');
  if (cinematic) cinematic.classList.add('hidden');
  if (bossCanvasAnimId) cancelAnimationFrame(bossCanvasAnimId);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ================================================================
//  AUDIO CINEMATOGRÁFICO Y SÍNTESIS WEB AUDIO API
// ================================================================

function playLaserLockSound() {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  // Tono de bloqueo láser electromagnético
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.6);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 1.25);
}

function playCinematicBassBraam() {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  // 1. Subgrave masivo de película (130Hz -> 28Hz)
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

  // 2. Ruido blanco de disipación de alta frecuencia
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

  // Doble pitido de sincronización de módem cuántico
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

// Tecla ESC para salir de la cinemática
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && bossCinematicActive) {
    closeBossCinematic();
  }
});
