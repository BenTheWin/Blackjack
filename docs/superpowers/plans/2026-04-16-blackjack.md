# Blackjack Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based Blackjack game with Casino Dark aesthetics, smooth deal animations, a chip-based betting system, and full Blackjack rules including split.

**Architecture:** `game.js` is a pure state machine with no DOM access, fully testable in Node.js. `ui.js` reads game state and drives all DOM updates and CSS animations. `style.css` handles all visual presentation including CSS keyframe animations. `index.html` provides the structural scaffold only.

**Tech Stack:** Vanilla HTML/CSS/JS — no dependencies, no build step. Tests run via `node tests/game.test.js`.

---

## File Map

| File | Responsibility |
|---|---|
| `index.html` | HTML structure, loads `style.css`, `game.js`, `ui.js` |
| `style.css` | All visual styling and CSS keyframe animations |
| `game.js` | Deck, hand evaluation, `BlackjackGame` state machine — no DOM |
| `ui.js` | DOM manipulation, animation orchestration, event wiring |
| `tests/game.test.js` | Node.js unit tests for `game.js` pure functions |

---

### Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `game.js`
- Create: `ui.js`
- Create: `tests/game.test.js`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blackjack</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <header class="top-bar">
      <span class="game-title">♠ BLACKJACK ♠</span>
      <div class="balance-area">
        <span class="balance-label">Balance</span>
        <span id="balance" class="balance-amount">$500</span>
        <button id="addFunds" class="btn-add-funds">+ ADD FUNDS</button>
      </div>
    </header>

    <main class="table">
      <section class="dealer-area">
        <div id="dealer-label" class="hand-label">Dealer</div>
        <div id="dealer-cards" class="cards-row"></div>
      </section>

      <div class="table-divider"></div>

      <section id="player-area" class="player-area"></section>
    </main>

    <footer id="action-bar" class="action-bar"></footer>
  </div>

  <div id="result-overlay" class="result-overlay"></div>

  <script src="game.js"></script>
  <script src="ui.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `style.css` (empty stub)**

```css
/* Styles added in Tasks 5–6 */
```

- [ ] **Step 3: Create `game.js` (empty stub)**

```javascript
// Game logic — filled in Tasks 2–4
```

- [ ] **Step 4: Create `ui.js` (empty stub)**

```javascript
// UI logic — filled in Tasks 7–11
```

- [ ] **Step 5: Create `tests/game.test.js` with test runner**

```javascript
// Run with: node tests/game.test.js
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  try { fn(); } catch (e) { console.error(`  ✗ THREW: ${e.message}`); failed++; }
}

// Tests added in Tasks 2–4

process.on('exit', () => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
});
```

- [ ] **Step 6: Open `index.html` in browser — verify no console errors**

Expected: Blank page, no errors in DevTools console.

- [ ] **Step 7: Commit**

```bash
git add index.html style.css game.js ui.js tests/game.test.js
git commit -m "scaffold: add project files for blackjack game"
git push
```

---

### Task 2: Deck Module

**Files:**
- Modify: `game.js`
- Modify: `tests/game.test.js`

- [ ] **Step 1: Add failing tests to `tests/game.test.js`**

Replace the `// Tests added in Tasks 2–4` comment with:

```javascript
const { createDeck, shuffleDeck } = require('../game.js');

describe('createDeck', () => {
  const deck = createDeck();
  assert(deck.length === 52, 'has 52 cards');
  assert(deck.filter(c => c.suit === '♠').length === 13, '13 spades');
  assert(deck.filter(c => c.suit === '♥').length === 13, '13 hearts');
  assert(deck.filter(c => c.suit === '♦').length === 13, '13 diamonds');
  assert(deck.filter(c => c.suit === '♣').length === 13, '13 clubs');
  assert(deck.find(c => c.rank === 'A').value === 11, 'ace value is 11');
  assert(deck.find(c => c.rank === 'K').value === 10, 'king value is 10');
  assert(deck.find(c => c.rank === 'Q').value === 10, 'queen value is 10');
  assert(deck.find(c => c.rank === 'J').value === 10, 'jack value is 10');
  assert(deck.find(c => c.rank === '10').value === 10, '10 value is 10');
  assert(deck.find(c => c.rank === '2').value === 2, '2 value is 2');
});

describe('shuffleDeck', () => {
  const deck = createDeck();
  const shuffled = shuffleDeck(deck);
  assert(shuffled.length === 52, 'shuffled deck has 52 cards');
  assert(deck.length === 52, 'original deck unchanged');
  assert(shuffled !== deck, 'returns a new array');
  const sameOrder = shuffled.every((c, i) => c.rank === deck[i].rank && c.suit === deck[i].suit);
  assert(!sameOrder, 'order differs after shuffle');
});
```

- [ ] **Step 2: Run — expect failure**

```bash
node tests/game.test.js
```

Expected: `Error: Cannot find module` or `createDeck is not a function`

- [ ] **Step 3: Implement `createDeck` and `shuffleDeck` in `game.js`**

```javascript
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const value = rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank, 10);
      deck.push({ suit, rank, value });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  const d = deck.slice();
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

if (typeof module !== 'undefined') {
  module.exports = { createDeck, shuffleDeck };
}
```

- [ ] **Step 4: Run — expect pass**

```bash
node tests/game.test.js
```

Expected: All `createDeck` and `shuffleDeck` tests show ✓.

- [ ] **Step 5: Commit**

```bash
git add game.js tests/game.test.js
git commit -m "feat: add deck creation and Fisher-Yates shuffle (TDD)"
git push
```

---

### Task 3: Hand Evaluation

**Files:**
- Modify: `game.js`
- Modify: `tests/game.test.js`

- [ ] **Step 1: Update the require line in `tests/game.test.js`**

```javascript
const { createDeck, shuffleDeck, handValue, isBlackjack, isBust } = require('../game.js');
```

- [ ] **Step 2: Add failing tests after the `shuffleDeck` describe block**

