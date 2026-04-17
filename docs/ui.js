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
  void balanceEl.offsetWidth;
  balanceEl.classList.add('bounce');
  balanceEl.addEventListener('animationend', () => balanceEl.classList.remove('bounce'), { once: true });
});

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
      el.addEventListener('animationend', () => {
        el.classList.remove('dealing', 'dealing-facedown');
        if (i === 3) onDealComplete();
      }, { once: true });
    }, delay);
  });
}

function onDealComplete() {
  updateHandLabels();
  if (game.state === 'DEALER_TURN') {
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
  const showFullDealerHand = game.state === 'DEALER_TURN' || game.state === 'RESULT';
  const dealerVal = showFullDealerHand
    ? handValue(game.dealerCards)
    : handValue([game.dealerCards[0]]);
  dealerLabelEl.textContent = `Dealer • ${dealerVal}`;
}

// ============================================================
// Player turn
// ============================================================
function renderPlayerTurn() {
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
    renderPlayerTurn();
  } else {
    renderResult();
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

    const row = document.getElementById(`player-cards-${i}`);
    hand.cards.forEach(c => row.appendChild(makeCardEl(c, false)));
  });

  updateHandLabels();
  renderPlayerTurn();
}

// ============================================================
// Dealer turn
// ============================================================
function runDealerTurn() {
  actionBar.innerHTML = '';

  const holeCardEl = dealerCardsEl.lastElementChild;
  if (holeCardEl && holeCardEl.classList.contains('flipped')) {
    const holeCard = game.dealerCards[1];
    holeCardEl.classList.add(isRed(holeCard.suit) ? 'red' : 'black');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => holeCardEl.classList.remove('flipped'));
    });
  }

  const extraCards = game.dealerPlay();

  let delay = 500;
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

  game.hands.forEach((hand, i) => {
    const container = document.getElementById(`player-cards-${i}`) ||
                      document.getElementById('player-cards-0');
    if (!container) return;
    if (hand.result === 'win' || hand.result === 'blackjack') {
      flashCards(container, 'win');
    } else if (hand.result === 'lose') {
      flashCards(container, 'lose');
    }
  });

  const results = game.hands.map(h => h.result);
  let message, cls;
  if (results.every(r => r === 'blackjack'))  { message = 'BLACKJACK!'; cls = 'blackjack'; }
  else if (results.every(r => r === 'win'))    { message = 'YOU WIN!';   cls = 'win'; }
  else if (results.every(r => r === 'lose'))   { message = game.hands.some(h => isBust(h.cards)) ? 'BUST!' : 'DEALER WINS'; cls = 'lose'; }
  else if (results.every(r => r === 'push'))   { message = 'PUSH';       cls = 'push'; }
  else if (results.includes('blackjack'))      { message = 'BLACKJACK!'; cls = 'blackjack'; }
  else if (results.includes('win'))            { message = 'WIN!';        cls = 'win'; }
  else                                          { message = 'LOSE';        cls = 'lose'; }

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

// ============================================================
// Boot
// ============================================================
updateBalance();
renderBetting();
