// Ember Duel — the Cinder Witch's turn.
// A readable opponent: she finishes you when she can, guards and mends when
// she is hurt, and otherwise spends her mana on the biggest hit she affords.
// Every choice is visible in the log, so the player can read and counter her.

export function chooseAiPlays(hand, mana, selfHp, foeHp, random) {
  const plays = [];
  let remaining = mana;
  const playable = [...hand];

  // 1. Lethal first: any attack that ends the duel right now.
  for (const card of playable) {
    if (card.suit === 'attack' && card.cost <= remaining && card.power >= foeHp) {
      plays.push(card);
      return plays;
    }
  }

  // 2. When hurt, guard or mend before attacking.
  if (selfHp <= 12) {
    for (const card of playable) {
      if ((card.suit === 'guard' || card.suit === 'mend') && card.cost <= remaining) {
        plays.push(card);
        remaining -= card.cost;
      }
    }
  }

  // 3. Spend what is left on the hardest hits, dearest first.
  const attacks = playable
    .filter((card) => card.suit === 'attack' && !plays.includes(card))
    .sort((a, b) => b.power - a.power);
  for (const card of attacks) {
    if (card.cost <= remaining) {
      plays.push(card);
      remaining -= card.cost;
    }
  }

  // 4. A spare surge is never wasted: draw or kindle when mana allows.
  for (const card of playable) {
    if (card.suit === 'surge' && !plays.includes(card) && card.cost <= remaining) {
      plays.push(card);
      remaining -= card.cost;
    }
  }

  // A little shuffle in the order keeps her from feeling scripted.
  if (plays.length > 1 && random() < 0.5) {
    const first = plays.shift();
    plays.push(first);
  }
  return plays;
}
