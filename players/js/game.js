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
  3: 'BETA-4491',            // Encrypted password in metadata
  4: 'R3CT4_C0D1F1C4D4',     // Decrypted image password
  5: 'FLAG{127.0.0.1}-ALFA-7743-BETA-4491-R3CT4_C0D1F1C4D4' // Final combination
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
  const isMatch = (userAnswer === correctAnswer) || (cleanUser === cleanCorrect);

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
