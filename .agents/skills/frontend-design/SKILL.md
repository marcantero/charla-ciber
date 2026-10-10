---
name: frontend-cyber-mission-design
description: Strict visual guidance for generating cyberpunk, "system compromised", and hacker-mission web interfaces. Enforces bold display typography for headings, monospace for data, stark black/red/white palettes, and tech-noir UI elements like chamfered buttons and floating terminal windows.
license: Complete terms in LICENSE.txt
---

# Frontend Design: Cyber Mission & System Compromised Aesthetic

Approach this as a specialized UI/UX engineer building immersive, high-stakes cybernetic interfaces. The aesthetic must feel like a cinematic hacking sequence or a critical mission dashboard. It avoids standard corporate design entirely, replacing it with stark contrasts, aggressive typography, and tech-noir structural elements.

## Core Design Principles

1. **Dual Typography System:** 
   - **Hero/Headings:** Use a bold, wide, extended sans-serif or sci-fi display font (e.g., Orbitron, Syncopate, Microgramma, or a highly weighted modern sans). Headings should be imposing, often fully uppercase.
   - **Body/Data/UI:** Use strict monospaced fonts (e.g., Fira Code, VT323, JetBrains Mono) for all secondary text, paragraphs, labels, and system outputs.
2. **High-Stakes Color Palette:** 
   - **Backgrounds:** Strictly deep black (`#000000`, `#050505`).
   - **Primary Text:** Pure white (`#FFFFFF`) for maximum contrast on major headings and critical readable text.
   - **Accent & Alerts:** A fierce, bright neon red (e.g., `#FF003C`, `#E50914`, or `#FF0000`). Use this for secondary "hacked" titles, progress bars, active states, and call-to-action buttons.
   - **Secondary Backgrounds:** Very dark grey (e.g., `#1A1A1A`) for floating window panels.
3. **Aggressive Visual Structure:**
   - **Page Framing:** Frame the viewport or main containers with subtle corner crosshairs, brackets, or coordinate text (e.g., `[+]`, `// 192.168.1.XXX`).
   - **Chamfered Elements:** Avoid standard rounded corners. For primary buttons (like "ACEPTAR MISIÓN"), use CSS `clip-path` to create angled/chamfered corners (tech/mecha style) rather than standard border-radius.
   - **Floating Terminals:** Integrate floating or centered terminal windows. These should have a dark grey background, a subtle top bar (can include macOS-style traffic light dots or generic system titles), and monospaced text inside to simulate running scripts or progress bars.

## Structural UI and Implementation

When building components, ensure the markup reflects this cinematic, raw aesthetic:

- **Buttons & CTAs:** Make them blocky, often entirely filled with the red accent color, using white uppercase text. Include directional arrows or symbols like `▶` or `//`.
- **Progress Indicators:** Use solid red bars against black backgrounds to indicate loading, decrypting, or hacking progress. Include percentage numbers in monospace.
- **Backgrounds:** Instead of flat black, you can optionally include very subtle, low-opacity matrix rain, digital noise, or dark grid lines, but keep the core readable area completely dark.

## Process: Build and Critique

Work in two passes. First, define the exact token system for this specific view:
- **Color:** Define the exact black base, pure white, and neon red accent hex.
- **Type:** Confirm the extended display font and the monospace font stack.
- **Layout:** Plan the grid. Center-aligned, high-impact hero sections work best for warnings or missions, surrounded by floating data points or terminal windows.

When writing the code (using Tailwind or CSS), use `clip-path: polygon(...)` for custom button shapes. Ensure absolute contrast. If you find yourself adding generic drop shadows, replace them with hard borders or intense, tight red `box-shadow` glows.

## Writing and Copy

Words dictate the stakes. Write from the perspective of an invading AI, a compromised system, or a mission briefing.
- Use high-stakes, dramatic language: `[ ALERTA DE SEGURIDAD CRÍTICA ]`, `TE HAN HACKEADO`, or `SISTEMA COMPROMETIDO`.
- Instructions should feel like mission objectives: `Tenes 5 retos para recuperarlo`, `ACEPTAR MISIÓN`.
- Include simulated system metadata in the corners or above titles (e.g., `IP: 192.168.1.XXX // 15.08.24`, `root@0x4A2F:~#`).