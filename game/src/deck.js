// Ember Duel — seeded randomness and the draw/discard piles.
// A tiny mulberry32 generator keeps every game reproducible from a seed,
// which is what the screenshot staging uses to render the same table twice.

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleInPlace(list, random) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// A deck pile: draws from the top, reshuffles the discard pile when empty.
export class Pile {
  constructor(cards, random) {
    this.random = random;
    this.drawPile = shuffleInPlace([...cards], random);
    this.discardPile = [];
  }

  drawOne() {
    if (this.drawPile.length === 0) {
      if (this.discardPile.length === 0) return null;
      this.drawPile = shuffleInPlace(this.discardPile, this.random);
      this.discardPile = [];
    }
    return this.drawPile.pop();
  }

  discard(card) {
    this.discardPile.push(card);
  }

  get drawCount() { return this.drawPile.length; }
  get discardCount() { return this.discardPile.length; }
}