```javascript
describe('handValue', () => {
  assert(handValue([{rank:'7',value:7},{rank:'8',value:8}]) === 15, '7+8 = 15');
  assert(handValue([{rank:'K',value:10},{rank:'Q',value:10}]) === 20, 'K+Q = 20');
  assert(handValue([{rank:'A',value:11},{rank:'K',value:10}]) === 21, 'A+K = 21 soft');
  assert(handValue([{rank:'A',value:11},{rank:'A',value:11}]) === 12, 'A+A = 12 (one drops to 1)');
  assert(handValue([{rank:'A',value:11},{rank:'9',value:9},{rank:'5',value:5}]) === 15, 'A+9+5 = 15 ace drops');
  assert(handValue([{rank:'A',value:11},{rank:'A',value:11},{rank:'9',value:9}]) === 21, 'A+A+9 = 21');
  assert(handValue([{rank:'K',value:10},{rank:'Q',value:10},{rank:'5',value:5}]) === 25, 'K+Q+5 = 25 bust');
});

describe('isBlackjack', () => {
  assert(isBlackjack([{rank:'A',value:11},{rank:'K',value:10}]) === true, 'A+K is blackjack');
  assert(isBlackjack([{rank:'A',value:11},{rank:'10',value:10}]) === true, 'A+10 is blackjack');
  assert(isBlackjack([{rank:'7',value:7},{rank:'7',value:7},{rank:'7',value:7}]) === false, '7+7+7 not blackjack');
  assert(isBlackjack([{rank:'K',value:10},{rank:'Q',value:10}]) === false, 'K+Q not blackjack');
});

describe('isBust', () => {
  assert(isBust([{rank:'K',value:10},{rank:'Q',value:10},{rank:'5',value:5}]) === true, 'K+Q+5 = 25 is bust');
  assert(isBust([{rank:'K',value:10},{rank:'Q',value:10}]) === false, 'K+Q = 20 not bust');
  assert(isBust([{rank:'A',value:11},{rank:'K',value:10},{rank:'5',value:5}]) === false, 'A+K+5 = 16 not bust');
});
```

- [ ] **Step 3: Run — expect failure**

```bash
node tests/game.test.js
```

Expected: `handValue is not a function`

- [ ] **Step 4: Add `handValue`, `isBlackjack`, `isBust` to `game.js`**

Add after `shuffleDeck`, before `module.exports`:

```javascript
function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    total += card.value;
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isBlackjack(cards) {
  return cards.length === 2 && handValue(cards) === 21;
}

function isBust(cards) {
  return handValue(cards) > 21;
}
```

Update `module.exports`:

```javascript
if (typeof module !== 'undefined') {
  module.exports = { createDeck, shuffleDeck, handValue, isBlackjack, isBust };
}
```

- [ ] **Step 5: Run — expect pass**

```bash
node tests/game.test.js
```

Expected: All hand evaluation tests show ✓.

- [ ] **Step 6: Commit**

```bash
git add game.js tests/game.test.js
git commit -m "feat: add hand evaluation — handValue with soft ace, isBlackjack, isBust (TDD)"
git push
```

---

### Task 4: BlackjackGame State Machine

**Files:**
- Modify: `game.js`
- Modify: `tests/game.test.js`

- [ ] **Step 1: Update require line in `tests/game.test.js`**

```javascript
const { createDeck, shuffleDeck, handValue, isBlackjack, isBust, BlackjackGame } = require('../game.js');
```

- [ ] **Step 2: Add failing tests after the `isBust` describe block**

