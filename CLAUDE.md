# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Version Control

This project uses Git with GitHub (BenTheWin/ClaudeTest, private).

**Commit and push regularly throughout all work** — after every meaningful unit of progress (new file, feature complete, bug fixed, config changed). Never batch up large amounts of work before committing. The goal is that GitHub always reflects current state so work is never lost and any change can be reverted.

```bash
git add <files>
git commit -m "concise description of what changed and why"
git push
```

Commit messages should be clear and descriptive — explain *why*, not just *what*. Use the imperative mood ("add", "fix", "update"), keep the subject line under 72 characters, and include context in the body when the reason isn't obvious from the code.

## Current Project: Blackjack Game

A browser-based Blackjack game on the `feature/blackjack-game` branch.

**Files:** `index.html`, `style.css`, `game.js`, `ui.js`, `tests/game.test.js`

**Run tests:** `node tests/game.test.js` (83 tests, no dependencies)

**Run game:** Open `index.html` in a browser (no build step needed).

**Architecture:** `game.js` is pure state machine (no DOM). `ui.js` owns all DOM. State flows: `BETTING → DEALING → PLAYER_TURN → DEALER_TURN → RESULT → BETTING`.

**UI invariants to preserve:**
- `updateHandLabels()` is state-aware: during `PLAYER_TURN`/`DEALING` it shows only `dealerCards[0]` (hole card hidden); during `DEALER_TURN` and `RESULT` it shows the full dealer hand (`handValue(game.dealerCards)`). Do not regress this.
- The result message `'BUST!'` must only appear when a player hand actually busted (`isBust(hand.cards)`). When the player simply loses to the dealer, show `'DEALER WINS'` instead.
