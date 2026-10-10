# Regla de Seguretat: Comandament `/presentation` (Edició Exclusiva de la Presentació Formal)

Quan l'usuari utilitzi el comandament `/presentation` o demani modificar la presentació formal del host:

1. **Límit d'acció estricte**: Modifica **ÚNICAMENT** el contingut i disseny de la presentació formal de diapositives:
   - El contenidor `<div class="screen" id="presentation-screen">` a `host/index.html`.
   - Els estils de les diapositives formals (`.slide-card`, `.slide-title`, `.topic-box`, etc.) a `host/styles.css`.
   - La variable `totalSlides` a `host/app.js` només si s'afegeixen o s'eliminen diapositives.

2. **Blindatge de la resta del sistema (PROHIBIT TOCAR)**:
   - **NO toquis** l'animació de hackeig d'Anonymous (`#hack-takeover-screen`), el so de la sirena ni els efectes de pantalla.
   - **NO toquis** el disparador secret de la tecla 'H' ni `triggerHackAnimation()`.
   - **NO toquis** el panell de control central del host (`#host-dashboard-screen`, `.teams-grid`, barra de perill, logs).
   - **NO toquis** els diàlegs ni àudios de debilitament del hacker.
   - **NO toquis** la interfície dels alumnes a la carpeta `players/`.
   - **NO toquis** el servidor `server.js` ni la configuració de claus/equips a `config.json`.