```javascript
describe('BlackjackGame - betting', () => {
  const g = new BlackjackGame();
  assert(g.state === 'BETTING', 'starts in BETTING');
  assert(g.balance === 500, 'starts with $500');
  assert(g.currentBet === 0, 'starts with $0 bet');
  g.placeBet(25);
  assert(g.currentBet === 25, 'placeBet adds amount');
  g.placeBet(100);
  assert(g.currentBet === 125, 'stacks chips');
  g.clearBet();
  assert(g.currentBet === 0, 'clearBet resets to 0');
  g.placeBet(600);
  assert(g.currentBet === 0, 'cannot bet more than balance');
});

describe('BlackjackGame - deal', () => {
  const g = new BlackjackGame();
  g.placeBet(25);
  const result = g.deal();
  assert(g.balance === 475, 'bet deducted from balance on deal');
  assert(g.hands.length === 1, 'one hand created');
  assert(g.hands[0].cards.length === 2, 'player has 2 cards');
  assert(g.dealerCards.length === 2, 'dealer has 2 cards');
  assert(result.dealOrder.length === 4, 'dealOrder has 4 cards');
  assert(['PLAYER_TURN', 'DEALER_TURN'].includes(g.state), 'state is PLAYER_TURN or DEALER_TURN');
});

describe('BlackjackGame - hit', () => {
  const g = new BlackjackGame();
  g.hands = [{ cards: [{rank:'K',value:10,suit:'♠'},{rank:'6',value:6,suit:'♦'}], bet:25, done:false, result:null }];
  g.dealerCards = [{rank:'9',value:9,suit:'♣'},{rank:'8',value:8,suit:'♥'}];
  g.deck = [{rank:'3',value:3,suit:'♣'}];
  g.state = 'PLAYER_TURN';
  g.balance = 475;
  const card = g.hit();
  assert(card.rank === '3', 'hit returns the drawn card');
  assert(g.hands[0].cards.length === 3, 'hand now has 3 cards');
  assert(g.state === 'PLAYER_TURN', 'still player turn after safe hit');
});

describe('BlackjackGame - bust', () => {
  const g = new BlackjackGame();
  g.hands = [{ cards: [{rank:'K',value:10,suit:'♠'},{rank:'Q',value:10,suit:'♥'}], bet:25, done:false, result:null }];
  g.dealerCards = [{rank:'7',value:7,suit:'♣'},{rank:'9',value:9,suit:'♦'}];
  g.deck = [{rank:'5',value:5,suit:'♣'}];
  g.state = 'PLAYER_TURN';
  g.balance = 475;
  g.hit(); // K+Q+5 = 25
  assert(g.hands[0].result === 'lose', 'bust sets result to lose');
  assert(['DEALER_TURN', 'RESULT'].includes(g.state), 'state advances after bust');
});

describe('BlackjackGame - five-card charlie', () => {
  const g = new BlackjackGame();
  g.hands = [{ cards: [{rank:'2',value:2,suit:'♠'},{rank:'3',value:3,suit:'♥'},{rank:'2',value:2,suit:'♦'},{rank:'3',value:3,suit:'♣'}], bet:25, done:false, result:null }];
  g.dealerCards = [{rank:'7',value:7,suit:'♣'},{rank:'9',value:9,suit:'♦'}];
  g.deck = [{rank:'4',value:4,suit:'♠'}];
  g.state = 'PLAYER_TURN';
  g.balance = 475;
  g.hit(); // 5th card, total 14 — no bust, auto-stand
  assert(g.hands[0].done === true, 'five-card charlie marks hand done');
  assert(g.hands[0].result === null, 'result not set yet (not a bust)');
  assert(['DEALER_TURN'].includes(g.state), 'proceeds to dealer turn');
});

describe('BlackjackGame - stand', () => {
  const g = new BlackjackGame();
  g.hands = [{ cards: [{rank:'K',value:10,suit:'♠'},{rank:'8',value:8,suit:'♥'}], bet:25, done:false, result:null }];
  g.dealerCards = [{rank:'7',value:7,suit:'♣'},{rank:'9',value:9,suit:'♦'}];
  g.deck = [];
  g.state = 'PLAYER_TURN';
  g.balance = 475;
  g.stand();
  assert(g.state === 'DEALER_TURN', 'stand transitions to DEALER_TURN');
});

describe('BlackjackGame - dealerPlay', () => {
  const g = new BlackjackGame();
  g.hands = [{ cards: [{rank:'K',value:10,suit:'♠'},{rank:'8',value:8,suit:'♥'}], bet:25, done:false, result:null }];
  g.dealerCards = [{rank:'7',value:7,suit:'♣'},{rank:'6',value:6,suit:'♦'}]; // 13, must draw
  g.deck = [{rank:'5',value:5,suit:'♠'}]; // dealer draws to 18
  g.state = 'DEALER_TURN';
  g.balance = 475;
  const newCards = g.dealerPlay();
  assert(newCards.length === 1, 'dealer drew 1 card');
  assert(g.dealerCards.length === 3, 'dealer has 3 cards');
  assert(handValue(g.dealerCards) === 18, 'dealer value is 18');
  assert(g.state === 'RESULT', 'state is RESULT after dealerPlay');
  assert(g.hands[0].result === 'win', 'player 18 ties dealer 18... wait, K+8=18, dealer 13+5=18, so push');
});

describe('BlackjackGame - resolve win/lose/push/blackjack', () => {
  function makeGame(playerCards, dealerCards, startBal) {
    const g = new BlackjackGame();
    g.hands = [{ cards: playerCards, bet: 25, done: false, result: null }];
    g.dealerCards = dealerCards;
    g.balance = startBal !== undefined ? startBal : 475;
    g.deck = [];
    g.state = 'DEALER_TURN';
    g.resolve();
    return g;
  }

  const win = makeGame(
    [{rank:'K',value:10,suit:'♠'},{rank:'9',value:9,suit:'♥'}],  // 19
    [{rank:'7',value:7,suit:'♣'},{rank:'8',value:8,suit:'♦'}]    // 15
  );
  assert(win.hands[0].result === 'win', 'player 19 beats dealer 15');
  assert(win.balance === 525, 'win: balance is 475 + 50 = 525');

  const lose = makeGame(
    [{rank:'7',value:7,suit:'♠'},{rank:'8',value:8,suit:'♥'}],   // 15
    [{rank:'K',value:10,suit:'♣'},{rank:'9',value:9,suit:'♦'}]   // 19
  );
  assert(lose.hands[0].result === 'lose', 'player 15 loses to dealer 19');
  assert(lose.balance === 475, 'lose: balance unchanged');

  const push = makeGame(
    [{rank:'K',value:10,suit:'♠'},{rank:'9',value:9,suit:'♥'}],  // 19
    [{rank:'Q',value:10,suit:'♣'},{rank:'9',value:9,suit:'♦'}]   // 19
  );
  assert(push.hands[0].result === 'push', 'equal totals are push');
  assert(push.balance === 500, 'push: wager returned (475 + 25 = 500)');

  const bj = makeGame(
    [{rank:'A',value:11,suit:'♠'},{rank:'K',value:10,suit:'♥'}], // blackjack
    [{rank:'7',value:7,suit:'♣'},{rank:'9',value:9,suit:'♦'}]   // 16
  );
  assert(bj.hands[0].result === 'blackjack', 'blackjack result set');
  assert(bj.balance === 550, 'blackjack pays 2:1 (475 + 75 = 550)');

  const bjPush = makeGame(
    [{rank:'A',value:11,suit:'♠'},{rank:'K',value:10,suit:'♥'}], // BJ
    [{rank:'A',value:11,suit:'♣'},{rank:'Q',value:10,suit:'♦'}]  // dealer BJ
  );
  assert(bjPush.hands[0].result === 'push', 'both blackjack = push');
  assert(bjPush.balance === 500, 'both BJ: even money (475 + 25 = 500)');

  const dealerBust = makeGame(
    [{rank:'K',value:10,suit:'♠'},{rank:'8',value:8,suit:'♥'}],  // 18
    [{rank:'K',value:10,suit:'♣'},{rank:'Q',value:10,suit:'♦'},{rank:'5',value:5,suit:'♠'}] // 25 bust
  );
  assert(dealerBust.hands[0].result === 'win', 'player wins when dealer busts');
  assert(dealerBust.balance === 525, 'dealer bust: win payout');
});

describe('BlackjackGame - double', () => {
  const g = new BlackjackGame();
  g.hands = [{ cards: [{rank:'6',value:6,suit:'♠'},{rank:'5',value:5,suit:'♥'}], bet:25, done:false, result:null }];
  g.dealerCards = [{rank:'7',value:7,suit:'♣'},{rank:'9',value:9,suit:'♦'}];
  g.deck = [{rank:'9',value:9,suit:'♣'}];
  g.state = 'PLAYER_TURN';
  g.balance = 475;
  const card = g.double();
  assert(card.rank === '9', 'double returns drawn card');
  assert(g.hands[0].cards.length === 3, 'hand has 3 cards after double');
  assert(g.hands[0].bet === 50, 'bet doubled');
  assert(g.balance === 450, 'extra bet deducted (475 - 25 = 450)');
  assert(g.hands[0].done === true, 'hand is done after double');
});

describe('BlackjackGame - split', () => {
  const g = new BlackjackGame();
  g.hands = [{ cards: [{rank:'8',value:8,suit:'♠'},{rank:'8',value:8,suit:'♥'}], bet:25, done:false, result:null }];
  g.dealerCards = [{rank:'7',value:7,suit:'♣'},{rank:'9',value:9,suit:'♦'}];
  g.deck = [{rank:'5',value:5,suit:'♣'},{rank:'3',value:3,suit:'♦'}];
  g.state = 'PLAYER_TURN';
  g.balance = 475;
  g.split();
  assert(g.hands.length === 2, 'split creates 2 hands');
  assert(g.hands[0].cards.length === 2, 'first hand has 2 cards');
  assert(g.hands[1].cards.length === 2, 'second hand has 2 cards');
  assert(g.balance === 450, 'extra bet deducted (475 - 25 = 450)');
});

describe('BlackjackGame - addFunds', () => {
  const g = new BlackjackGame();
  g.addFunds();
  assert(g.balance === 700, 'addFunds adds $200');
});

describe('BlackjackGame - newRound', () => {
  const g = new BlackjackGame();
  g.placeBet(25);
  g.deal();
  g.stand();
  g.dealerPlay();
  g.newRound();
  assert(g.state === 'BETTING', 'newRound returns to BETTING');
  assert(g.currentBet === 0, 'bet cleared');
  assert(g.hands.length === 0, 'hands cleared');
  assert(g.dealerCards.length === 0, 'dealer cards cleared');
});
```

