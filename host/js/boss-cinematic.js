// ================================================================
//  HOST - boss-cinematic.js
//  Cinemática Épica de Derrota del Boss y Exfiltración Consumada
// ================================================================

let bossCinematicActive = false;
let bossTypewriterInterval = null;
let bossParticlesInterval = null;

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

  if (!cinematic) return;

  // Reset de estados
  cinematic.classList.remove('hidden');
  if (stage1) stage1.classList.remove('hidden');
  if (stage2) stage2.classList.add('hidden');
  if (flagBox) flagBox.classList.add('hidden');
  if (container) container.innerHTML = '';

  // Actualizar hora en la cinemática
  const timeEl = document.getElementById('cinematic-live-time');
  if (timeEl) timeEl.textContent = new Date().toTimeString().slice(0, 8);

  // Iniciar partículas de código flotante
  startBossParticles();

  // 1. Fase 1: Explosión y colapso masivo de la máscara hostil
  playBossDefeatExplosion();

  // Temblor de pantalla y flash cegador
  document.body.classList.remove('epic-boss-defeat-shake');
  void document.body.offsetWidth;
  document.body.classList.add('epic-boss-defeat-shake');

  const flash = document.createElement('div');
  flash.className = 'boss-critical-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 2200);

  // Registrar en terminal de fondo del host
  logTerminalEvent('⚡ COLAPSO NÚCLEO HOSTIL: Intruso neutralizado y expulsado del servidor (0% amenaza).', 'log-alert');

  // 2. Transición hacia la Fase 2: El Manifiesto y el robo consumado tras 4.2 segundos
  setTimeout(() => {
    if (!bossCinematicActive) return;
    if (stage1) stage1.classList.add('hidden');
    if (stage2) {
      stage2.classList.remove('hidden');
      stage2.classList.add('cinematic-fade-in');
    }

    // Audio de interferencia de señal Tor
    playGlitchInterferenceSound();

    // Comenzar mecanografía del manifiesto
    typewriterManifesto();
  }, 4200);
}

function playBossDefeatExplosion() {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  // Subgrave expansivo
  const sub = audioCtx.createOscillator();
  const subG = audioCtx.createGain();
  sub.type = 'sawtooth';
  sub.frequency.setValueAtTime(160, now);
  sub.frequency.exponentialRampToValueAtTime(24, now + 2.5);
  subG.gain.setValueAtTime(0.5, now);
  subG.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
  sub.connect(subG);
  subG.connect(audioCtx.destination);
  sub.start(now);
  sub.stop(now + 2.8);

  // Ruido de cristal/circuitos rotos
  const nSz = Math.floor(audioCtx.sampleRate * 2.0);
  const nBuf = audioCtx.createBuffer(1, nSz, audioCtx.sampleRate);
  const nD = nBuf.getChannelData(0);
  for (let i = 0; i < nSz; i++) {
    nD[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nSz, 1.2);
  }
  const nSrc = audioCtx.createBufferSource();
  nSrc.buffer = nBuf;
  const nFilter = audioCtx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.setValueAtTime(4500, now);
  nFilter.frequency.exponentialRampToValueAtTime(150, now + 1.8);
  const nGain = audioCtx.createGain();
  nGain.gain.setValueAtTime(0.35, now);
  nGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
  nSrc.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(audioCtx.destination);
  nSrc.start(now);
}

function playGlitchInterferenceSound() {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
  g.gain.setValueAtTime(0.15, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.45);
}

function typewriterManifesto() {
  const container = document.getElementById('boss-typewriter-container');
  if (!container) return;
  container.innerHTML = '';

  let pIndex = 0;

  function typeNextParagraph() {
    if (pIndex >= MANIFESTO_PARAGRAPHS.length) {
      // Al terminar el manifiesto, revelar la FLAG de forma épica
      setTimeout(revealEpicFlag, 600);
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

    // Efecto de tecleo de caracteres
    let charIndex = 0;
    const text = item.text;
    const typingInterval = setInterval(() => {
      if (charIndex < text.length) {
        textSpan.textContent += text[charIndex++];
        if (charIndex % 3 === 0 && !isMuted) {
          playKeyClick();
        }
      } else {
        clearInterval(typingInterval);
        // Pausa entre párrafos
        setTimeout(typeNextParagraph, item.cls.includes('alert-highlight') ? 900 : 450);
      }
      container.scrollTop = container.scrollHeight;
    }, 18);
  }

  typeNextParagraph();

  // Intentar reproducir audio del hacker o síntesis de voz en segundo plano
  const phrase = (appConfig && appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.frase) ||
    "Vaya, vaya... Habéis llegado al final. Habéis seguido cada rastro, habéis roto los cifrados y habéis completado el reto. ¿De verdad creíais que esto era un juego con final feliz, verdad? Vuestros datos ya no están en este sistema. Hace exactamente diez minutos que terminó la copia, y no van a volver. En la red nadie devuelve lo que ya ha robado. Tomadlo como una lección: esto no era una prueba de rescate, era un aviso.";
  
  const customAudio = new Audio('/audio/hacker_derrota.mp3');
  customAudio.play().catch(() => {
    speakHackerPhrase(phrase, 3);
  });
}

function revealEpicFlag() {
  const flagBox = document.getElementById('boss-flag-reveal-box');
  if (!flagBox) return;

  flagBox.classList.remove('hidden');
  flagBox.classList.add('flag-reveal-boom');

  // Fanfarria y campana de logro
  if (typeof playVictoryFanfare === 'function') {
    playVictoryFanfare();
  }

  logTerminalEvent('🏆 FLAG DE SEGURIDAD EMITIDA: FLAG{NUNC4_C0NF13S_Y_S1GU3_4PR3ND13ND0}', 'log-advance');
}

function startBossParticles() {
  const layer = document.getElementById('boss-particles-layer');
  if (!layer) return;
  layer.innerHTML = '';

  const chars = ['0', '1', 'EXFIL', 'ROOT', 'ERR', '0x9F', 'DEAD', 'NULL', 'KILL'];
  if (bossParticlesInterval) clearInterval(bossParticlesInterval);

  bossParticlesInterval = setInterval(() => {
    if (!bossCinematicActive) {
      clearInterval(bossParticlesInterval);
      return;
    }
    const span = document.createElement('span');
    span.className = 'boss-particle';
    span.textContent = chars[Math.floor(Math.random() * chars.length)];
    span.style.left = Math.random() * 100 + 'vw';
    span.style.animationDuration = (2.5 + Math.random() * 3) + 's';
    span.style.opacity = (0.2 + Math.random() * 0.7).toString();
    span.style.fontSize = (10 + Math.random() * 14) + 'px';
    layer.appendChild(span);

    setTimeout(() => span.remove(), 5500);
  }, 90);
}

function closeBossCinematic() {
  bossCinematicActive = false;
  const cinematic = document.getElementById('boss-defeat-cinematic');
  if (cinematic) cinematic.classList.add('hidden');
  if (bossParticlesInterval) clearInterval(bossParticlesInterval);
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  document.body.classList.remove('epic-boss-defeat-shake');
}

// Tecla ESC para salir de la cinemática
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && bossCinematicActive) {
    closeBossCinematic();
  }
});
