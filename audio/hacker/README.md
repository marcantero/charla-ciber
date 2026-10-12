# 🎙️ Carpeta de Audios del Hacker — Escape Room de Ciberseguridad

Esta carpeta contiene los archivos de voz y efectos de sonido utilizados durante la charla y el escape room interactivo.

---

## 📁 Archivos Disponibles en esta Carpeta

| Archivo | Disparador | Momento de Reproducción | Descripción |
| :--- | :--- | :--- | :--- |
| **`audio-hacker-inicio.mp3`** | Tecla `H` (Host) | **Intro Parte 1 — Saludo del Hacker**. Irrumpe en la presentación de diapositivas. | Saludo inicial del hacker anunciando la infiltración en el centro escolar. |
| **`audio-hacker-inicio2.mp3`** | Tecla `H` (Host) | **Intro Parte 2 — Desafío del Hacker**. Suena automáticamente tras la Parte 1. | Desafío a los equipos para detener el cifrado antes de que termine el tiempo. |
| **`audio-hacker-1.mp3`** | 75% Amenaza (Tecla `1`) | **Primer Hito de debilitamiento**. Los alumnos rompen el primer cortafuegos. | *"Sois más buenos de lo que pensaba, pero esto no ha terminado aún..."* |
| **`audio-hacker-2.mp3`** | 40% Amenaza (Tecla `2`) | **Segundo Hito de debilitamiento**. El núcleo hostil sufre fisuras críticas. | *"Parece que estabais escuchando en la charla. JAJAJA (risa malvada)"* |
| **`audio-hacker-3.mp3`** | 0% Amenaza (Tecla `3`) | **Cinemática final de derrota y Manifiesto**. | Manifiesto completo de la exfiltración consumada y revelación de la `FLAG`. |

---

## 🎧 Notas de Funcionamiento
- **Secuencia de Intro**: Al pulsar `H` en el modo presentación, se reproducirá **`audio-hacker-inicio.mp3`** y, al terminar, se reproducirá automáticamente **`audio-hacker-inicio2.mp3`**.
- **Formato**: Todos los audios están en formato estándar **MP3**.
- **Fallback Automático**: Si en algún momento no se encuentra algún archivo, el sistema recurre automáticamente a la síntesis de voz procedimental en tiempo real con tono de villano.
