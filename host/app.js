// ================================================================
//  HOST - app.js
//  Punto de entrada, configuración global y manejadores de eventos
// ================================================================

let appConfig = {
  nombreInstituto: 'IES Tecnológico',
  numeroEquipos: 5,
  claves: {}
};

async function fetchHostConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      applyConfigToHost(data);
    }
  } catch (e) {
    console.warn('Usando configuración local:', e);
  }
}

function applyConfigToHost(cfg) {
  if (!cfg) return;
  appConfig = cfg;
  
  // Actualizar nombre del instituto en los títulos
  document.querySelectorAll('.pres-brand-title').forEach(el => {
    el.textContent = cfg.nombreInstituto || 'IES TECNOLÓGICO';
  });

  // Actualizar mensaje de texto del hacker
  const instEl = document.getElementById('hacker-msg-inst');
  if (instEl) instEl.textContent = cfg.nombreInstituto || 'vuestro instituto';
  
  const teamsEl = document.getElementById('hacker-msg-teams');
  if (teamsEl) teamsEl.textContent = `${cfg.numeroEquipos || 5} grupos`;

  // Inicializar o sincronizar el temporizador de cuenta atrás configurable
  if (typeof syncMissionTimerConfig === 'function') {
    syncMissionTimerConfig(cfg);
  }

  // Reconstruir la parrilla de equipos si aún no ha comenzado la partida
  if (typeof buildInitialTeamsGrid === 'function') {
    buildInitialTeamsGrid();
  }
}

// Control de pantalla completa
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.warn(err));
  } else {
    document.exitFullscreen().catch(err => console.warn(err));
  }
}

// Inicializar la cuadrícula de equipos por primera vez
buildInitialTeamsGrid();

// Atajos de teclado formales para la presentación, control y atajos del Host
window.addEventListener('keydown', (e) => {
  const presScreen = document.getElementById('presentation-screen');
  const isPresVisible = presScreen && !presScreen.classList.contains('hidden');
  const dashScreen = document.getElementById('host-dashboard-screen');
  const isDashVisible = dashScreen && !dashScreen.classList.contains('hidden');

  if (isDashVisible) {
    // Tecla Escape para cerrar overlay o modales
    if (e.key === 'Escape') {
      closeWeakeningOverlay();
      closeResetModal();
      return;
    }

    // Tecla F o f: Pantalla completa
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    // Tecla M o m: Silenciar / Activar sonido
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      toggleMute();
      return;
    }

    // Tecla R o r: Solicitar confirmación de reinicio de partida
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      requestResetGame();
      return;
    }

    // Teclas 1, 2, 3 para probar rápidamente las 3 animaciones y audios de debilitamiento
    if (e.key === '1') {
      previewWeakeningSequence(1);
      return;
    } else if (e.key === '2') {
      previewWeakeningSequence(2);
      return;
    } else if (e.key === '3') {
      previewWeakeningSequence(3);
      return;
    }
  }

  if (isPresVisible) {
    // Tecla 'H' o 'h': Disparador secreto del hackeo de Anonymous
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      triggerHackAnimation();
      return;
    }

    // Tecla 'F' o 'f': Activar/desactivar pantalla completa
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    // Teclas estándar para una presentación formal
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
      e.preventDefault();
      prevSlide();
    }
  }
});

// Inicializar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  initHostSocket();

  const presScreen = document.getElementById('presentation-screen');
  if (presScreen) {
    presScreen.addEventListener('click', (e) => {
      if (isHackingActive) return;
      // Clic en el tercio izquierdo (30%) retrocede, clic en el resto avanza
      if (e.clientX < window.innerWidth * 0.3) {
        prevSlide();
      } else {
        nextSlide();
      }
    });

    // Doble clic para pantalla completa
    presScreen.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });
  }
});

fetchHostConfig();
