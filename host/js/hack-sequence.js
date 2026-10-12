// ================================================================
//  HOST - hack-sequence.js
//  Disparador del hackeo de Anonymous y simulación de la terminal
// ================================================================

let isHackingActive = false;
let anonTerminalInterval = null;
let anonLogIndex = 0;

const HACKER_TERMINAL_LOGS = [
  { text: 'Infiltrando servidores DNS y router gateway 192.168.1.1...', cls: 'text-amber' },
  { text: 'Servidor de calificaciones y expedientes: [ENCRIPTADO]', cls: 'text-red' },
  { text: 'Protocolo de extorsión activado en el IES Tecnológico.', cls: 'text-red' },
  { text: '[!] ALERTA: 5 terminales de alumnos detectadas en la subred.', cls: 'text-amber' },
  { text: 'nmap -sS -p- 192.168.1.0/24 -T4 --open -> 14 hosts activos detectados.', cls: 'text-cyan' },
  { text: 'Host 192.168.1.10 (srv-educativo.ies): Puertos 22, 80, 445, 8080 ABIERTOS.', cls: 'text-amber' },
  { text: 'Analizando banner HTTP: Apache/2.4.41 mod_ssl/2.4.41 OpenSSL/1.1.1', cls: '' },
  { text: 'Inyectando exploit de desbordamiento de búfer CVE-2024-3094...', cls: 'text-red' },
  { text: '[OK] Inyección de shellcode ejecutada: retorno a memoria redirigido.', cls: 'text-green' },
  { text: 'Estableciendo reverse shell cifrado: /dev/tcp/0xanon.dark/4444 -> CONECTADO.', cls: 'text-green' },
  { text: 'Comprobando permisos SUID y sudoers: /usr/bin/python3 cap_setuid+ep encontrado.', cls: '' },
  { text: 'ROOT ACCESO CONCEDIDO: uid=0(root) gid=0(root) grupos=0(root)', cls: 'text-green' },
  { text: 'Neutralizando agentes de monitorización Wazuh y antivirus local...', cls: 'text-amber' },
  { text: 'Vaciando reglas de cortafuegos: iptables -F && iptables -t nat -F -> FIREWALL DOWN.', cls: 'text-red' },
  { text: 'Sobrescribiendo registros en /var/log/auth.log y /var/log/syslog con ceros.', cls: '' },
  { text: 'Iniciando envenenamiento ARP con arpspoof en eth0 (192.168.1.1 -> 192.168.1.50).', cls: 'text-cyan' },
  { text: 'Tráfico de red interceptado: capturando paquetes HTTP no seguros del aula.', cls: 'text-amber' },
  { text: 'Aircrack-ng analizando paquetes WPA2 de la red Wi-Fi de dirección...', cls: 'text-cyan' },
  { text: 'Extrayendo hashes NTLMv2 mediante Responder en subred escolar...', cls: 'text-amber' },
  { text: 'Hashcat desencriptando contraseñas con diccionario: 48 credenciales obtenidas.', cls: 'text-green' },
  { text: 'Credencial encontrada: director@ies.edu -> clave institucional vulnerada.', cls: 'text-red' },
  { text: 'Iniciando motor de cifrado AES-256-GCM + clave asimétrica RSA-4096...', cls: 'text-red' },
  { text: 'Cifrando /srv/db/expedientes_alumnos_2026.sql... [BLOQUEADO 100%]', cls: 'text-red' },
  { text: 'Cifrando /home/secretaria/actas_evaluacion_T3.xlsx... [BLOQUEADO 100%]', cls: 'text-red' },
  { text: 'Cifrando /var/backups/copia_seguridad_ies.tar.gz... [BLOQUEADO 100%]', cls: 'text-red' },
  { text: 'Exfiltrando 4.2 GB de datos comprimidos a nodo Tor darknet...', cls: 'text-cyan' },
  { text: 'Secuestrando cámaras del pasillo: rtsp://camaras-ies:554/feed -> STREAM TOMADO.', cls: 'text-amber' },
  { text: 'Interrumpiendo pantallas y proyectores del centro escolar...', cls: 'text-red' },
  { text: 'Desplegando bloqueo de seguridad en 5 fases criptográficas...', cls: 'text-amber' },
  { text: 'FASE 1: Señal de audio esteganográfico inyectada en espectro acústico.', cls: 'text-cyan' },
  { text: 'FASE 2: Servidor Linux cifrado con clave oculta en el sistema de ficheros.', cls: 'text-cyan' },
  { text: 'FASE 3: Evidencia forense encapsulada en metadatos EXIF de imagen.', cls: 'text-cyan' },
  { text: 'FASE 4: Algoritmo de función afín matemática y=ax+b bloqueando el gateway.', cls: 'text-cyan' },
  { text: 'FASE 5: Clímax de descifrado maestro encadenado a los 5 equipos del aula.', cls: 'text-cyan' },
  { text: '[ANONYMOUS]: "El reloj corre. Tenéis 5 retos para evitar el borrado definitivo."', cls: 'text-red' },
  { text: 'Sondeando intentos de conexión de los alumnos: esperando respuestas...', cls: 'text-amber' }
];

