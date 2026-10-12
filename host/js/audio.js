// ================================================================
//  HOST - audio.js
//  Motor de audio sintetizado, Web Audio API y efectos para el Host
// ================================================================

let isMuted = false;
let audioCtx = null;
let sirenInterval = null;
let weakeningTimerId = null;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio no disponible:', e);
  }
}

// Helper para probar rutas candidatas (/audio/hacker y /audio/, .wav y .mp3)
function tryPlayCandidates(candidates, onFail, onEnd) {
  let idx = 0;
  function next() {
    if (idx >= candidates.length) {
      if (onFail) onFail();
      return;
    }
    const path = candidates[idx++];
    const sound = new Audio(path);
    sound.play().then(() => {
      console.log(`[AUDIO] Reproduciendo archivo: ${path}`);
      if (onEnd) sound.onended = onEnd;
    }).catch(() => {
      next();
    });
  }
  next();
}

// Helper sincronizado: reproduce y devuelve el elemento Audio (o null si falla) para sincronización precisa
function tryPlayAudioWithSync(candidates, onStart, onFail, onEnd) {
  let idx = 0;
  function next() {
    if (idx >= candidates.length) {
      if (onFail) onFail();
      return;
    }
    const path = candidates[idx++];
    const sound = new Audio(path);
    sound.play().then(() => {
      console.log(`[AUDIO SYNC] Reproduciendo archivo sincronizado: ${path}`);
      if (onStart) onStart(sound);
      if (onEnd) sound.onended = () => onEnd(sound);
    }).catch(() => {
      next();
    });
  }
  next();
}

// 1.1 Glitch de interferencia eléctrica inicial
function playHackGlitchSound() {
  initAudio();
  if (isMuted) return;

  const candidates = [
    '/audio/hacker/hack_glitch.mp3',
    '/audio/hack_glitch.mp3',
    '/audio/hacker/hack_glitch.wav',
    '/audio/hack_glitch.wav'
  ];

  tryPlayCandidates(candidates, () => {
    // Fallback: Sintetizador procedural Web Audio API de cortocircuito
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Ruido blanco filtrado (estática CRT)
    const dur = 1.2;
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.7;

    const noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = buf;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + dur);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noiseSrc.start(now);

    // Tono digital chirriante
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.8);
    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  });
}

// 1.2 Sirena de alarma de brecha de seguridad
function playSirenAlarm() {
  initAudio();
  if (isMuted) return;

  const candidates = [
    '/audio/hacker/siren_alarm.mp3',
    '/audio/siren_alarm.mp3',
    '/audio/hacker/siren_alarm.wav',
    '/audio/siren_alarm.wav'
  ];

  tryPlayCandidates(candidates, () => {
    // Fallback: Sirena de alarma sintetizada
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.6);
    osc.frequency.linearRampToValueAtTime(650, now + 1.2);
    osc.frequency.linearRampToValueAtTime(950, now + 1.8);
    osc.frequency.linearRampToValueAtTime(650, now + 2.4);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 2.6);
  });
}

// 1.3 Voz distorsionada del Anónimo / IA
function playAIVoice() {
  if (typeof startInitialHackTypewriter === 'function') {
    startInitialHackTypewriter();
    return;
  }
  initAudio();

  // 1. Generador de graves misteriosos y zumbido de fondo
  if (audioCtx && !isMuted) {
    const now = audioCtx.currentTime;
    
    // Subgraves de tensión (50Hz y 100Hz)
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(52, now);
    osc1.frequency.exponentialRampToValueAtTime(36, now + 5.0);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(104, now);
    osc2.frequency.exponentialRampToValueAtTime(72, now + 5.0);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.value = 6;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 5.8);
    osc2.stop(now + 5.8);
  }

  // 2. Reproducir secuencia de introducción: audio-hacker-inicio.mp3 y después audio-hacker-inicio2.mp3
  const part1Candidates = [
    '/audio/hacker/audio-hacker-inicio.mp3',
    '/audio/audio-hacker-inicio.mp3'
  ];

  const part2Candidates = [
    '/audio/hacker/audio-hacker-inicio2.mp3',
    '/audio/audio-hacker-inicio2.mp3'
  ];

  function playIntroPart2() {
    tryPlayCandidates(part2Candidates, () => {
      console.log('[AUDIO] Parte 2 de intro no encontrada.');
    });
  }

  tryPlayCandidates(
    part1Candidates,
    () => {
      // Si no está audio-hacker-inicio.mp3, probar si está directamente audio-hacker-inicio2.mp3 o anon_voice.mp3
      const fallbackCandidates = [
        '/audio/hacker/audio-hacker-inicio2.mp3',
        '/audio/audio-hacker-inicio2.mp3',
        '/audio/hacker/anon_voice.mp3',
        '/audio/anon_voice.mp3',
        '/audio/hacker/ai_voice.mp3',
        '/audio/ai_voice.mp3'
      ];
      tryPlayCandidates(fallbackCandidates, () => {
        // Fallback a SpeechSynthesis robótica demoníaca
        speakSynthesizedAnonymous();
      });
    },
    () => {
      // Al terminar la primera parte, encadenar automáticamente la segunda parte
      console.log('[AUDIO] Intro parte 1 terminada. Reproduciendo intro parte 2...');
      playIntroPart2();
    }
  );
}

