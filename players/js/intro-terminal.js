// ================================================================
//  PLAYERS - intro-terminal.js
//  Fondo de código y simulación de la terminal de cifrado inicial
// ================================================================

const codeSnippets = [
  'ACCESS DENIED', 'SEGFAULT', 'stack overflow', 'KERNEL PANIC',
  'buffer overflow', 'ENCRYPTION_FAIL', 'chmod 777', 'sudo rm -rf',
  'SELECT * FROM users', 'nmap -sV', 'ssh root@', 'nc -lvp 4444',
  'SHELL_EXEC', 'PAYLOAD_INJECTED', 'XSS_DETECTED', 'SQL_INJECTION',
  'FIREWALL_BYPASSED', 'root@0x4A2F', 'metasploit', 'CVE-2024-',
  'BRUTE_FORCE', 'hashcat -a 0', 'john --wordlist', 'MITM_ATTACK'
];

function buildBgCode() {
  const el = document.getElementById('bg-code-text');
  if (!el) return;
  let html = '';
  for (let i = 0; i < 300; i++) {
    const word = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    html += word + ' ';
  }
  el.textContent = html;
}
buildBgCode();

const ENCRYPT_FILES = [
  'notas-examen-final-v7.xlsx',
  'apuntes-matematicas-T3.pdf',
  'examenes-parciales-2025.docx',
  'calificaciones-clase-4B.xlsx',
  'trabajos-entregados-abril.zip',
  'notas-fisica-quimica.pdf',
  'control-lengua-castellana.docx',
  'pruebas-acceso-universidad.pdf',
  'passwords-profesores.txt',
  'horarios-examenes-finales.xlsx',
  'notas-historia-mundial.docx',
  'registro-alumnos-2025-26.db',
  'backup-sistema-centro.tar.gz',
  'claves-sistema-SECRETISIMO.txt',
];

let terminalReady = false;
let fileIndex = 0;
let terminalProgressInterval = null;
let terminalTimeout = null;

function typeTerminal() {
  const cmd = 'encrypt --target=/srv/school --key=AI_MASTER_v4 --all';
  const el = document.getElementById('term-typing-1');
  if (!el) return;
  let i = 0;
  const interval = setInterval(() => {
    if (i < cmd.length) {
      el.textContent += cmd[i++];
    } else {
      clearInterval(interval);
      terminalReady = true;
      setTimeout(() => startNextFile(), 500);
    }
  }, 38);
}

function stopTerminalEncryption() {
  if (terminalProgressInterval) {
    clearInterval(terminalProgressInterval);
    terminalProgressInterval = null;
  }
  if (terminalTimeout) {
    clearTimeout(terminalTimeout);
    terminalTimeout = null;
  }
}

function startNextFile() {
  if (currentScreen !== 'intro-screen') return;
  const wrapper = document.getElementById('term-progress-wrapper');
  const fill    = document.getElementById('progress-fill');
  const pct     = document.getElementById('progress-pct');
  const fname   = document.getElementById('term-filename');
  if (!wrapper || !fill || !pct || !fname) return;

  // Show wrapper the first time
  wrapper.style.display = 'block';

  // Set filename
  const file = ENCRYPT_FILES[fileIndex % ENCRYPT_FILES.length];
  fileIndex++;

  // Animate filename swap: fade out → change → fade in
  fname.style.opacity = '0';
  setTimeout(() => {
    fname.textContent = file;
    fname.style.opacity = '1';
  }, 180);

  // Reset bar
  fill.style.transition = 'none';
  fill.style.width = '0%';
  pct.textContent = '0%';

  // Animate progress 0 → 100
  let progress = 0;
  terminalProgressInterval = setInterval(() => {
    if (currentScreen !== 'intro-screen') {
      clearInterval(terminalProgressInterval);
      terminalProgressInterval = null;
      return;
    }

    // Speed: fast at start, slow near end for drama
    let step;
    if      (progress < 60)  step = 1.4;
    else if (progress < 80)  step = 0.7;
    else if (progress < 92)  step = 0.35;
    else if (progress < 99)  step = 0.12;
    else                     step = 0.04;

    progress = Math.min(100, progress + step);
    fill.style.width   = progress + '%';
    pct.textContent    = Math.floor(progress) + '%';

    if (progress >= 100) {
      clearInterval(terminalProgressInterval);
      terminalProgressInterval = null;
      // Brief pause at 100%, then next file
      if (currentScreen === 'intro-screen') {
        terminalTimeout = setTimeout(() => startNextFile(), 600);
      }
    }
  }, 30);
}

// Iniciar animación de la terminal tras 600ms
setTimeout(typeTerminal, 600);