- [ ] **Step 3: Run — expect failure**

```bash
node tests/game.test.js
```

Expected: `BlackjackGame is not a function`

- [ ] **Step 4: Add `BlackjackGame` to `game.js`**

Add after `isBust`, before `module.exports`:

```javascript
class BlackjackGame {
  constructor() {
    this.state = 'BETTING';
    this.balance = 500;
    this.currentBet = 0;
    this.deck = [];
    this.hands = [];         // [{cards, bet, done, result}]
    this.activeHandIndex = 0;
    this.dealerCards = [];
  }

  placeBet(amount) {
    if (this.state !== 'BETTING') return;
    if (amount > this.balance - this.currentBet) return;
    this.currentBet += amount;
  }

  clearBet() {
    if (this.state !== 'BETTING') return;
    this.currentBet = 0;
  }

  deal() {
    if (this.state !== 'BETTING' || this.currentBet === 0) return null;
    this.deck = shuffleDeck(createDeck());
    this.balance -= this.currentBet;
    const p1 = this.deck.pop();
    const d1 = this.deck.pop();
    const p2 = this.deck.pop();
    const d2 = this.deck.pop();
    this.hands = [{ cards: [p1, p2], bet: this.currentBet, done: false, result: null }];
    this.dealerCards = [d1, d2];
    this.activeHandIndex = 0;
    this.state = 'PLAYER_TURN';
    // Check for player blackjack — transition to DEALER_TURN immediately
    if (isBlackjack(this.hands[0].cards)) {
      this.hands[0].done = true;
      this._startDealerTurn();
    }
    return { dealOrder: [p1, d1, p2, d2] };
  }

  hit() {
    if (this.state !== 'PLAYER_TURN') return null;
    const hand = this.hands[this.activeHandIndex];
    if (!hand || hand.done) return null;
    const card = this.deck.pop();
    hand.cards.push(card);
    if (isBust(hand.cards)) {
      hand.done = true;
      hand.result = 'lose';
      this._advanceHand();
    } else if (hand.cards.length === 5) {
      hand.done = true;    // five-card charlie: auto-stand
      this._advanceHand();
    }
    return card;
  }

  stand() {
    if (this.state !== 'PLAYER_TURN') return;
    const hand = this.hands[this.activeHandIndex];
    if (!hand) return;
    hand.done = true;
    this._advanceHand();
  }

  double() {
    if (this.state !== 'PLAYER_TURN') return null;
    const hand = this.hands[this.activeHandIndex];
    if (!hand || hand.cards.length !== 2 || hand.bet > this.balance) return null;
    this.balance -= hand.bet;
    hand.bet *= 2;
    const card = this.deck.pop();
    hand.cards.push(card);
    hand.done = true;
    if (isBust(hand.cards)) hand.result = 'lose';
    this._advanceHand();
    return card;
  }

  split() {
    if (this.state !== 'PLAYER_TURN') return;
    const hand = this.hands[this.activeHandIndex];
    if (!hand || hand.cards.length !== 2) return;
    if (hand.cards[0].rank !== hand.cards[1].rank) return;
    if (hand.bet > this.balance) return;
    this.balance -= hand.bet;
    const card1 = this.deck.pop();
    const card2 = this.deck.pop();
    const hand1 = { cards: [hand.cards[0], card1], bet: hand.bet, done: false, result: null };
    const hand2 = { cards: [hand.cards[1], card2], bet: hand.bet, done: false, result: null };
    this.hands.splice(this.activeHandIndex, 1, hand1, hand2);
    // state stays PLAYER_TURN, activeHandIndex stays the same (now pointing at hand1)
  }

  canDouble() {
    if (this.state !== 'PLAYER_TURN') return false;
    const hand = this.hands[this.activeHandIndex];
    return hand && hand.cards.length === 2 && hand.bet <= this.balance;
  }

  canSplit() {
    if (this.state !== 'PLAYER_TURN') return false;
    const hand = this.hands[this.activeHandIndex];
    return hand && hand.cards.length === 2 &&
           hand.cards[0].rank === hand.cards[1].rank &&
           hand.bet <= this.balance;
  }

  addFunds() {
    this.balance += 200;
  }

  newRound() {
    this.state = 'BETTING';
    this.currentBet = 0;
    this.hands = [];
    this.dealerCards = [];
    this.activeHandIndex = 0;
    this.deck = [];
  }

  // Called by ui.js after hole card flips — draws until 17+, then calls resolve()
  dealerPlay() {
    const newCards = [];
    while (handValue(this.dealerCards) < 17) {
      const card = this.deck.pop();
      this.dealerCards.push(card);
      newCards.push(card);
    }
    this.resolve();
    return newCards;
  }

  resolve() {
    const dealerVal = handValue(this.dealerCards);
    const dealerBJ  = isBlackjack(this.dealerCards);
    const dealerBust = isBust(this.dealerCards);
    for (const hand of this.hands) {
      if (hand.result === 'lose') continue;   // already busted
      const playerVal = handValue(hand.cards);
      const playerBJ  = isBlackjack(hand.cards);
      if (playerBJ && dealerBJ) {
        hand.result = 'push';
        this.balance += hand.bet;             // even money
      } else if (playerBJ) {
        hand.result = 'blackjack';
        this.balance += hand.bet * 3;         // 2:1: return bet + 2x profit
      } else if (dealerBust || playerVal > dealerVal) {
        hand.result = 'win';
        this.balance += hand.bet * 2;         // return bet + profit
      } else if (playerVal === dealerVal) {
        hand.result = 'push';
        this.balance += hand.bet;
      } else {
        hand.result = 'lose';                 // bet already deducted on deal
      }
    }
    this.state = 'RESULT';
  }

  _advanceHand() {
    const next = this.hands.findIndex((h, i) => i > this.activeHandIndex && !h.done);
    if (next !== -1) {
      this.activeHandIndex = next;
    } else {
      this._startDealerTurn();
    }
  }

  _startDealerTurn() {
    // If all hands already busted, skip dealer play
    if (this.hands.every(h => h.result === 'lose')) {
      this.state = 'RESULT';
      return;
    }
    this.state = 'DEALER_TURN';
    // ui.js calls dealerPlay() explicitly to animate extra cards
  }
}
```

