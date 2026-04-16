// Game logic — filled in Tasks 2–4

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
      hand.done = true;
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
      if (hand.result === 'lose') continue;
      const playerVal = handValue(hand.cards);
      const playerBJ  = isBlackjack(hand.cards);
      if (playerBJ && dealerBJ) {
        hand.result = 'push';
        this.balance += hand.bet;
      } else if (playerBJ) {
        hand.result = 'blackjack';
        this.balance += hand.bet * 3;
      } else if (dealerBust || playerVal > dealerVal) {
        hand.result = 'win';
        this.balance += hand.bet * 2;
      } else if (playerVal === dealerVal) {
        hand.result = 'push';
        this.balance += hand.bet;
      } else {
        hand.result = 'lose';
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
    if (this.hands.every(h => h.result === 'lose')) {
      this.state = 'RESULT';
      return;
    }
    this.state = 'DEALER_TURN';
  }
}

if (typeof module !== 'undefined') {
  module.exports = { createDeck, shuffleDeck, handValue, isBlackjack, isBust, BlackjackGame };
}
