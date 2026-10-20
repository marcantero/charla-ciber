// ================================================================
//  HOST - presentation.js
//  Navegación de diapositivas del taller (1 a 6)
// ================================================================

let currentSlide = 1;
const totalSlides = 6;

function goToSlide(n) {
  if (isHackingActive) return;
  if (n < 1 || n > totalSlides) return;
  currentSlide = n;
  updateSlideDisplay();
}

function nextSlide() {
  if (isHackingActive) return;
  if (currentSlide < totalSlides) {
    currentSlide++;
    updateSlideDisplay();
  }
}

function prevSlide() {
  if (isHackingActive) return;
  if (currentSlide > 1) {
    currentSlide--;
    updateSlideDisplay();
  }
}

function updateSlideDisplay() {
  document.querySelectorAll('.slide-card').forEach((card) => {
    const num = parseInt(card.getAttribute('data-slide'));
    card.classList.toggle('active', num === currentSlide);
  });

  const counterEl = document.getElementById('current-slide-num');
  if (counterEl) counterEl.textContent = currentSlide;

  const dots = document.querySelectorAll('.slide-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx + 1 === currentSlide);
  });

  const btnPrev = document.getElementById('btn-slide-prev');
  const btnNext = document.getElementById('btn-slide-next');
  if (btnPrev) btnPrev.disabled = currentSlide === 1;
  if (btnNext) {
    btnNext.disabled = currentSlide === totalSlides;
  }
}
