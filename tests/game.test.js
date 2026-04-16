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

process.on('exit', () => {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
});