function speakSynthesizedAnonymous() {
  if ('speechSynthesis' in window && !isMuted) {
    window.speechSynthesis.cancel();
    const inst = (appConfig && appConfig.nombreInstituto) ? appConfig.nombreInstituto : 'instituto';
    const numG = (appConfig && appConfig.numeroEquipos) ? appConfig.numeroEquipos : '5';
    const text = `Hola ${inst}, me he infiltrado en vuestro instituto, jajajajaja. Voy a cifrar todos vuestros datos. Pero para que esto sea más divertido voy a dejaros unos retos para que podáis pararme. Tendréis que hacer ${numG} grupos, con el objetivo de intentar pararme con todo lo que habéis aprendido en esta charla. Mucha suerte.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.pitch = 0.22; // Voz ultra grave y amenazante
    utterance.rate = 0.82;  // Ritmo pausado
    utterance.volume = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es'));
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);
  }
}

// 1.4 Sonido de avance de fase y victoria
function playAdvanceChime() {
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const freqs = [330, 440, 554, 659, 880];
  freqs.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const t = now + i * 0.06;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

function playVictoryFanfare() {
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;
  const chord = [261, 329, 392, 523, 659, 784, 1047];
  chord.forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const t = now + i * 0.07;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 1.0);
  });
}

// 1.5 Efectos sonoros y voz de debilitamiento del hacker
function playWeakeningSoundFX(stage) {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  if (stage === 1) {
    // Ruido eléctrico + zumbido descendente de desestabilización
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.8);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  } else if (stage === 2) {
    // Alarma disonante triple + chispazo de distorsión
    [320, 480, 240].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const t = now + idx * 0.12;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.5);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  } else if (stage === 3) {
    // 1. Terremoto sonoro y colapso masivo de la IA
    const subOsc = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(28, now + 1.8);
    subGain.gain.setValueAtTime(0.4, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
    subOsc.connect(subGain);
    subGain.connect(audioCtx.destination);
    subOsc.start(now);
    subOsc.stop(now + 2.0);

    // 2. Chispazo electrónico / cortocircuito de sobrecarga
    const nSz = Math.floor(audioCtx.sampleRate * 1.2);
    const nBuf = audioCtx.createBuffer(1, nSz, audioCtx.sampleRate);
    const nD = nBuf.getChannelData(0);
    for (let i = 0; i < nSz; i++) nD[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nSz, 1.5);
    const nSrc = audioCtx.createBufferSource();
    nSrc.buffer = nBuf;
    const nFilt = audioCtx.createBiquadFilter();
    nFilt.type = 'lowpass';
    nFilt.frequency.setValueAtTime(3500, now);
    nFilt.frequency.exponentialRampToValueAtTime(200, now + 1.2);
    const nGain = audioCtx.createGain();
    nGain.gain.setValueAtTime(0.3, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    nSrc.connect(nFilt);
    nFilt.connect(nGain);
    nGain.connect(audioCtx.destination);
    nSrc.start(now);

    // 3. Fanfarria de victoria triunfal (tras 1.2s de impacto inicial)
    setTimeout(() => {
      playVictoryFanfare();
    }, 1200);
  }
}

function playHackerWeakeningAudio(audioFileName, speechText, stage) {
  if (isMuted) return;
  initAudio();

  // 1. Efecto sonoro de impacto procedural
  playWeakeningSoundFX(stage);

  // Activar animación del ecualizador
  const eqWidget = document.getElementById('weakening-audio-freq');
  if (eqWidget) eqWidget.classList.add('playing');

  // 2. Intentar cargar archivo de audio de /audio/hacker/ o /audio/
  const baseName = (audioFileName || '').replace(/\.(mp3|wav|ogg)$/i, '');
  const candidates = [];
  if (audioFileName) {
    candidates.push(`/audio/hacker/${audioFileName}`, `/audio/${audioFileName}`);
  }
  if (baseName) {
    candidates.push(
      `/audio/hacker/${baseName}.mp3`,
      `/audio/${baseName}.mp3`,
      `/audio/hacker/${baseName}.wav`,
      `/audio/${baseName}.wav`
    );
  }

  tryPlayCandidates(candidates, () => {
    console.log(`[AUDIO] ${audioFileName} no encontrado, usando síntesis de voz procedimental.`);
    // 3. Fallback a voz sintetizada con tono de villano y risa malvada
    speakHackerPhrase(speechText, stage, () => {
      if (eqWidget) eqWidget.classList.remove('playing');
    });
  }, () => {
    if (eqWidget) eqWidget.classList.remove('playing');
  });
}

function speakHackerPhrase(text, stage, onEndCallback) {
  if (!('speechSynthesis' in window) || isMuted) {
    if (onEndCallback) onEndCallback();
    return;
  }
  window.speechSynthesis.cancel();

  // Convertir marcas como "(risa malvada)" en onomatopeyas legibles para el sintetizador
  let spokenText = text.replace(/\(risa malvada\)/gi, 'jajajajajaja!');
  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = 'es-ES';

  if (stage === 1) {
    utterance.pitch = 0.35; // Grave y amenazante
    utterance.rate = 0.85;
  } else if (stage === 2) {
    utterance.pitch = 0.28; // Tono más inestable y burlón
    utterance.rate = 0.88;
  } else {
    utterance.pitch = 0.22; // Debilitado, colapso final
    utterance.rate = 0.78;
  }
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v => v.lang.startsWith('es'));
  if (esVoice) utterance.voice = esVoice;

  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };
  utterance.onerror = () => {
    if (onEndCallback) onEndCallback();
  };

  window.speechSynthesis.speak(utterance);
}

function toggleMute() {
  isMuted = !isMuted;
  const icon = document.getElementById('mute-icon');
  if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Clic mecánico de tecleo para la terminal cinematográfica
function playKeyClick() {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2200 + Math.random() * 400, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}

// Fanfarria triunfal sintética para la revelación de la FLAG final
function playVictoryFanfare() {
  initAudio();
  if (!audioCtx || isMuted) return;
  const now = audioCtx.currentTime;

  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 acorde brillante
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const startTime = now + idx * 0.12;
    const dur = 1.4;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.1);
  });
}

