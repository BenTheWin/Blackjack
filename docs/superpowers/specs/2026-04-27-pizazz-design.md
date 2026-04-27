# Pizazz Design — Title Screen, Sound & Visual Polish

**Date:** 2026-04-27
**Branch:** feature/blackjack-game

## Overview

Add a Casino Elegance title screen, a full sound system (UI sounds + ambient music), and two targeted in-game visual enhancements. The existing color scheme, layout, and game logic are unchanged.

---

## Section 1: Title Screen

A fullscreen overlay rendered on top of `#app` before the game starts.

**Visual design:**
- Background: `radial-gradient(ellipse at center, #1a6b3a, #0d4a26, #082e18)` — matches the table felt
- Subtle vertical felt texture (repeating CSS gradient)
- Gold inner border ring (`inset: 12px`, `rgba(201,168,76,0.15)`)
- Centered content stack (top to bottom):
  - Suit row: `♠ ♥ ♦ ♣` in gold, letter-spacing 8px
  - Title: `BLACKJACK` — 900 weight, gold, letter-spacing 8px, gold glow text-shadow
  - Tagline: `Beat the Dealer` — small, uppercase, muted white
  - Play Now button — gold outline style, matching `.btn-action` design language
- Mute toggle bottom-right corner (🔊 / 🔇)

**Behavior:**
- Overlay sits as a `position: fixed` element with `z-index: 200` over `#app`
- `#app` is already rendered underneath (so the game is ready the moment the overlay fades)
- Clicking **Play Now** triggers ambient music to start, then fades the overlay out (CSS transition, 0.6s opacity)
- After fade, overlay is removed from DOM

**Implementation:** New `<div id="title-screen">` injected into `index.html`. Styled in `style.css`. Controlled in `ui.js` — a `showTitleScreen()` function that replaces the current `renderBetting()` boot call.

---

## Section 2: Sound System

All audio via the **Web Audio API** — no external files, works offline, no hosting concerns.

**Mute toggle:**
- Button rendered on title screen (bottom-right) and in the game's `.top-bar` (replaces nothing, added alongside balance)
- State stored in `localStorage` key `bj_muted`
- Loaded on boot; applied immediately so returning players don't get surprise audio

**Sound events and design:**

| Event | Sound | Trigger |
|---|---|---|
| Chip click | Short tick (high sine burst) | `addChip()` |
| Card deal | Soft whoosh (filtered noise sweep) | Each card dealt in `onDeal()`, `onHit()`, `onDouble()` |
| Hole card flip | Subtle swoosh (pitch-rising sine) | Start of `runDealerTurn()` |
| Win | Bright ascending chime (3-note sequence) | `renderResult()` — win result |
| Blackjack | Triumphant fanfare (4-note, slightly longer) | `renderResult()` — blackjack result |
| Lose / Bust | Low descending tone | `renderResult()` — lose result |
| Push | Neutral soft tone (single mid note) | `renderResult()` — push result |
| Ambient music | Quiet looping tone bed | Starts on Play Now, pauses when muted |

**Implementation:** New `sound.js` file — a `SoundSystem` class with methods: `playChip()`, `playDeal()`, `playFlip()`, `playWin()`, `playBlackjack()`, `playLose()`, `playPush()`, `startAmbient()`, `stopAmbient()`, `setMuted(bool)`. Loaded via `<script src="sound.js">` before `ui.js`. `ui.js` calls sound methods at the appropriate points.

---

## Section 3: Visual Polish

### Confetti burst (win / blackjack)

- On `win` or `blackjack` result, ~60 small particles (`<div>` elements, 6×6px) are appended to `document.body`
- Colors: gold (`#c9a84c`), green (`#27ae60`), white (`rgba(255,255,255,0.8)`)
- Each particle animates with CSS `@keyframes` — falls downward with random horizontal drift, fades out over ~1.8s
- JS assigns random `left`, `animation-duration` (1.4–2.2s), and `animation-delay` (0–0.4s) per particle inline
- `animationend` handler removes each particle from DOM — no cleanup needed
- Implemented as `triggerConfetti()` in `ui.js`, called from `renderResult()`

### Dramatic hole card reveal

- In `runDealerTurn()`, just before removing the `.flipped` class, apply a CSS class `.dealer-area--reveal` to `.dealer-area`
- `.dealer-area--reveal` plays a brief pulse: `transform: scale(1.03)` over 0.25s then back — subtle zoom that draws the eye
- Class is removed after the animation ends (`animationend`, once)
- No change to timing or game logic

---

## What Is Not Changing

- Game colors, fonts, layout, spacing
- Card components and existing animations
- Game state machine (`game.js`) — zero changes
- Chip/button design
- Mobile responsiveness

---

## Files Changed

| File | Change |
|---|---|
| `index.html` | Add `#title-screen` div, `<script src="sound.js">` |
| `style.css` | Title screen styles, confetti `@keyframes`, dealer reveal pulse |
| `sound.js` | New file — `SoundSystem` class |
| `ui.js` | `showTitleScreen()`, mute toggle, `triggerConfetti()`, sound calls, reveal pulse trigger |
