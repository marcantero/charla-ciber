// ================================================================
//  HOST - weakening.js
//  Efectos, diálogo y hitos de debilitamiento del Hacker
// ================================================================

let hackerMilestones = {
  m1: false, // <= 75%
  m2: false, // <= 40%
  m3: false  // === 0%
};
let currentWeakeningStage = 0;
let testStageCounter = 1;

function triggerHackerWeakening(stage, customPhrase, customAudioFile) {
  const overlay = document.getElementById('hacker-weakening-overlay');
  const card = document.getElementById('weakening-card');
  const titleEl = document.getElementById('weakening-status-title');
  const quoteEl = document.getElementById('weakening-dialogue-text');
  const valEl = document.getElementById('weakening-integrity-val');
  const fillEl = document.getElementById('weakening-meter-fill');
  const timerFill = document.getElementById('weakening-timer-fill');

  if (!overlay || !card) return;

  currentWeakeningStage = stage;

  // Si se alcanza el hito 3 (derrota final / 0% amenaza), lanzar la cinemática épica
  if (stage === 3 && typeof triggerBossCinematic === 'function') {
    triggerBossCinematic();
    return;
  }

  let phrase = customPhrase;
  let audioFile = customAudioFile;
  let title = '';
  let integrityPct = 100;

  if (stage === 1) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito1 && appConfig.mensajesDebilitamiento.hito1.frase) || "Sois más buenos de lo que pensaba, pero esto no ha terminado aún";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito1 && appConfig.mensajesDebilitamiento.hito1.audio) || "audio-hacker-1.mp3";
    title = "[!] ANOMALÍA EN EL SERVIDOR // CIFRADO AGRIETADO [75%]";
    integrityPct = 75;
  } else if (stage === 2) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito2 && appConfig.mensajesDebilitamiento.hito2.frase) || "Parece que estabais escuchando en la charla. JAJAJA (risa malvada)";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito2 && appConfig.mensajesDebilitamiento.hito2.audio) || "audio-hacker-2.mp3";
    title = "[!!] ALERTA CRÍTICA: FISURA MASIVA EN EL NÚCLEO [40%]";
    integrityPct = 40;
  }

  // Actualizar apariencia
  card.className = `weakening-card tech-frame stage-weakening-${stage}`;
  if (titleEl) titleEl.textContent = title;
  if (quoteEl) quoteEl.textContent = phrase;
  if (valEl) valEl.textContent = `${integrityPct}%`;
  if (fillEl) fillEl.style.width = `${integrityPct}%`;

  const twistPanel = document.getElementById('boss-twist-panel');
  const dismissBtn = document.getElementById('boss-defeat-dismiss-btn');
  const timerDesc = document.getElementById('weakening-timer-desc');

  if (twistPanel) twistPanel.classList.add('hidden');
  if (dismissBtn) dismissBtn.classList.add('hidden');
  if (timerDesc) timerDesc.textContent = 'SE CERRARÁ AUTOMÁTICAMENTE';

  overlay.classList.remove('hidden');

  // Reproducir audio personalizado o voz procedimental
  playHackerWeakeningAudio(audioFile, phrase, stage);

  // Registrar en terminal de eventos
  logTerminalEvent(`[!] INTERCEPTACIÓN: Anonymous se debilita (Fase ${stage}/3). Mensaje transmitido al aula.`, 'log-alert');

  // Barra de progreso y temporizador
  if (weakeningTimerId) clearTimeout(weakeningTimerId);
  const autoCloseDuration = 7500;

  if (timerFill) {
    timerFill.style.transition = 'none';
    timerFill.style.transform = 'scaleX(1)';
    void timerFill.offsetWidth;
    timerFill.style.transition = `transform ${autoCloseDuration / 1000}s linear`;
    timerFill.style.transform = 'scaleX(0)';
  }

  weakeningTimerId = setTimeout(() => {
    closeWeakeningOverlay();
  }, autoCloseDuration);
}

function closeWeakeningOverlay() {
  const overlay = document.getElementById('hacker-weakening-overlay');
  if (overlay) overlay.classList.add('hidden');
  if (weakeningTimerId) clearTimeout(weakeningTimerId);
  const eqWidget = document.getElementById('weakening-audio-freq');
  if (eqWidget) eqWidget.classList.remove('playing');
  document.body.classList.remove('epic-boss-defeat-shake');
}

function previewWeakeningSequence(specificStage) {
  const stage = specificStage || testStageCounter;
  if (stage === 3 && typeof triggerBossCinematic === 'function') {
    triggerBossCinematic();
  } else {
    triggerHackerWeakening(stage);
  }
  testStageCounter = (testStageCounter % 3) + 1;
}

function checkThreatMilestones(threatRemaining, totalSolved) {
  // Disparar solo una vez por hito si ya se ha resuelto alguna fase
  if (totalSolved === 0) return;

  // Hito 1: amenazada reducida a 75% o menos
  if (threatRemaining <= 75 && threatRemaining > 40 && !hackerMilestones.m1) {
    hackerMilestones.m1 = true;
    triggerHackerWeakening(1);
    return;
  }

  // Hito 2: amenaza reducida a 40% o menos
  if (threatRemaining <= 40 && threatRemaining > 0 && !hackerMilestones.m2) {
    hackerMilestones.m1 = true;
    hackerMilestones.m2 = true;
    triggerHackerWeakening(2);
    return;
  }

  // Hito 3: amenaza reducida al 0% (victoria total -> Cinemática Épica de Derrota)
  if (threatRemaining === 0 && !hackerMilestones.m3) {
    hackerMilestones.m1 = true;
    hackerMilestones.m2 = true;
    hackerMilestones.m3 = true;
    if (typeof triggerBossCinematic === 'function') {
      triggerBossCinematic();
    } else {
      triggerHackerWeakening(3);
    }
    return;
  }
}
