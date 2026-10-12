// ================================================================
//  STANDALONE - presentation.js
//  Diapositivas y animación inicial del hackeo de Anonymous
// ================================================================

let currentSlide = 1;
const totalSlides = 4;

function goToSlide(n) {
  if (isHackingActive) return;
  if (n < 1 || n > totalSlides) return;
  currentSlide = n;
  updateSlideDisplay();
}

function nextSlide() {
  if (isHackingActive) return;
  if (currentSlide < totalSlides) {
    currentSlide++;
    updateSlideDisplay();
  }
}

function prevSlide() {
  if (isHackingActive) return;
  if (currentSlide > 1) {
    currentSlide--;
    updateSlideDisplay();
  }
}

function updateSlideDisplay() {
  document.querySelectorAll('.slide-card').forEach((card) => {
    const num = parseInt(card.getAttribute('data-slide'));
    card.classList.toggle('active', num === currentSlide);
  });

  const counterEl = document.getElementById('current-slide-num');
  if (counterEl) counterEl.textContent = currentSlide;

  const dots = document.querySelectorAll('.slide-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx + 1 === currentSlide);
  });

  const btnPrev = document.getElementById('btn-slide-prev');
  const btnNext = document.getElementById('btn-slide-next');
  if (btnPrev) btnPrev.disabled = currentSlide === 1;
  if (btnNext) btnNext.disabled = currentSlide === totalSlides;
}

function triggerHackAnimation() {
  if (isHackingActive) return;
  isHackingActive = true;

  document.body.classList.remove('in-formal-presentation');
  document.body.classList.add('hacked-mode');

  initAudio();
  playHackGlitchSound();

  const presSlide = document.getElementById('main-slide');
  if (presSlide) presSlide.classList.add('glitching');
  const activeSlide = document.querySelector('.slide-card.active');
  if (activeSlide) activeSlide.classList.add('glitching');

  setTimeout(() => {
    const presScreen = document.getElementById('presentation-screen');
    const hackScreen = document.getElementById('hack-takeover-screen');

    if (presScreen) presScreen.classList.add('hidden');
    if (hackScreen) hackScreen.classList.remove('hidden');

    currentScreen = 'hack-takeover-screen';
    playSirenAlarm();
    setTimeout(playAIVoice, 600);
    simulateAnonymousTerminal();
  }, 1300);
}

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

    while (terminalOut.children.length > 60) {
      terminalOut.removeChild(terminalOut.firstChild);
    }

    terminalOut.scrollTop = terminalOut.scrollHeight;
  }

  setTimeout(appendNextLog, 300);
  setTimeout(appendNextLog, 650);
  setTimeout(appendNextLog, 1000);

  setTimeout(() => {
    if (!anonTerminalInterval) {
      anonTerminalInterval = setInterval(appendNextLog, 480);
    }
  }, 1100);
}

function openIntroFromHack() {
  showScreen('intro-screen');
  startAmbientDrone();
  startRandomGlitches();
  if (!terminalReady) {
    setTimeout(typeTerminal, 400);
  }
}