function triggerHackAnimation() {
  if (isHackingActive) return;
  isHackingActive = true;

  // Romper el modo formal de la presentación
  document.body.classList.remove('in-formal-presentation');
  document.body.classList.add('hacked-mode');

  initAudio();
  playHackGlitchSound();

  // Glitch en el viewport de diapositivas
  const presSlide = document.getElementById('main-slide');
  if (presSlide) {
    presSlide.classList.add('glitching');
  }
  const activeSlide = document.querySelector('.slide-card.active');
  if (activeSlide) {
    activeSlide.classList.add('glitching');
  }

  // Tras 1.3s de glitch destructivo en la diapositiva, irrupción de Anonymous
  setTimeout(() => {
    const presScreen = document.getElementById('presentation-screen');
    const hackScreen = document.getElementById('hack-takeover-screen');
    const quoteEl = document.getElementById('anon-quote-text');
    const descEl = document.getElementById('anon-speech-desc');

    if (quoteEl) quoteEl.innerHTML = '';
    if (descEl) descEl.innerHTML = '';

    if (presScreen) presScreen.classList.add('hidden');
    if (hackScreen) hackScreen.classList.remove('hidden');

    // Reproducir sirena de alarma
    playSirenAlarm();

    // Comenzar mecanografía sincronizada palabra a palabra con la locución
    setTimeout(startInitialHackTypewriter, 600);

    // Simular escritura en tiempo real de la terminal de ataque
    simulateAnonymousTerminal();
  }, 1300);
}

// ═══════════════════════════════════════════════════════════
//  MECANOGRAFÍA SINCRONIZADA CON LA VOZ DEL ANÓNIMO (INICIO)
// ═══════════════════════════════════════════════════════════
let anonTypewriterActive = false;
let anonTypewriterInterval = null;
let anonAudio1 = null;
let anonAudio2 = null;

