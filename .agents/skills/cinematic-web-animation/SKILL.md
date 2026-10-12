---
name: cinematic-web-animations
description: Design and implement high-impact, cinematic web animations and scrollytelling experiences using modern creative web development techniques (GSAP, ScrollTrigger, Smooth Scroll/Lenis, Canvas/WebGL shaders, and dramatic audio cues). Use when the user asks for cinematic, movie-like web animations, scrollytelling, letterboxing, glitch/hack cinematics, or camera-driven interactive web experiences.
---

# Cinematic Web Animations

Guide and implementation patterns for building movie-like, high-impact web animations, cinematic sequences, and interactive scrollytelling.

## When to Use

- Creating cinematic intro sequences or full-screen cutscenes on the web.
- Implementing dramatic visual transitions (hacks, alerts, phase changes, victory/defeat reveals).
- Building scrollytelling experiences with smooth camera movements, letterboxing, and depth.
- Integrating post-processing effects (film grain, vignette, chromatic aberration/glitches, CRT lines).

---

## 1. Core Visual Principles of Cinematic Design

1. **Aspect Ratio and Letterboxing**:
   - Use cinematic bars (aspect ratio 2.39:1 or 21:9 feel) transitioning smoothly via CSS or GSAP.
   - Example: `.letterbox-bar { height: 8vh; background: #000; }`.

2. **Camera Rig & Easing**:
   - Avoid linear or abrupt easing. Use exponential and cubic eases (`power3.inOut`, `expo.out`).
   - Simulate camera weight with subtle zoom (`scale: 1.05 -> 1.0`) and depth of field (blur transitions).

3. **Film Artifacts & Shaders**:
   - **Film Grain**: SVG noise filter or lightweight canvas overlay with subtle opacity (0.04 - 0.08).
   - **Chromatic Aberration / Glitch**: CSS `text-shadow` RGB offset or WebGL displacement.
   - **Vignette**: Radial gradient mask fading dark at the viewport boundaries.

4. **Audio Synchronization**:
   - Pair animations with sub-bass impacts (braams/drones), analog clicks, or typing sounds using Web Audio API or Howler.js.

---

## 2. Standard Tech Stack & Implementation Patterns

### A. Vanilla JS + GSAP (Best for Static / Existing HTML/JS Apps)

For apps using Vanilla JavaScript (like standard Express/Socket.IO setups):

```javascript
// Example: Dramatic cinematic breach/hack sequence
function playCinematicBreachSequence(onComplete) {
  const tl = gsap.timeline({ onComplete });

  tl.set(".cinematic-layer", { display: "flex", opacity: 1 })
    // Letterbox entrance
    .to(".letterbox-top, .letterbox-bottom", {
      height: "10vh",
      duration: 1.0,
      ease: "power3.inOut"
    })
    // Screen shake & flash
    .fromTo(".cinematic-canvas", 
      { x: -10 }, 
      { x: 10, duration: 0.05, repeat: 5, yoyo: true, ease: "rough" }, 
      "-=0.5"
    )
    // Title cinematic reveal (zoom + deblur)
    .fromTo(".cinematic-title",
      { scale: 1.3, filter: "blur(15px)", opacity: 0 },
      { scale: 1.0, filter: "blur(0px)", opacity: 1, duration: 1.8, ease: "expo.out" }
    )
    // Pause on dramatic beat
    .to({}, { duration: 1.2 })
    // Smooth transition back to active interface
    .to(".cinematic-layer", {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        document.querySelector(".cinematic-layer").style.display = "none";
      }
    });
}