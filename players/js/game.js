// ================================================================
//  PLAYERS - game.js
//  Fases del juego, respuestas, validación, transiciones y victoria
// ================================================================

const PHASES = [
  { num: '01', name: 'RETO 01',  desc: 'Accediendo al subsistema de frecuencias...',   tool: 'Frecuencias'         },
  { num: '02', name: 'RETO 02',  desc: 'Explorando archivos ocultos del servidor...',  tool: 'Servidor Central'    },
  { num: '03', name: 'RETO 03',  desc: 'Extrayendo metadatos e información oculta...', tool: 'Análisis Forense'    },
  { num: '04', name: 'RETO 04',  desc: 'Descifrando función de encriptación...',      tool: 'Criptografía'        },
  { num: '05', name: 'RETO 05',  desc: 'Combinando secuencias de desbloqueo final...', tool: 'Terminal Principal' },
];

// Respuestas por defecto (insensible a mayúsculas/minúsculas)
const ANSWERS = {
  1: 'FLAG{127.0.0.1}',       // Audio clue answer (IP format)
  2: 'ALFA-7743',            // Terminal directory
  3: 'W3HY4_H0I1K1H4I4',     // Encrypted password in metadata
  4: 'R3CT4_C0D1F1C4D4',     // Decrypted image password
  5: 'FLAG{S1ST3M4_V1L4_R3CUP3R4D0_2026}' // Final shared flag
};

const CORRECT_MSG = [
  '// ACCESO CONCEDIDO — Fase superada correctamente',
  '// CÓDIGO VERIFICADO — Continuad',
  '// AUTENTICACIÓN OK — Excelente trabajo',
  '// SECUENCIA CORRECTA — Sistema parcialmente recuperado',
  '// DESCIFRADO COMPLETO — SISTEMAS RESTAURADOS'
];
const WRONG_MSG = [
  '// ACCESO DENEGADO — Volved a intentarlo',
  '// CÓDIGO INVÁLIDO — Revisad la pista',
  '// ERROR DE AUTENTICACIÓN — Volved a probar',
  '// SECUENCIA INCORRECTA — Hablad con el grupo',
  '// FALLO CRÍTICO — La secuencia no es correcta'
];

let collectedCodes = {};
let currentScreen = 'intro-screen';

function showScreen(id) {
  if (id !== 'intro-screen') {
    stopTerminalEncryption();
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.remove('hidden');
    currentScreen = id;
  }
}

function startMission() {
  stopTerminalEncryption();
  showScreen('briefing-screen');
}

function startPhase(num) {
  runTransition(num, () => {
    showScreen('phase-' + num + '-screen');
    updatePhaseDots(num);
  });
}

function updatePhaseDots(activeNum) {
  document.querySelectorAll('.phase-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i + 1 < activeNum) dot.classList.add('done');
    else if (i + 1 === activeNum) dot.classList.add('active');
  });
}

function runTransition(phaseNum, callback) {
  const phase = PHASES[phaseNum - 1];
  document.getElementById('trans-num').textContent = phase.num;
  document.getElementById('trans-name').textContent = phase.name;
  document.getElementById('trans-desc').textContent = phase.desc;

  const barFill = document.getElementById('trans-bar-fill');
  const pct = document.getElementById('trans-pct');
  barFill.style.width = '0%';
  pct.textContent = '0%';

  showScreen('transition-screen');
  playWhoosh();

  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    barFill.style.width = progress + '%';
    pct.textContent = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(callback, 200);
    }
  }, 25);
}