function startInitialHackTypewriter() {
  const quoteEl = document.getElementById('anon-quote-text');
  const descEl = document.getElementById('anon-speech-desc');
  const avatarBox = document.querySelector('.anon-avatar-box');
  const btnEnter = document.getElementById('btn-enter-dashboard');
  const skipHint = document.getElementById('speech-skip-hint');

  if (!quoteEl || !descEl) return;

  // Si ya estaba en marcha, reiniciar
  if (anonTypewriterInterval) {
    clearInterval(anonTypewriterInterval);
    anonTypewriterInterval = null;
  }
  if (anonAudio1) {
    try { anonAudio1.pause(); } catch (e) {}
    anonAudio1 = null;
  }
  if (anonAudio2) {
    try { anonAudio2.pause(); } catch (e) {}
    anonAudio2 = null;
  }

  anonTypewriterActive = true;
  if (avatarBox) avatarBox.classList.add('speaking');
  if (btnEnter) btnEnter.classList.remove('ready-pulse');
  if (skipHint) skipHint.style.opacity = '0.7';

  const instName = (appConfig && appConfig.nombreInstituto) ? appConfig.nombreInstituto : 'Institut Vil·la Romana';
  const teamsNum = (appConfig && appConfig.numeroEquipos) ? appConfig.numeroEquipos : 5;

  quoteEl.innerHTML = '';
  descEl.innerHTML = '';

  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';

  // Frase titular (Parte 1: ~8.2s)
  const part1Raw = `"Hola ${instName}, me infiltrado en vuestro instituto jajajajaja (risa malvada)."`;

  // Párrafos del cuerpo (Parte 2: ~19.5s)
  const part2Items = [
    { text: "Voy a cifrar todos vuestros datos. Pero para que esto sea más divertido voy a dejaros unos retos para que podáis pararme.", isTeams: false, isEnd: false },
    { text: `Tendréis que hacer ${teamsNum} grupos, con el objetivo de intentar pararme con todo lo que habéis aprendido en esta charla.`, isTeams: true, isEnd: false },
    { text: "Mucha suerte.", isTeams: false, isEnd: true }
  ];

  let part1Started = false;

  function typePart1(durationSec) {
    if (!anonTypewriterActive || part1Started) return;
    part1Started = true;

    quoteEl.appendChild(cursor);

    const availableMs = Math.max((durationSec - 0.6) * 1000, 4200);
    const msPerChar = Math.max(Math.floor(availableMs / part1Raw.length), 18);

    let charIdx = 0;
    anonTypewriterInterval = setInterval(() => {
      if (!anonTypewriterActive) {
        clearInterval(anonTypewriterInterval);
        return;
      }

      if (charIdx < part1Raw.length) {
        const char = part1Raw[charIdx++];
        cursor.insertAdjacentText('beforebegin', char);
        if (charIdx % 3 === 0 && typeof playKeyClick === 'function') {
          playKeyClick();
        }
      } else {
        clearInterval(anonTypewriterInterval);
        anonTypewriterInterval = null;

        // Formatear titular con span destacado
        quoteEl.innerHTML = `"Hola <span class="quote-highlight-red" id="hacker-msg-inst">${instName}</span>, me infiltrado en vuestro instituto jajajajaja (risa malvada)."`;

        // Breve pausa antes de la segunda parte
        setTimeout(startPart2, 450);
      }
    }, msPerChar);
  }

  function startPart2() {
    if (!anonTypewriterActive) return;

    function typePart2(durationSec) {
      if (!anonTypewriterActive) return;

      const totalChars = part2Items.reduce((acc, it) => acc + it.text.length, 0);
      const availableMs = Math.max((durationSec - 1.2) * 1000, 7500);
      const msPerChar = Math.max(Math.floor(availableMs / totalChars), 15);

      let itemIdx = 0;

      function typeNextItem() {
        if (!anonTypewriterActive) return;

        if (itemIdx >= part2Items.length) {
          finishAnonTypewriter();
          return;
        }

        const item = part2Items[itemIdx++];
        const p = document.createElement('p');
        if (item.isEnd) {
          p.style.marginTop = '8px';
          p.style.color = '#ff3355';
          p.style.fontWeight = '700';
        } else if (itemIdx > 1) {
          p.style.marginTop = '8px';
        }

        descEl.appendChild(p);
        p.appendChild(cursor);

        let cIdx = 0;
        const text = item.text;

        anonTypewriterInterval = setInterval(() => {
          if (!anonTypewriterActive) {
            clearInterval(anonTypewriterInterval);
            return;
          }

          if (cIdx < text.length) {
            cursor.insertAdjacentText('beforebegin', text[cIdx++]);
            if (cIdx % 4 === 0 && typeof playKeyClick === 'function') {
              playKeyClick();
            }
          } else {
            clearInterval(anonTypewriterInterval);
            anonTypewriterInterval = null;

            if (item.isTeams) {
              p.innerHTML = `Tendréis que hacer <strong class="quote-highlight-cyan" id="hacker-msg-teams">${teamsNum} grupos</strong>, con el objetivo de intentar pararme con todo lo que habéis aprendido en esta charla.`;
            }

            setTimeout(typeNextItem, 350);
          }
        }, msPerChar);
      }

      typeNextItem();
    }

    const part2Candidates = [
      '/audio/hacker/audio-hacker-inicio2.mp3',
      '/audio/audio-hacker-inicio2.mp3'
    ];

    if (typeof tryPlayAudioWithSync === 'function') {
      tryPlayAudioWithSync(
        part2Candidates,
        (snd) => {
          anonAudio2 = snd;
          const dur = (snd.duration && !isNaN(snd.duration) && snd.duration > 3) ? snd.duration : 19.5;
          typePart2(dur);
        },
        () => {
          typePart2(18.0);
        },
        () => {
          finishAnonTypewriter();
        }
      );
    } else {
      typePart2(18.0);
    }
  }

  // Generador de subgraves de tensión ambiental
  initAudio();
  if (audioCtx && !isMuted) {
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(52, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 5.0);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 5.6);
    } catch (e) {}
  }

  const part1Candidates = [
    '/audio/hacker/audio-hacker-inicio.mp3',
    '/audio/audio-hacker-inicio.mp3'
  ];

  if (typeof tryPlayAudioWithSync === 'function') {
    tryPlayAudioWithSync(
      part1Candidates,
      (snd) => {
        anonAudio1 = snd;
        const dur = (snd.duration && !isNaN(snd.duration) && snd.duration > 2) ? snd.duration : 8.2;
        typePart1(dur);
      },
      () => {
        console.warn('[HACK TYPEWRITER] Audio 1 no encontrado, iniciando con temporización estimada.');
        typePart1(8.0);
        if (typeof speakSynthesizedAnonymous === 'function') {
          speakSynthesizedAnonymous();
        }
      },
      () => {
        if (!part1Started) typePart1(8.0);
      }
    );
  } else {
    typePart1(8.2);
  }
}

