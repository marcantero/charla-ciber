---
name: presentation
description: Activate when the user invokes "/presentation" or requests modifications to the formal presentation slides, topic, theme, or content in the escape room host. Strictly restricts edits to ONLY the formal presentation section (#presentation-screen in host/index.html and related slide styles/navigation), keeping all escape room mechanics, Anonymous hack sequence, host dashboard, player interfaces, server, and multiplayer logic completely untouched.
---

# Comandament `/presentation` — Edició Exclusiva de la Presentació Formal

Aquest comandament s'activa quan l'usuari utilitza `/presentation` (o sol·licita canviar el tema, diapositives o contingut de la presentació formal que es mostra abans del hackeig d'Anonymous).

## Principi d'Àmbit Estricte i Protecció del Sistema

Quan aquest comandament està actiu, **NOMÉS es permet modificar la part de la presentació formal**.
La resta del projecte (l'escape room interactiu, el hackeig d'Anonymous, el panell de control del host, la interfície dels jugadors, el servidor Node.js i la comunicació Socket.io) està **ESTRICTAMENT PROTEGIT** i no s'ha de tocar sota cap circumstància.

---

## 🟢 Zones Permeses (ÚNICAMENT aquestes parts)

1. **Estructura HTML de la Presentació** ([host/index.html](file:///d:/Documentos/charla-ciber/host/index.html)):
   - Únicament el bloc delimitat per:
     ```html
     <!-- ============================================================== -->
     <!-- 0. PANTALLA DE PRESENTACIÓN FORMAL E INSTITUCIONAL             -->
     <!-- ============================================================== -->
     <div class="screen" id="presentation-screen">
       ...
     </div>
     ```
   - Modificar, afegir o eliminar diapositives (`<article class="slide-card">`).
   - Canviar els títols (`.slide-title`), subtítols (`.slide-subtitle`), insígnies (`.slide-badge`), caixes de conceptes (`.topic-box`), targetes de passos (`.step-card`), dades del ponent i metadades institucionals.
   - Mantenir sempre l'atribut `data-slide="X"` coherent i la primera diapositiva amb la classe `active`.

2. **Estils Visuals del Tema Formal** ([host/styles.css](file:///d:/Documentos/charla-ciber/host/styles.css)):
   - Únicament les regles relacionades amb la presentació formal:
     - `.pres-container`, `.slides-viewport`, `.slide-card`, `.slide-badge`, `.slide-title`, `.slide-subtitle`, `.slide-topics-grid`, etc.
     - Colors, tipografies i composició visual de les diapositives institucionals.
   - No alterar mai els estils de hackeig, terminal o panell d'equips.

3. **Control de Diapositives** ([host/app.js](file:///d:/Documentos/charla-ciber/host/app.js)):
   - Únicament la variable `totalSlides` si s'afegeixen o s'eliminen diapositives:
     ```javascript
     let totalSlides = X;
     ```
   - Mantenir intactes els controls de navegació per teclat (fletxes, espai, Enter per avançar/retrocedir).

---

## 🔴 Zones Protegides (PROHIBIT MODIFICAR AMB `/presentation`)

Quan s'utilitza `/presentation`, està totalment prohibit modificar:
- ❌ **El disparador del hackeig**: La detecció de la tecla `H`/`h` (`triggerHackAnimation()`).
- ❌ **L'animació d'Anonymous**: El bloc `#hack-takeover-screen`, l'àudio de sirena, la màscara SVG, el text del missatge del hacker o els efectes CRT/glitch.
- ❌ **El Tauler Central del Host**: El bloc `#host-dashboard-screen`, la graella de nodes dels equips (`#teams-grid`), el widget d'amenaça global, el rellotge i la consola de logs.
- ❌ **Els Overlays de Debilitament**: `#hacker-weakening-overlay` i les alertes interstitials.
- ❌ **La Interfície dels Jugadors**: Tot el directori `players/` ([players/index.html](file:///d:/Documentos/charla-ciber/players/index.html), [players/js/app.js](file:///d:/Documentos/charla-ciber/players/js/app.js), etc.).
- ❌ **El Servidor i Comunicacions**: [server.js](file:///d:/Documentos/charla-ciber/server.js), rutes Express, esdeveniments de Socket.io i el fitxer [config.json](file:///d:/Documentos/charla-ciber/config.json).

---

## Exemples d'Ús

- `/presentation canvia el tema a Intel·ligència Artificial i Ètica Digital`
- `/presentation afegeix una cinquena diapositiva sobre Deepfakes i Desinformació`
- `/presentation canvia els colors de la presentació formal a una paleta blau marí acadèmic`
- `/presentation adapta els títols i contingut per a una xerrada de Privacitat a Xarxes Socials`