function checkAnswer(phaseNum) {
  const input = document.getElementById('ans-' + phaseNum);
  const feedback = document.getElementById('feedback-' + phaseNum);
  if (!input || !feedback) return;

  const userAnswer = input.value.trim().toUpperCase();
  const correctAnswer = String(ANSWERS[phaseNum]).toUpperCase();

  const cleanUser = userAnswer.replace(/[\s\-_]/g, '');
  const cleanCorrect = correctAnswer.replace(/[\s\-_]/g, '');
  let isMatch = (userAnswer === correctAnswer) || (cleanUser === cleanCorrect);

  if (phaseNum === 5) {
    const SHARED_FINAL = 'FLAG{S1ST3M4_V1L4_R3CUP3R4D0_2026}';
    const cleanFinal = SHARED_FINAL.replace(/[\s\-_{}]/g, '');
    const cleanUserNoBraces = userAnswer.replace(/[\s\-_{}]/g, '');
    if (userAnswer === SHARED_FINAL || cleanUserNoBraces === cleanFinal || cleanUserNoBraces.includes('S1ST3M4V1L4R3CUP3R4D02026')) {
      isMatch = true;
    }
  }

  if (isMatch) {
    playSuccess();
    feedback.textContent = CORRECT_MSG[phaseNum - 1];
    feedback.className = 'answer-feedback correct';
    collectedCodes[phaseNum] = ANSWERS[phaseNum];

    // [MULTIJUGADOR] Emitir evento al servidor y al Host
    if (typeof sendPlayerPhaseAdvance === 'function') {
      sendPlayerPhaseAdvance(phaseNum);
    } else if (typeof socket !== 'undefined' && socket && socket.connected) {
      socket.emit('player:phase_complete', {
        teamId: currentTeamId,
        teamName: currentTeamName,
        phase: phaseNum,
        fase_completada: phaseNum,
        timestamp: Date.now()
      });
      console.log(`[MULTIJUGADOR] Fase ${phaseNum} emitida para ${currentTeamName}`);
    }

    // Actualizar estado en la tabla de misiones
    const row = document.getElementById('row-' + phaseNum);
    if (row) {
      const statusEl = row.querySelector('.ph-status');
      if (statusEl) {
        statusEl.textContent = '[ COMPLETADO ]';
        statusEl.className = 'ph-col ph-status status-done';
      }
    }

    // Actualizar códigos descubiertos para el clímax final
    const codeDisplay = document.getElementById('col-code-' + phaseNum);
    if (codeDisplay) {
      codeDisplay.textContent = ANSWERS[phaseNum];
      codeDisplay.classList.add('revealed');
    }

    // Avanzar automáticamente tras pausa (salvo la fase 5 final)
    if (phaseNum < 5) {
      input.disabled = true;
      setTimeout(() => {
        if (phaseNum === 4) {
          startPhase(5);
        } else {
          startPhase(phaseNum + 1);
        }
      }, 2000);
    } else {
      // VICTORIA FINAL
      setTimeout(() => {
        showScreen('victory-screen');
        launchVictoryEffect();
      }, 1500);
    }
  } else {
    playError();
    feedback.textContent = WRONG_MSG[phaseNum - 1];
    feedback.className = 'answer-feedback wrong';
    input.style.borderColor = '#cc1122';
    input.style.animation = 'none';
    setTimeout(() => {
      input.style.borderColor = '';
    }, 1500);
  }
}

function launchVictoryEffect() {
  if (audioCtx && !isMuted) {
    const notes = [261, 329, 392, 523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const t = audioCtx.currentTime + i * 0.08;
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(g); mix(g);
      osc.start(t); osc.stop(t + 0.65);
    });
  }
  // Destello verde en la lluvia matrix
  if (typeof mCtx !== 'undefined' && mCtx) {
    let flashCount = 0;
    const flashInterval = setInterval(() => {
      flashCount++;
      mCtx.fillStyle = flashCount % 2 === 0 ? '#00ff66' : '#0a0608';
      if (flashCount > 6) {
        clearInterval(flashInterval);
        mCtx.fillStyle = '#00ff66';
      }
    }, 150);
  }
}

// Permitir presionar Enter en los campos de entrada
document.querySelectorAll('.hack-input').forEach((input, i) => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const phaseNum = i + 1;
      checkAnswer(phaseNum);
    }
  });
});