function skipAnonTypewriter() {
  finishAnonTypewriter(true);
}

function finishAnonTypewriter(force = false) {
  anonTypewriterActive = false;
  if (anonTypewriterInterval) {
    clearInterval(anonTypewriterInterval);
    anonTypewriterInterval = null;
  }

  const quoteEl = document.getElementById('anon-quote-text');
  const descEl = document.getElementById('anon-speech-desc');
  const avatarBox = document.querySelector('.anon-avatar-box');
  const btnEnter = document.getElementById('btn-enter-dashboard');
  const skipHint = document.getElementById('speech-skip-hint');

  const instName = (appConfig && appConfig.nombreInstituto) ? appConfig.nombreInstituto : 'Institut Vil·la Romana';
  const teamsNum = (appConfig && appConfig.numeroEquipos) ? appConfig.numeroEquipos : 5;

  if (quoteEl) {
    quoteEl.innerHTML = `"Hola <span class="quote-highlight-red" id="hacker-msg-inst">${instName}</span>, me infiltrado en vuestro instituto jajajajaja (risa malvada)."`;
  }
  if (descEl) {
    descEl.innerHTML = `
      <p>Voy a cifrar todos vuestros datos. Pero para que esto sea más divertido voy a dejaros unos retos para que podáis pararme.</p>
      <p style="margin-top: 8px;">Tendréis que hacer <strong class="quote-highlight-cyan" id="hacker-msg-teams">${teamsNum} grupos</strong>, con el objetivo de intentar pararme con todo lo que habéis aprendido en esta charla.</p>
      <p style="margin-top: 8px; color: #ff3355; font-weight: 700;">Mucha suerte.</p>
    `;
  }

  if (avatarBox) avatarBox.classList.remove('speaking');
  if (btnEnter) btnEnter.classList.add('ready-pulse');
  if (skipHint) skipHint.style.opacity = '0';

  const cursor = document.querySelector('.type-cursor');
  if (cursor) cursor.remove();
}

function simulateAnonymousTerminal() {
  const terminalOut = document.getElementById('anon-terminal-output');
  if (!terminalOut) return;

  if (anonTerminalInterval) {
    clearInterval(anonTerminalInterval);
    anonTerminalInterval = null;
  }

  anonLogIndex = 0;

  function appendNextLog() {
    if (!terminalOut) return;
    const logItem = HACKER_TERMINAL_LOGS[anonLogIndex];
    anonLogIndex = (anonLogIndex + 1) % HACKER_TERMINAL_LOGS.length;

    const lineEl = document.createElement('div');
    lineEl.className = 'term-log-line ' + (logItem.cls || '');
    lineEl.textContent = '> ' + logItem.text;
    terminalOut.appendChild(lineEl);

    // Mantener las últimas 60 líneas para fluidez máxima sin saturar el DOM
    while (terminalOut.children.length > 60) {
      terminalOut.removeChild(terminalOut.firstChild);
    }

    terminalOut.scrollTop = terminalOut.scrollHeight;
  }

  // Escribir ráfaga inicial y luego bucle continuo infinito
  setTimeout(appendNextLog, 300);
  setTimeout(appendNextLog, 650);
  setTimeout(appendNextLog, 1000);

  setTimeout(() => {
    if (!anonTerminalInterval) {
      anonTerminalInterval = setInterval(appendNextLog, 480);
    }
  }, 1100);
}

function openHostDashboardFromHack() {
  finishAnonTypewriter(true);
  if (anonAudio1) {
    try { anonAudio1.pause(); } catch (e) {}
    anonAudio1 = null;
  }
  if (anonAudio2) {
    try { anonAudio2.pause(); } catch (e) {}
    anonAudio2 = null;
  }

  const hackScreen = document.getElementById('hack-takeover-screen');
  const dashScreen = document.getElementById('host-dashboard-screen');

  if (hackScreen) hackScreen.classList.add('hidden');
  if (dashScreen) dashScreen.classList.remove('hidden');

  // Iniciar la cuenta atrás automáticamente al entrar al dashboard
  startMissionTimer();

  logTerminalEvent('Monitorización activada. Equipos convocados para neutralizar la amenaza.', 'log-sys');
}
