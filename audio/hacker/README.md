# 🎙️ Carpeta de Audios del Hacker — Escape Room de Ciberseguridad

Esta carpeta contiene los archivos de voz y efectos de sonido utilizados durante la charla y el escape room interactivo.

---

## 📁 Archivos Disponibles en esta Carpeta

| Archivo | Disparador | Momento de Reproducción | Frase / Efecto |
| :--- | :--- | :--- | :--- |
| **`anon_voice.wav`** | Tecla `H` (Host) | **Interrupción inicial del hackeo**. El hacker corta la presentación y anuncia que ha cifrado los datos. | *"Hola alumnos, me he infiltrado en vuestro instituto... Voy a cifrar todos vuestros datos..."* |
| **`hack_glitch.wav`** | Tecla `H` (Host) | **Interferencia eléctrica**. Ruido CRT de cortocircuito al irrumpir en el sistema. | Efecto estática y chisporroteo eléctrico |
| **`siren_alarm.wav`** | Tecla `H` (Host) | **Alarma perimetral**. Sirena de brecha de seguridad durante el hackeo. | Sonido de sirena de emergencia |
| **`hacker_debil1.wav`** | 75% Amenaza (o Tecla `1`) | **Primer Hito de debilitamiento**. Los alumnos rompen el primer cortafuegos. | *"Sois más buenos de lo que pensaba, pero esto no ha terminado aún..."* |
| **`hacker_debil2.wav`** | 40% Amenaza (o Tecla `2`) | **Segundo Hito de debilitamiento**. El núcleo hostil sufre fisuras críticas. | *"Parece que estabais escuchando con atención en la charla. Jajajajaja..."* |
| **`hacker_derrota.wav`** | 0% Amenaza (o Tecla `3`) | **Cinemática de derrota y Manifiesto final**. El intruso es expulsado y revela el robo previo de datos y la FLAG. | Manifiesto completo de la exfiltración y revelación de `FLAG{NUNC4_C0NF13S_Y_S1GU3_4PR3ND13ND0}` |

---

## 🎧 Formatos Compatibles
El sistema admite tanto **`.wav`** como **`.mp3`**.

Si quieres grabar tus propias voces personalizadas (por ejemplo, con tu propia voz distorsionada con filtros o con cualquier otra IA):
1. Graba tu audio en formato **`.mp3`** o **`.wav`**.
2. Dale exactamente el nombre correspondiente (`anon_voice.mp3`, `hacker_debil1.mp3`, etc.).
3. Pégalo directamente en esta carpeta (`audio/hacker/`) o en la carpeta raíz (`audio/`).
4. ¡Listo! El sistema lo detectará y reproducirá automáticamente.

---

## 🤖 Sistema de Fallback Automático
Si en cualquier momento falta algún archivo de audio, el motor de la aplicación no fallará:
- Dispone de **Web Audio API** para sintetizar ruidos de glitch, braams y sirenas proceduralmente.
- Dispone de **SpeechSynthesis API** para generar la voz de villano en tiempo real en español.
