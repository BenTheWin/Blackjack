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

const { createDeck, shuffleDeck, handValue, isBlackjack, isBust, BlackjackGame } = require('../game.js');

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
  assert(g.hands[0].result === 'push', 'player 18 ties dealer 18 = push');
  assert(g.balance === 500, 'push: wager returned (475 + 25 = 500)');
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

process.on('exit', () => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
});
