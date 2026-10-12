// ================================================================
//  HOST - matrix.js
//  Efecto visual Matrix rain canvas en el fondo del Host
// ================================================================

const matrixCanvas = document.getElementById('matrix-canvas');
const mCtx = matrixCanvas ? matrixCanvas.getContext('2d') : null;
let matrixCols = [];
const matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*<>/[]{}+=';

function resizeMatrix() {
  if (!matrixCanvas) return;
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  const cols = Math.floor(window.innerWidth / 18);
  matrixCols = Array.from({ length: cols }, () => Math.random() * matrixCanvas.height);
}

function drawMatrix() {
  if (!mCtx) return;
  if (document.body.classList.contains('in-formal-presentation')) return;
  mCtx.fillStyle = 'rgba(4, 2, 4, 0.08)';
  mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  mCtx.fillStyle = '#ff003c';
  mCtx.font = '14px "Share Tech Mono", monospace';

  matrixCols.forEach((y, i) => {
    const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
    const x = i * 18;
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
