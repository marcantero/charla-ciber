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

let countdownAnimFrame = null;

function animateNumberCountdown(el, fromVal, toVal, duration = 1000) {
  if (!el) return;
  const startTime = performance.now();
  el.classList.add('pct-animating');

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Ease-out cúbico para desaceleración dramática hacia el valor final
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(fromVal + (toVal - fromVal) * eased);
    el.textContent = `${current}%`;

    if (progress < 1) {
      countdownAnimFrame = requestAnimationFrame(step);
    } else {
      el.textContent = `${toVal}%`;
      el.classList.remove('pct-animating');
      el.classList.add('pct-hit-punch');
      setTimeout(() => el.classList.remove('pct-hit-punch'), 700);
    }
  }
  if (countdownAnimFrame) cancelAnimationFrame(countdownAnimFrame);
  countdownAnimFrame = requestAnimationFrame(step);
}

function triggerHackerWeakening(stage, customPhrase, customAudioFile) {
  const overlay = document.getElementById('hacker-weakening-overlay');
  const card = document.getElementById('weakening-card');
  const titleEl = document.getElementById('weakening-status-title');
  const quoteEl = document.getElementById('weakening-dialogue-text');
  const valEl = document.getElementById('weakening-integrity-val');
  const fillEl = document.getElementById('weakening-meter-fill');
  const timerFill = document.getElementById('weakening-timer-fill');

  // Elementos de protagonismo del porcentaje
  const headerPctEl = document.getElementById('weakening-header-pct');
  const bannerPctEl = document.getElementById('weakening-banner-pct');
  const bannerFillEl = document.getElementById('weakening-banner-fill');
  const damageStatEl = document.getElementById('weakening-damage-stat');
  const vulnStatEl = document.getElementById('weakening-vuln-stat');
  const phaseNumEl = document.getElementById('weakening-phase-num');
  const threatKickerEl = document.getElementById('weakening-threat-kicker');
  const subBadgeEl = document.getElementById('weakening-integrity-sub-badge');
  const defStatEl = document.getElementById('weakening-integrity-def-stat');
  const transChipEl = document.getElementById('weakening-trans-chip');

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
  let startPct = 100;
  let damageText = '';
  let vulnText = '';
  let phaseText = '';
  let kickerText = '';
  let subBadgeText = '';
  let defText = '';

  if (stage === 1) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito1 && appConfig.mensajesDebilitamiento.hito1.frase) || "Sois más buenos de lo que pensaba, pero esto no ha terminado aún";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito1 && appConfig.mensajesDebilitamiento.hito1.audio) || "audio-hacker-1.mp3";
    title = "[!] ANOMALÍA EN EL SERVIDOR // CIFRADO AGRIETADO";
    integrityPct = 75;
    startPct = 100;
    damageText = "-25% DAÑO INFLIGIDO";
    vulnText = "DEFENSA AGRIETADA (75% RESTANTE)";
    phaseText = "1 / 3";
    kickerText = "ESCUDOS COMPROMETIDOS // ATAQUE DE LOS EQUIPOS";
    subBadgeText = "⚡ ESTADO: AGRIETADO";
    defText = "-25% DEF";
  } else if (stage === 2) {
    phrase = phrase || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito2 && appConfig.mensajesDebilitamiento.hito2.frase) || "Parece que estabais escuchando en la charla. JAJAJA (risa malvada)";
    audioFile = audioFile || (appConfig.mensajesDebilitamiento && appConfig.mensajesDebilitamiento.hito2 && appConfig.mensajesDebilitamiento.hito2.audio) || "audio-hacker-2.mp3";
    title = "[!!] ALERTA CRÍTICA: FISURA MASIVA EN EL NÚCLEO";
    integrityPct = 40;
    startPct = 75;
    damageText = "-60% DAÑO TOTAL INFLIGIDO";
    vulnText = "¡COLAPSO INMINENTE! (40% RESTANTE)";
    phaseText = "2 / 3";
    kickerText = "SISTEMA ENEMIGO EN CRISIS // ALERTA CRÍTICA";
    subBadgeText = "⚠️ ESTADO: CRÍTICO";
    defText = "-60% DEF";
  }

  // Actualizar apariencia
  card.className = `weakening-card tech-frame stage-weakening-${stage}`;
  if (titleEl) titleEl.textContent = title;
  if (quoteEl) quoteEl.textContent = phrase;
  if (headerPctEl) headerPctEl.textContent = `${integrityPct}%`;
  if (damageStatEl) damageStatEl.textContent = damageText;
  if (vulnStatEl) vulnStatEl.textContent = vulnText;
  if (phaseNumEl) phaseNumEl.textContent = phaseText;
  if (threatKickerEl) threatKickerEl.textContent = kickerText;
  if (subBadgeEl) subBadgeEl.textContent = subBadgeText;
  if (defStatEl) defStatEl.textContent = defText;
  if (transChipEl) transChipEl.textContent = `[ AMENAZA REDUCIDA AL ${integrityPct}% ]`;

  // Animación del medidor: inicia en el porcentaje previo y desciende con dramatismo
  if (fillEl) {
    fillEl.style.transition = 'none';
    fillEl.style.width = `${startPct}%`;
    void fillEl.offsetWidth;
    fillEl.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    fillEl.style.width = `${integrityPct}%`;
  }
  if (bannerFillEl) {
    bannerFillEl.style.transition = 'none';
    bannerFillEl.style.width = `${startPct}%`;
    void bannerFillEl.offsetWidth;
    bannerFillEl.style.transition = 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    bannerFillEl.style.width = `${integrityPct}%`;
  }

  // Conteo numérico dinámico visible para la clase
  if (bannerPctEl) animateNumberCountdown(bannerPctEl, startPct, integrityPct, 1100);
  if (valEl) animateNumberCountdown(valEl, startPct, integrityPct, 1100);

  const timerDesc = document.getElementById('weakening-timer-desc');
  if (timerDesc) timerDesc.textContent = 'SE CERRARÁ AUTOMÁTICAMENTE';

  overlay.classList.remove('hidden');

  // Reproducir audio personalizado o voz procedimental
  playHackerWeakeningAudio(audioFile, phrase, stage);

  // Registrar en terminal de eventos
  logTerminalEvent(`[!] INTERCEPTACIÓN: Anonymous se debilita (Fase ${stage}/3 // Queda ${integrityPct}%). Mensaje transmitido al aula.`, 'log-alert');

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