Update `module.exports`:

```javascript
if (typeof module !== 'undefined') {
  module.exports = { createDeck, shuffleDeck, handValue, isBlackjack, isBust, BlackjackGame };
}
```

- [ ] **Step 5: Fix the dealerPlay test** — the test has an assertion error in its comment. The test sets K+8=18 for player and 7+6=13 for dealer, dealer draws 5 → 18. Both 18 = push, not win. Fix the test's last assert:

```javascript
assert(g.hands[0].result === 'push', 'player 18 ties dealer 18 = push');
assert(g.balance === 500, 'push: wager returned (475 + 25 = 500)');
```

- [ ] **Step 6: Run — expect pass**

```bash
node tests/game.test.js
```

Expected: All tests show ✓, 0 failed.

- [ ] **Step 7: Commit**

```bash
git add game.js tests/game.test.js
git commit -m "feat: add BlackjackGame state machine with all rules (TDD)"
git push
```

---

### Task 5: Table Layout CSS

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Replace `style.css` with the complete layout and theme**

```css
/* ============================================================
   Reset & base
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0d4a26;
  color: #fff;
  height: 100dvh;
  overflow: hidden;
}

/* ============================================================
   App shell
   ============================================================ */
#app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
}

/* ============================================================
   Top bar
   ============================================================ */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid rgba(201, 168, 76, 0.3);
  flex-shrink: 0;
}

.game-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #c9a84c;
}

.balance-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.balance-label {
  font-size: 12px;
  color: #aaa;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.balance-amount {
  font-size: 18px;
  font-weight: 700;
  color: #c9a84c;
  min-width: 80px;
  text-align: right;
}

.balance-amount.bounce {
  animation: balanceBounce 0.4s ease;
}

@keyframes balanceBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.25); }
  70%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.btn-add-funds {
  background: transparent;
  border: 1.5px solid #c9a84c;
  color: #c9a84c;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-add-funds:hover { background: rgba(201, 168, 76, 0.15); }

.btn-add-funds.pulse {
  animation: addFundsPulse 1s ease infinite;
}

@keyframes addFundsPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(201, 168, 76, 0); }
}

/* ============================================================
   Table
   ============================================================ */
.table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dealer-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 12px;
}

.player-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 12px;
}

/* Split mode: side-by-side hands */
.player-area.split {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.table-divider {
  height: 1px;
  background: rgba(201, 168, 76, 0.2);
  margin: 0 24px;
  flex-shrink: 0;
}

/* ============================================================
   Hand label
   ============================================================ */
.hand-label {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

/* ============================================================
   Hand container (used in split)
   ============================================================ */
.hand-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 120px;
}

.hand-container.active-hand .cards-row {
  outline: 2px solid #c9a84c;
  outline-offset: 6px;
  border-radius: 8px;
}

/* ============================================================
   Action bar
   ============================================================ */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 24px;
  background: rgba(0, 0, 0, 0.25);
  border-top: 1px solid rgba(201, 168, 76, 0.2);
  flex-shrink: 0;
  min-height: 72px;
}

/* ============================================================
   Action buttons
   ============================================================ */
.btn-action {
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  border: 1.5px solid #c9a84c;
  transition: background 0.15s, color 0.15s;
}

.btn-filled  { background: #c9a84c; color: #0d2b1a; }
.btn-outline { background: transparent; color: #c9a84c; }
.btn-filled:hover  { background: #e0b84d; }
.btn-outline:hover { background: rgba(201, 168, 76, 0.12); }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

/* ============================================================
   Result overlay
   ============================================================ */
.result-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 100;
}

.result-message {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 3px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  opacity: 0;
  transform: scale(0.7);
  animation: resultPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes resultPop {
  to { opacity: 1; transform: scale(1); }
}

.result-message.win       { color: #c9a84c; }
.result-message.blackjack { color: #f0e080; }
.result-message.lose      { color: #e74c3c; }
.result-message.push      { color: #bbb; }
```

- [ ] **Step 2: Open `index.html` in browser**

Expected: Dark semi-transparent top bar with gold "♠ BLACKJACK ♠" title, gold balance text, and ADD FUNDS button. Green felt fills the rest. Clean layout.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add Casino Dark table layout and button CSS"
git push
```

---

### Task 6: Card and Chip Component CSS

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Append card and chip CSS to `style.css`**

```css
/* ============================================================
   Cards row
   ============================================================ */
.cards-row {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  min-height: 96px;
  position: relative;
}

/* ============================================================
   Card component
   ============================================================ */
.card {
  width: 64px;
  height: 90px;
  border-radius: 8px;
  position: relative;
  transform-style: preserve-3d;
  flex-shrink: 0;
}

.card-inner {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  transform-style: preserve-3d;
  transition: transform 0.35s ease;
}

/* .flipped shows the card back */
.card.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-front {
  background: #f9f9f9;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px;
  transform: rotateY(0deg);
}

