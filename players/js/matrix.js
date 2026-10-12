// ================================================================
//  PLAYERS - matrix.js
//  Efecto visual Matrix rain canvas para la pantalla del jugador
// ================================================================

const matrixCanvas = document.getElementById('matrix-canvas');
const mCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
let matrixCols = [];

function resizeMatrix() {
  if (!matrixCanvas) return;
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  const cols = Math.floor(window.innerWidth / 16);
  matrixCols = Array.from({ length: cols }, () => Math.random() * matrixCanvas.height);
}

const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>/\\[]{}';

function drawMatrix() {
  if (!mCtx) return;
  mCtx.fillStyle = 'rgba(10, 6, 8, 0.05)';
  mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  mCtx.fillStyle = '#cc1122';
  mCtx.font = '13px "Share Tech Mono", monospace';

  matrixCols.forEach((y, i) => {
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * 16;
    mCtx.fillText(char, x, y);
    if (y > matrixCanvas.height && Math.random() > 0.975) {
      matrixCols[i] = 0;
    } else {
      matrixCols[i] += 16;
    }
  });
}

if (matrixCanvas) {
  resizeMatrix();
  window.addEventListener('resize', resizeMatrix);
  setInterval(drawMatrix, 50);
}
