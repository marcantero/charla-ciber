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

  let phrase = customPhrase;
  let audioFile = customAudioFile;
  let title = '';
  let integrityPct = 100;

  if (stage === 1) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito1 && appConfig.mensajesDebilitamiento.hito1.frase) || "Sois más buenos de lo que pensaba, pero esto no ha terminado aún";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito1 && appConfig.mensajesDebilitamiento.hito1.audio) || "hacker_debil1.mp3";
    title = "[!] ANOMALÍA EN EL SERVIDOR // CIFRADO AGRIETADO [75%]";
    integrityPct = 75;
  } else if (stage === 2) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito2 && appConfig.mensajesDebilitamiento.hito2.frase) || "Parece que estabais escuchando en la charla. JAJAJA (risa malvada)";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito2 && appConfig.mensajesDebilitamiento.hito2.audio) || "hacker_debil2.mp3";
    title = "[!!] ALERTA CRÍTICA: FISURA MASIVA EN EL NÚCLEO [40%]";
    integrityPct = 40;
  } else if (stage === 3) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.frase) || "Me habéis derrotado, pero esto no va acabar así, que sepáis que volveré.";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito3 && appConfig.mensajesDebilitamiento.hito3.audio) || "hacker_derrota.mp3";
    title = "[✓✓] ¡VICTORIA TOTAL! SISTEMA DEL INSTITUTO RESTAURADO [0%]";
    integrityPct = 0;
  }

  // Actualizar apariencia
  card.className = `weakening-card tech-frame stage-weakening-${stage}`;
  if (titleEl) titleEl.textContent = title;
  if (quoteEl) quoteEl.textContent = phrase;
  if (valEl) valEl.textContent = integrityPct === 0 ? '0% (NEUTRALIZADO)' : `${integrityPct}%`;
  if (fillEl) fillEl.style.width = `${integrityPct}%`;

  const twistPanel = document.getElementById('boss-twist-panel');
  const dismissBtn = document.getElementById('boss-defeat-dismiss-btn');
  const timerDesc = document.getElementById('weakening-timer-desc');

  if (stage === 3) {
    // Revelar panel épico de la carta del hacker y la FLAG
    if (twistPanel) twistPanel.classList.remove('hidden');
    if (dismissBtn) dismissBtn.classList.remove('hidden');
    if (timerDesc) timerDesc.textContent = 'MISIÓN CONCLUIDA // MANIFIESTO EN PANTALLA';

    // Desencadenar terremoto visual y flash crítico
    document.body.classList.remove('epic-boss-defeat-shake');
    void document.body.offsetWidth;
    document.body.classList.add('epic-boss-defeat-shake');

    const flash = document.createElement('div');
    flash.className = 'boss-critical-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 2000);
  } else {
    if (twistPanel) twistPanel.classList.add('hidden');
    if (dismissBtn) dismissBtn.classList.add('hidden');
    if (timerDesc) timerDesc.textContent = 'SE CERRARÁ AUTOMÁTICAMENTE';
  }

  overlay.classList.remove('hidden');

  // Reproducir audio personalizado o voz procedimental
  playHackerWeakeningAudio(audioFile, phrase, stage);

  // Registrar en terminal de eventos
  logTerminalEvent(`[!] INTERCEPTACIÓN: Anonymous se debilita (Fase ${stage}/3). Mensaje transmitido al aula.`, stage === 3 ? 'log-advance' : 'log-alert');

  // Barra de progreso y temporizador (en la fase 3 final se deja tiempo suficiente o manual)
  if (weakeningTimerId) clearTimeout(weakeningTimerId);
  const autoCloseDuration = stage === 3 ? 45000 : 7500; // 45s en etapa 3 para leer el manifiesto y la flag

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
  triggerHackerWeakening(stage);
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

  // Hito 3: amenaza reducida al 0% (victoria total)
  if (threatRemaining === 0 && !hackerMilestones.m3) {
    hackerMilestones.m1 = true;
    hackerMilestones.m2 = true;
    hackerMilestones.m3 = true;
    triggerHackerWeakening(3);
    return;
  }
}