.card-back {
  background: linear-gradient(135deg, #1a3a6c, #0d2040);
  border: 1px solid rgba(100, 140, 200, 0.4);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(180deg);
}

.card-back::after {
  content: '';
  width: 44px;
  height: 66px;
  border: 1px solid rgba(100, 140, 200, 0.3);
  border-radius: 4px;
}

.card-rank {
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
}

.card-suit-center {
  font-size: 26px;
  line-height: 1;
  text-align: center;
}

.card-rank-bottom {
  font-size: 14px;
  font-weight: 900;
  line-height: 1;
  transform: rotate(180deg);
  align-self: flex-end;
}

.card.red .card-rank,
.card.red .card-suit-center,
.card.red .card-rank-bottom { color: #c0392b; }

.card.black .card-rank,
.card.black .card-suit-center,
.card.black .card-rank-bottom { color: #1a1a1a; }

/* ============================================================
   Card deal animation
   ============================================================ */

/* Slide in from top-right AND flip face-up */
@keyframes dealSlideFlip {
  0%   { transform: translate(140px, -140px) rotateY(90deg); opacity: 0; }
  45%  { transform: translate(0, 0) rotateY(90deg); opacity: 1; }
  100% { transform: translate(0, 0) rotateY(0deg); }
}

/* Slide in from top-right, stay face-down (hole card) */
@keyframes dealSlideNoFlip {
  0%   { transform: translate(140px, -140px); opacity: 0; }
  100% { transform: translate(0, 0); opacity: 1; }
}

.card.dealing          { animation: dealSlideFlip   0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
.card.dealing-facedown { animation: dealSlideNoFlip 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

/* ============================================================
   Card result flashes
   ============================================================ */
@keyframes winFlash {
  0%, 100% { filter: brightness(1); }
  40%       { filter: brightness(1.3) drop-shadow(0 0 10px rgba(201,168,76,0.9)); }
}

@keyframes loseFlash {
  0%, 100% { filter: brightness(1); }
  40%       { filter: brightness(0.8) drop-shadow(0 0 10px rgba(231,76,60,0.9)); }
}

.card.flash-win  { animation: winFlash  0.6s ease; }
.card.flash-lose { animation: loseFlash 0.6s ease; }

/* ============================================================
   Chip component
   ============================================================ */
.chip {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border: 4px solid #e8d48a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  font-weight: 900;
  font-size: 13px;
  user-select: none;
  transition: transform 0.1s, box-shadow 0.1s;
}

.chip::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  border: 3px dashed rgba(232, 212, 138, 0.6);
  pointer-events: none;
}

.chip:hover  { transform: scale(1.08); box-shadow: 0 6px 16px rgba(0,0,0,0.6); }
.chip:active { transform: scale(0.95); }

.chip-5   { background: #c0392b; color: #fff; }
.chip-25  { background: #27ae60; color: #fff; }
.chip-100 { background: #1a1a2e; color: #e8d48a; }
```

- [ ] **Step 2: Verify the CSS loads without errors**

Open `index.html`, check DevTools console — no errors.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add card component CSS with deal animations and casino chip styles"
git push
```

---

### Task 7: Betting Phase UI

**Files:**
- Modify: `ui.js`

- [ ] **Step 1: Replace `ui.js` with the betting phase implementation**

```javascript
// ============================================================
// Game instance
// ============================================================
const game = new BlackjackGame();

// ============================================================
// DOM refs
// ============================================================
const balanceEl     = document.getElementById('balance');
const addFundsBtn   = document.getElementById('addFunds');
const dealerCardsEl = document.getElementById('dealer-cards');
const dealerLabelEl = document.getElementById('dealer-label');
const playerArea    = document.getElementById('player-area');
const actionBar     = document.getElementById('action-bar');
const resultOverlay = document.getElementById('result-overlay');

// ============================================================
// Helpers
// ============================================================
function fmt(n) { return `$${n}`; }

function isRed(suit) { return suit === '♥' || suit === '♦'; }

function makeCardEl(card, faceDown) {
  const el = document.createElement('div');
  el.className = `card ${faceDown ? '' : (isRed(card.suit) ? 'red' : 'black')}`;
  if (faceDown) el.classList.add('flipped');
  el.innerHTML = `
    <div class="card-inner">
      <div class="card-front">
        <span class="card-rank">${card.rank}</span>
        <span class="card-suit-center">${card.suit}</span>
        <span class="card-rank-bottom">${card.rank}</span>
      </div>
      <div class="card-back"></div>
    </div>`;
  return el;
}

function updateBalance() {
  balanceEl.textContent = fmt(game.balance);
  if (game.balance === 0) {
    addFundsBtn.classList.add('pulse');
  } else {
    addFundsBtn.classList.remove('pulse');
  }
}

// ============================================================
// Render: BETTING phase
// ============================================================
function renderBetting() {
  dealerCardsEl.innerHTML = '';
  dealerLabelEl.textContent = 'Dealer';
  playerArea.classList.remove('split');
  playerArea.innerHTML = `
    <div class="hand-label">Place your bet</div>
    <span id="current-bet" style="font-size:26px;font-weight:700;color:#fff;min-width:60px;text-align:center;">${fmt(game.currentBet)}</span>`;

  actionBar.innerHTML = `
    <div class="chip chip-5"   id="chip5">$5</div>
    <div class="chip chip-25"  id="chip25">$25</div>
    <div class="chip chip-100" id="chip100">$100</div>
    <button class="btn-action btn-outline" id="clearBtn" style="display:none;">CLEAR</button>
    <button class="btn-action btn-filled"  id="dealBtn"  style="display:none;">DEAL</button>`;

  resultOverlay.innerHTML = '';

  document.getElementById('chip5').addEventListener('click',   () => addChip(5));
  document.getElementById('chip25').addEventListener('click',  () => addChip(25));
  document.getElementById('chip100').addEventListener('click', () => addChip(100));
  document.getElementById('clearBtn').addEventListener('click', onClearBet);
  document.getElementById('dealBtn').addEventListener('click',  onDeal);
}

function addChip(amount) {
  game.placeBet(amount);
  document.getElementById('current-bet').textContent = fmt(game.currentBet);
  const showBtns = game.currentBet > 0;
  document.getElementById('clearBtn').style.display = showBtns ? '' : 'none';
  document.getElementById('dealBtn').style.display  = showBtns ? '' : 'none';
  updateBalance();
}

function onClearBet() {
  game.clearBet();
  document.getElementById('current-bet').textContent = fmt(0);
  document.getElementById('clearBtn').style.display = 'none';
  document.getElementById('dealBtn').style.display  = 'none';
}

// ============================================================
// Add Funds button
// ============================================================
addFundsBtn.addEventListener('click', () => {
  game.addFunds();
  updateBalance();
  balanceEl.classList.remove('bounce');
  void balanceEl.offsetWidth;          // force reflow to restart animation
  balanceEl.classList.add('bounce');
  balanceEl.addEventListener('animationend', () => balanceEl.classList.remove('bounce'), { once: true });
});

// ============================================================
// Boot
// ============================================================
updateBalance();
renderBetting();
```

- [ ] **Step 2: Open `index.html` in browser and verify**

Expected:
- Three casino chips ($5 red, $25 green, $100 black) visible in the action bar
- Clicking a chip increases the bet display; CLEAR and DEAL buttons appear
- CLEAR resets bet to $0
- ADD FUNDS adds $200, balance animates with a bounce
- If balance is $0 after testing, ADD FUNDS button pulses gold

- [ ] **Step 3: Commit**

```bash
git add ui.js
git commit -m "feat: add betting phase UI with chip buttons, bet display, and add-funds"
git push
```

---

### Task 8: Deal Animation

**Files:**
- Modify: `ui.js`

- [ ] **Step 1: Add the deal sequence and hand label helpers after `onClearBet` in `ui.js`**

```javascript
// ============================================================
// Deal sequence
// ============================================================
function onDeal() {
  const result = game.deal();
  if (!result) return;

  dealerCardsEl.innerHTML = '';
  playerArea.innerHTML = `
    <div class="hand-container" id="hand-0">
      <div class="cards-row" id="player-cards-0"></div>
      <div class="hand-label" id="player-label-0"></div>
    </div>`;

  actionBar.innerHTML = '';

  const { dealOrder } = result;
  // dealOrder: [playerCard1, dealerCard1, playerCard2, dealerCard2(hole)]
  const targets = [
    { container: document.getElementById('player-cards-0'), faceDown: false },
    { container: dealerCardsEl,                              faceDown: false },
    { container: document.getElementById('player-cards-0'), faceDown: false },
    { container: dealerCardsEl,                              faceDown: true  },
  ];

  let delay = 0;
  dealOrder.forEach((card, i) => {
    const { container, faceDown } = targets[i];
    delay += 220;
    setTimeout(() => {
      const el = makeCardEl(card, faceDown);
      el.classList.add(faceDown ? 'dealing-facedown' : 'dealing');
      container.appendChild(el);
      if (i === 3) {
        el.addEventListener('animationend', onDealComplete, { once: true });
      }
    }, delay);
  });
}

function onDealComplete() {
  updateHandLabels();
  if (game.state === 'DEALER_TURN') {
    // Player had blackjack — skip to dealer turn
    setTimeout(runDealerTurn, 400);
  } else {
    renderPlayerTurn();
  }
}

function updateHandLabels() {
  game.hands.forEach((hand, i) => {
    const label = document.getElementById(`player-label-${i}`);
    if (!label) return;
    const val = handValue(hand.cards);
    label.textContent = `You • ${val} • Bet ${fmt(hand.bet)}`;
  });
  // Show only first dealer card value (hole card hidden)
  const visibleDealerVal = handValue([game.dealerCards[0]]);
  dealerLabelEl.textContent = `Dealer • ${visibleDealerVal}`;
}
```

- [ ] **Step 2: Open browser, place a bet, click DEAL**

Expected:
- Cards animate in one at a time from the top-right with a cascade + flip effect, staggered ~220ms apart
- Player cards flip face-up as they arrive
- Dealer's second card slides in face-down (no flip)
- Action bar stays empty during the animation

- [ ] **Step 3: Commit**

```bash
git add ui.js
git commit -m "feat: add cascade+flip deal animation with staggered timing"
git push
```

---

### Task 9: Player Turn — Hit, Stand, Double, Split

**Files:**
- Modify: `ui.js`

- [ ] **Step 1: Add player turn functions after `updateHandLabels` in `ui.js`**

```javascript
// ============================================================
// Player turn
// ============================================================
function renderPlayerTurn() {
  // Highlight the active hand
  document.querySelectorAll('.hand-container').forEach((el, i) => {
    el.classList.toggle('active-hand', i === game.activeHandIndex);
  });

  actionBar.innerHTML = `
    <button class="btn-action btn-filled"  id="hitBtn">HIT</button>
    <button class="btn-action btn-outline" id="standBtn">STAND</button>
    ${game.canDouble() ? '<button class="btn-action btn-outline" id="doubleBtn">DOUBLE</button>' : ''}
    ${game.canSplit()  ? '<button class="btn-action btn-outline" id="splitBtn">SPLIT</button>'  : ''}`;

  document.getElementById('hitBtn').addEventListener('click',   onHit);
  document.getElementById('standBtn').addEventListener('click', onStand);
  if (game.canDouble()) document.getElementById('doubleBtn').addEventListener('click', onDouble);
  if (game.canSplit())  document.getElementById('splitBtn').addEventListener('click',  onSplit);
}

function onHit() {
  const prevIndex = game.activeHandIndex;
  const card = game.hit();
  if (!card) return;

  const container = document.getElementById(`player-cards-${prevIndex}`);
  const el = makeCardEl(card, false);
  el.classList.add('dealing');
  container.appendChild(el);

  el.addEventListener('animationend', () => {
    el.classList.remove('dealing');
    updateHandLabels();
    if (game.state === 'RESULT') {
      flashCards(container, 'lose');
      setTimeout(renderResult, 700);
    } else if (game.state === 'DEALER_TURN') {
      setTimeout(runDealerTurn, 300);
    } else {
      renderPlayerTurn();
    }
  }, { once: true });
}

function onStand() {
  game.stand();
  updateHandLabels();
  if (game.state === 'DEALER_TURN') {
    setTimeout(runDealerTurn, 300);
  } else if (game.state === 'PLAYER_TURN') {
    renderPlayerTurn();   // next split hand
  } else {
    renderResult();       // all busted
  }
}

function onDouble() {
  const prevIndex = game.activeHandIndex;
  const card = game.double();
  if (!card) return;

  const container = document.getElementById(`player-cards-${prevIndex}`);
  const el = makeCardEl(card, false);
  el.classList.add('dealing');
  container.appendChild(el);

  el.addEventListener('animationend', () => {
    el.classList.remove('dealing');
    updateHandLabels();
    if (game.state === 'RESULT') {
      const hand = game.hands[prevIndex];
      if (hand && hand.result === 'lose') flashCards(container, 'lose');
      setTimeout(renderResult, 700);
    } else if (game.state === 'DEALER_TURN') {
      setTimeout(runDealerTurn, 300);
    } else {
      renderPlayerTurn();
    }
  }, { once: true });
}

function onSplit() {
  game.split();

  // Rebuild player area as two hand containers side by side
  playerArea.classList.add('split');
  playerArea.innerHTML = '';

  game.hands.forEach((hand, i) => {
    const div = document.createElement('div');
    div.className = 'hand-container';
    div.id = `hand-${i}`;
    div.innerHTML = `
      <div class="cards-row" id="player-cards-${i}"></div>
      <div class="hand-label" id="player-label-${i}"></div>`;
    playerArea.appendChild(div);

    // Render each hand's cards (no animation — they're already in game state)
    const row = document.getElementById(`player-cards-${i}`);
    hand.cards.forEach(c => row.appendChild(makeCardEl(c, false)));
  });

  updateHandLabels();
  renderPlayerTurn();
}
```

- [ ] **Step 2: Play through a full round in the browser**

Expected:
- HIT: card animates in, hand value updates. If bust, red flash, result shows.
- STAND: transitions to dealer turn.
- DOUBLE: one card animates in, hand locks (DOUBLE disappears). If bust, red flash.
- SPLIT: player area switches to side-by-side; gold outline follows active hand; each hand plays independently.
- Five-card Charlie: hitting 5 times without busting auto-stands the hand.

- [ ] **Step 3: Commit**

```bash
git add ui.js
git commit -m "feat: add player turn UI — hit, stand, double, split with animations"
git push
```

---

### Task 10: Dealer Turn and Results

**Files:**
- Modify: `ui.js`

- [ ] **Step 1: Add dealer turn and result functions after `onSplit` in `ui.js`**

```javascript
// ============================================================
// Dealer turn
// ============================================================
function runDealerTurn() {
  actionBar.innerHTML = '';

  // Flip the hole card (dealer's last card in the DOM, which was dealt face-down)
  const holeCardEl = dealerCardsEl.lastElementChild;
  if (holeCardEl && holeCardEl.classList.contains('flipped')) {
    const holeCard = game.dealerCards[1];
    // Swap color class before removing flipped (so colour shows on flip)
    holeCardEl.classList.add(isRed(holeCard.suit) ? 'red' : 'black');
    // Small delay so the browser registers the class change, then flip
    requestAnimationFrame(() => {
      requestAnimationFrame(() => holeCardEl.classList.remove('flipped'));
    });
  }

  // game.dealerPlay() draws remaining cards synchronously and calls resolve()
  const extraCards = game.dealerPlay();

  let delay = 500; // wait for hole card flip animation (0.35s transition)
  extraCards.forEach(card => {
    setTimeout(() => {
      const el = makeCardEl(card, false);
      el.classList.add('dealing');
      dealerCardsEl.appendChild(el);
      el.addEventListener('animationend', () => {
        el.classList.remove('dealing');
        dealerLabelEl.textContent = `Dealer • ${handValue(game.dealerCards)}`;
      }, { once: true });
    }, delay);
    delay += 500;
  });

  // Update dealer label after hole card flip
  setTimeout(() => {
    dealerLabelEl.textContent = `Dealer • ${handValue(game.dealerCards)}`;
  }, 400);

  setTimeout(renderResult, delay + 300);
}

// ============================================================
// Result
// ============================================================
function flashCards(container, type) {
  container.querySelectorAll('.card').forEach(el => {
    el.classList.remove('flash-win', 'flash-lose');
    void el.offsetWidth;
    el.classList.add(`flash-${type}`);
    el.addEventListener('animationend', () => el.classList.remove(`flash-${type}`), { once: true });
  });
}

function renderResult() {
  updateHandLabels();

  // Flash each hand
  game.hands.forEach((hand, i) => {
    const container = document.getElementById(`player-cards-${i}`) ||
                      document.getElementById('player-cards-0');
    if (!container) return;
    if (hand.result === 'win' || hand.result === 'blackjack') {
      flashCards(container, 'win');
    } else if (hand.result === 'lose') {
      flashCards(container, 'lose');
    }
    // push: no flash
  });

  // Pick display message
  const results = game.hands.map(h => h.result);
  let message, cls;
  if (results.every(r => r === 'blackjack'))       { message = 'BLACKJACK!'; cls = 'blackjack'; }
  else if (results.every(r => r === 'win'))         { message = 'YOU WIN!';   cls = 'win'; }
  else if (results.every(r => r === 'lose'))        { message = 'BUST!';      cls = 'lose'; }
  else if (results.every(r => r === 'push'))        { message = 'PUSH';       cls = 'push'; }
  else if (results.includes('blackjack'))           { message = 'BLACKJACK!'; cls = 'blackjack'; }
  else if (results.includes('win'))                 { message = 'WIN!';        cls = 'win'; }
  else                                               { message = 'LOSE';        cls = 'lose'; }

  resultOverlay.innerHTML = `<div class="result-message ${cls}">${message}</div>`;
  updateBalance();

  setTimeout(() => {
    actionBar.innerHTML = `<button class="btn-action btn-filled" id="newRoundBtn">DEAL AGAIN</button>`;
    document.getElementById('newRoundBtn').addEventListener('click', () => {
      game.newRound();
      renderBetting();
    });
  }, 700);
}
```

- [ ] **Step 2: Play multiple full rounds in the browser**

Expected:
- After STAND: dealer's hole card flips face-up with a smooth CSS transition
- Dealer draws extra cards with cascade animations (500ms apart) if needed to reach 17+
- Dealer label updates to show full value after hole card flips
- Result message pops in: "YOU WIN!" (gold), "BUST!" (red), "PUSH" (grey), "BLACKJACK!" (bright gold)
- Winning hands flash gold shimmer; losing hands flash red
- Balance updates to reflect outcome
- "DEAL AGAIN" button appears ~700ms after result; returns to betting phase

- [ ] **Step 3: Commit**

```bash
git add ui.js
git commit -m "feat: add dealer turn hole-card flip, result overlay, and DEAL AGAIN button"
git push
```

---

### Task 11: End-to-End Verification

**Files:** None — verification only

- [ ] **Step 1: Run all game logic unit tests**

```bash
node tests/game.test.js
```

Expected: All tests show ✓, 0 failed.

- [ ] **Step 2: Work through the full browser checklist**

Open `index.html` and verify each item:

1. Page loads — green felt, "♠ BLACKJACK ♠" in gold, balance shows $500, three chip buttons visible
2. Click $5 chip → bet shows $5; CLEAR and DEAL appear
3. Click $100 chip → bet shows $105
4. Click CLEAR → bet resets to $0, buttons hide
5. Place $25 bet, click DEAL → 4 cards animate in cascade+flip, 220ms stagger, dealer hole card stays face-down
6. Click HIT → single card slides+flips in, hand value updates
7. Click STAND → hole card flips face-up, dealer draws (if needed), result appears
8. Verify win: player beats dealer → "YOU WIN!" in gold, hands flash gold shimmer
9. Verify bust: bust on hit → "BUST!" in red, red flash on cards, dealer doesn't play
10. Verify push: same total as dealer → "PUSH" in grey, wager returned to balance
11. Keep dealing until natural blackjack → "BLACKJACK!" pops immediately after deal, 2:1 payout
12. If dealer also has blackjack at same time → "PUSH", 1:1 (even money) returned
13. Click ADD FUNDS → +$200, balance number bounces
14. Drain balance to $0 → ADD FUNDS button pulses gold
15. Double down: place $25, get 2 cards, click DOUBLE → one card deals, hand locks, forced stand
16. Split: play until pair, click SPLIT → two hands side by side, gold outline follows active hand; each plays independently
17. Five-card Charlie: hit 4 times safely, 5th hit → auto-stand triggers without bust

- [ ] **Step 3: Final push**

```bash
git add -A
git commit -m "feat: blackjack game complete — all rules, Casino Dark theme, animations, currency"
git push
```
