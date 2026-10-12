// ================================================================
//  STANDALONE - app.js
//  Punto de entrada de modo local, inicialización y atajos de teclado
// ================================================================

let appConfig = { nombreInstituto: 'IES Tecnológico', numeroEquipos: 5, claves: {} };

async function fetchRootConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      appConfig = await res.json();
      applyRootConfig(appConfig);
    }
  } catch(e) {}
}

function applyRootConfig(cfg) {
  if (!cfg) return;
  appConfig = cfg;
  const instEl = document.getElementById('hacker-msg-inst');
  if (instEl) instEl.textContent = cfg.nombreInstituto || 'vuestro instituto';
  const teamsEl = document.getElementById('hacker-msg-teams');
  if (teamsEl) teamsEl.textContent = `${cfg.numeroEquipos || 5} grupos`;
}

fetchRootConfig();

// Atajos de teclado generales para modo autónomo
document.addEventListener('keydown', (e) => {
  if (currentScreen === 'presentation-screen') {
    // Tecla 'H' o 'h': Disparador secreto del hackeo de Anonymous
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      triggerHackAnimation();
      return;
    }

    // Teclas estándar para una presentación formal
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    }
  } else if (currentScreen === 'hack-takeover-screen') {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      openIntroFromHack();
    }
  } else if (e.key === 'Escape' && currentScreen !== 'intro-screen' && currentScreen !== 'victory-screen') {
    showScreen('briefing-screen');
  }
});