// Tecla ESC para volver al briefing
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentScreen !== 'intro-screen' && currentScreen !== 'victory-screen') {
    showScreen('briefing-screen');
  }
});

// ================================================================
// RETO 5: Fragmentos de script por equipo y ejecución interactiva
// ================================================================
const TEAM_FRAGMENTS = {
  1: 'FLAG{',
  2: 'S1ST3M4_',
  3: 'V1L4_',
  4: 'R3CUP3R4D0_',
  5: '2026}',
  6: 'IES_',
  7: 'CIBER_',
  8: '2026}'
};

let scriptRunning = false;

function runTeamScript() {
  if (scriptRunning) return;
  scriptRunning = true;
  const term = document.getElementById('script-terminal-body');
  if (!term) return;

  const teamId = (typeof currentTeamId !== 'undefined' && currentTeamId) ? currentTeamId : 1;
  const fragment = TEAM_FRAGMENTS[teamId] || 'FLAG{';

  term.innerHTML = `<div class="fterm-line"><span class="fterm-prompt">$</span> python3 script_nodo.py</div>`;

  const steps = [
    { text: '> [1/3] Conectando con cortafuegos del instituto... [OK]', cls: 'fterm-result', delay: 350 },
    { text: `> [2/3] Identificando firma de seguridad del Equipo 0${teamId}...`, cls: 'fterm-result', delay: 700 },
    { text: '> [3/3] Desencriptando bloque cifrado del nodo...', cls: 'fterm-result', delay: 1050 },
    { text: `> ============================================================`, cls: 'fterm-result', delay: 1350 },
    { text: `> [✓] TU FRAGMENTO DE FLAG: <span style="color:#00ff88; font-weight:bold; font-size:1.15em; background:rgba(0,255,136,0.12); padding:3px 8px; border:1px solid #00ff88; border-radius:3px;">${fragment}</span>`, cls: 'fterm-key', delay: 1600 },
    { text: `> ============================================================`, cls: 'fterm-result', delay: 1800 },
    { text: `> 💡 ¡Pon en común este fragmento con el resto de grupos de la clase para parar al hacker!`, cls: 'fterm-hidden', delay: 2000 }
  ];

  steps.forEach(item => {
    setTimeout(() => {
      const lineEl = document.createElement('div');
      lineEl.className = 'fterm-line ' + (item.cls || '');
      lineEl.innerHTML = item.text;
      term.appendChild(lineEl);
      term.scrollTop = term.scrollHeight;
    }, item.delay);
  });

  setTimeout(() => {
    scriptRunning = false;
    const fragDisplay = document.getElementById(`frag-display-${teamId}`);
    if (fragDisplay) {
      fragDisplay.textContent = fragment;
      fragDisplay.classList.add('revealed');
      fragDisplay.style.color = '#00ff88';
      fragDisplay.style.borderColor = '#00ff88';
    }
  }, 2200);
}

function downloadScriptFile() {
  const teamId = (typeof currentTeamId !== 'undefined' && currentTeamId) ? currentTeamId : 1;
  const fragment = TEAM_FRAGMENTS[teamId] || 'FLAG{';
  const pyCode = `#!/usr/bin/env python3
# ============================================================
# ESCAPE ROOM CIBERSEGURIDAD - SCRIPT DE NODO (EQUIPO ${teamId})
# ============================================================
import time

print("[+] Conectando al cortafuegos central del instituto...")
time.sleep(0.8)
print("[+] Desencriptando bloque cifrado del Equipo ${teamId}...")
time.sleep(0.8)
print("\\n============================================================")
print(" [✓] TU FRAGMENTO DE LA FLAG:  ${fragment}")
print("============================================================\\n")
print("[*] Pon este fragmento en común con los demás grupos de la clase.")
print("[*] Juntos formad la flag completa para detener al hacker.")
`;
  const blob = new Blob([pyCode], { type: 'text/x-python' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `script_nodo_${teamId}.py`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
