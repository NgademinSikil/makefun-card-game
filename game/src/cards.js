// Ember Duel — the cards. Every card is an original design for this game:
// four suits, each told apart by colour and shape, never by text alone.
//   attack ▲ red   — deals damage
//   guard  ■ blue  — gains block (absorbs damage until your next turn)
//   mend   ● green — restores HP
//   surge  ◆ amber — gives mana or draws cards

export const SUITS = {
  attack: { label: 'Attack', glyph: '▲', css: 'suit-attack' },
  guard: { label: 'Guard', glyph: '■', css: 'suit-guard' },
  mend: { label: 'Mend', glyph: '●', css: 'suit-mend' },
  surge: { label: 'Surge', glyph: '◆', css: 'suit-surge' },
};

// id, name, suit, mana cost, strength (damage / block / healing / bonus), text.
export const CARD_TYPES = [
  { id: 'cinder-jab', name: 'Cinder Jab', suit: 'attack', cost: 0, power: 2, text: 'Deal 2 damage.' },
  { id: 'flame-lash', name: 'Flame Lash', suit: 'attack', cost: 1, power: 3, text: 'Deal 3 damage.' },
  { id: 'ember-strike', name: 'Ember Strike', suit: 'attack', cost: 2, power: 5, text: 'Deal 5 damage.' },
  { id: 'spark-burst', name: 'Spark Burst', suit: 'attack', cost: 3, power: 8, text: 'Deal 8 damage.' },
  { id: 'ash-guard', name: 'Ash Guard', suit: 'guard', cost: 1, power: 6, text: 'Gain 6 block.' },
  { id: 'stone-wall', name: 'Stone Wall', suit: 'guard', cost: 2, power: 10, text: 'Gain 10 block.' },
  { id: 'warm-mend', name: 'Warm Mend', suit: 'mend', cost: 2, power: 6, text: 'Restore 6 HP.' },
  { id: 'ember-feast', name: 'Ember Feast', suit: 'mend', cost: 3, power: 10, text: 'Restore 10 HP.' },
  { id: 'kindling', name: 'Kindling', suit: 'surge', cost: 1, power: 2, text: 'Gain 2 mana.' },
  { id: 'second-wind', name: 'Second Wind', suit: 'surge', cost: 2, power: 2, text: 'Draw 2 cards.' },
];

// The shared deck: two copies of every card, twenty cards in all.
export function buildDeck() {
  const deck = [];
  for (const type of CARD_TYPES) {
    deck.push({ ...type, uid: type.id + '-a' });
    deck.push({ ...type, uid: type.id + '-b' });
  }
  return deck;
}

export function describeCard(card) {
  return `${card.name} (${SUITS[card.suit].label}, ${card.cost} mana): ${card.text}`;
}
