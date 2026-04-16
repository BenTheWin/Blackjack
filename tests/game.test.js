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

const { createDeck, shuffleDeck, handValue, isBlackjack, isBust } = require('../game.js');

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

process.on('exit', () => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
});
