# Blackjack Game — Design Spec

**Date:** 2026-04-16
**Status:** Approved

---

## Overview

A browser-based Blackjack game — four vanilla files, no build tools, no dependencies. The player competes against a bot dealer with real casino rules, a currency system, and smooth card-deal animations. The aesthetic is Casino Dark: deep green felt, gold accents, white cards.

---

## Architecture

Four files, strict separation of concerns:

| File | Role |
|---|---|
| `index.html` | Structure only — no inline JS or styles |
| `style.css` | All visual styling and CSS keyframe animations |
| `game.js` | Pure game logic — no DOM access. State machine + deck/hand operations. |
| `ui.js` | All DOM manipulation and animation orchestration. Reads game state, drives the UI. |

**Game state machine** in `game.js` moves through explicit states:

```
BETTING → DEALING → PLAYER_TURN → DEALER_TURN → RESULT → BETTING
```

`ui.js` renders each state transition. Split hands are tracked as an array of hand objects so the same rendering logic handles both normal and split play.

---

## Visual Design

**Theme:** Casino Dark
- Background: deep green felt (`#0d4a26`)
- Accents: gold (`#c9a84c`)
- Cards: white/near-white (`#f9f9f9`) with deep shadows
- Table header bar: dark semi-transparent overlay with gold border

**Layout (top to bottom):**
1. **Top bar** — game title left, balance + Add Funds button right
2. **Dealer area** — dealer's cards centered, score label below
3. **Divider** — subtle gold-tinted horizontal rule
4. **Player area** — player's cards centered, score + current bet label below
5. **Action bar** — context-sensitive buttons along the bottom

**Chip buttons** (betting phase only, replace action buttons):
- `$5` — red chip, gold dashed edge ring
- `$25` — green chip, gold dashed edge ring
- `$100` — black chip, gold dashed edge ring
- Clicking a chip adds its value to the current bet
- A **CLEAR** button resets the bet to $0
- A **DEAL** button appears once any bet is placed

**Action buttons** (player turn):
- **HIT** — filled gold
- **STAND** — gold outline
- **DOUBLE** — gold outline (hidden if bet × 2 > balance, or hand has >2 cards)
- **SPLIT** — gold outline (shown only when first two cards are a pair and balance ≥ current bet)

---

## Game Rules

| Rule | Detail |
|---|---|
| Deck | Single 52-card deck, reshuffled each round |
| Blackjack | Pays 2:1. If dealer also has Blackjack → 1:1 (even money) |
| Dealer | Stands on hard and soft 17 |
| Hit | Receive one more card |
| Stand | End turn, dealer plays |
| Double Down | Doubles bet, player receives exactly one more card, forced stand |
| Split | Available on pairs only. An equal bet is deducted from balance and placed on the second hand. Each hand receives one additional card, then plays independently left-to-right. Five-Card Charlie applies per hand. Player must have balance ≥ current bet to split. |
| Five-Card Charlie | 5 cards without busting → auto-stand (applies per hand, including split hands) |
| Push | Same total as dealer → wager returned |
| Bust | Over 21 → lose wager immediately, dealer doesn't need to play |
| Ace | Counts as 11; auto-drops to 1 if total would exceed 21 |
| Insurance | Not implemented |
| Surrender | Not implemented |

---

## Animations

All animations are CSS keyframes, orchestrated by `ui.js` with `setTimeout` staggering:

| Animation | Description |
|---|---|
| **Card deal** | Card starts off-screen at top-right (notional deck position), slides into hand, flips face-up mid-travel. Each card staggered 200ms apart. |
| **Hole card reveal** | Dealer's second card slides in face-down during deal; flips face-up when dealer's turn begins. |
| **Bust pulse** | Brief red glow pulse on the busted hand. |
| **Win flash** | Gold shimmer on the winning hand. |
| **Push** | Neutral white pulse. |
| **Add Funds bounce** | Balance figure bounces/scales briefly when +$200 is added. |

Cards use CSS `transform: rotateY()` for the flip effect (3D perspective on the table container).

---

## Currency System

| Item | Value |
|---|---|
| Starting balance | $500 |
| Add Funds button | +$200 per click (always visible in top bar) |
| Chip denominations | $5, $25, $100 |
| Bet lock | Locked on Deal, released at end of round |
| Zero-balance guard | If balance reaches $0, Add Funds button pulses gold to prompt the player |

---

## File Structure

```
index.html
style.css
game.js
ui.js
```

No `package.json`, no build step. Open `index.html` via a local server (e.g. VS Code Live Server) or directly in the browser.

---

## Verification

1. Open `index.html` in the browser — green felt table loads, balance shows $500
2. Click chips to build a bet — bet display updates, chip denominations stack correctly
3. Click DEAL — cards animate in with cascade + flip, staggered 200ms each
4. Hole card appears face-down, flips when dealer plays
5. Hit, Stand, Double, Split all behave per rules above
6. Five-card Charlie auto-stands the hand
7. Blackjack on deal immediately resolves (2:1 or 1:1 if dealer also has BJ)
8. Push returns wager
9. Bust triggers red pulse, wager is lost
10. Add Funds adds $200, balance bounces
11. Balance at $0 — Add Funds button pulses
12. Split: pair hand splits into two, each plays independently
