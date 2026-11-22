// Ember Duel — the rules: turns, mana, damage, block, winning and losing.
// Both fighters start at 30 HP. Each round the mana well grows by one crystal
// (up to six), refills, and each side draws a card. Block absorbs damage and
// fades when its owner's next turn begins. Reduce the Cinder Witch to 0 HP
// to win; fall to 0 HP and the ember fades.

import { buildDeck } from './cards.js';
import { Pile, mulberry32 } from './deck.js';
import { chooseAiPlays } from './ai.js';

export const MAX_HP = 30;
export const MAX_MANA = 6;
export const HAND_LIMIT = 8;
export const OPENING_HAND = 4;

export function makeFighter(name, seed) {
  return {
    name,
    hp: MAX_HP,
    block: 0,
    mana: 0,
    maxMana: 0,
    hand: [],
    pile: new Pile(buildDeck(), mulberry32(seed)),
  };
}

export class Game {
  constructor(seed = 7) {
    this.seed = seed;
    this.random = mulberry32(seed);
    this.turn = 0;
    this.phase = 'title'; // title | player | ai | won | lost
    this.player = makeFighter('Ember Knight', seed);
    this.enemy = makeFighter('Cinder Witch', seed + 101);
    this.log = [];
    this.onChange = null;
    this.played = [];
  }

  start() {
    for (let i = 0; i < OPENING_HAND; i++) {
      this.drawFor(this.player);
      this.drawFor(this.enemy);
    }
    this.log.push('The duel begins. The Cinder Witch fans her cinders.');
    this.beginPlayerTurn();
  }

  drawFor(fighter) {
    if (fighter.hand.length >= HAND_LIMIT) return;
    const card = fighter.pile.drawOne();
    if (card) fighter.hand.push(card);
  }

  beginPlayerTurn() {
    this.turn += 1;
    this.phase = 'player';
    const fighter = this.player;
    fighter.block = 0;
    fighter.maxMana = Math.min(MAX_MANA, this.turn);
    fighter.mana = fighter.maxMana;
    this.drawFor(fighter);
    this.log.push(`Round ${this.turn} — your turn. Mana refills to ${fighter.mana}.`);
    this.emit();
  }

  beginEnemyTurn() {
    this.phase = 'ai';
    const fighter = this.enemy;
    fighter.block = 0;
    fighter.maxMana = Math.min(MAX_MANA, this.turn);
    fighter.mana = fighter.maxMana;
    this.drawFor(fighter);
    this.log.push(`Round ${this.turn} — the Cinder Witch takes her turn.`);
    this.emit();
    this.runEnemyTurn();
  }

  // The witch plays one card at a time so the player can follow her.
  runEnemyTurn() {
    const plays = chooseAiPlays(this.enemy.hand, this.enemy.mana, this.enemy.hp, this.player.hp, this.random);
    let step = 0;
    const playNext = () => {
      if (this.phase !== 'ai') return;
      if (step >= plays.length || this.phase === 'won' || this.phase === 'lost') {
        if (this.phase === 'ai') this.beginPlayerTurn();
        return;
      }
      const card = plays[step];
      step += 1;
      this.applyCard(this.enemy, this.player, card);
      this.emit();
      setTimeout(playNext, 700);
    };
    if (plays.length === 0) {
      this.log.push('The Cinder Witch holds her cards.');
      setTimeout(() => { if (this.phase === 'ai') this.beginPlayerTurn(); }, 800);
    } else {
      setTimeout(playNext, 650);
    }
  }

  playCard(handIndex) {
    if (this.phase !== 'player') return false;
    const card = this.player.hand[handIndex];
    if (!card || card.cost > this.player.mana) return false;
    this.applyCard(this.player, this.enemy, card);
    this.emit();
    return true;
  }

  applyCard(user, foe, card) {
    user.mana -= card.cost;
    const at = user.hand.indexOf(card);
    if (at !== -1) user.hand.splice(at, 1);
    user.pile.discard(card);
    this.played.push({ card, by: user.name });
    if (this.played.length > 4) this.played.shift();

    if (card.suit === 'attack') {
      this.dealDamage(foe, card.power, user.name, card.name);
    } else if (card.suit === 'guard') {
      user.block += card.power;
      this.log.push(`${user.name} plays ${card.name} and gains ${card.power} block.`);
    } else if (card.suit === 'mend') {
      const healed = Math.min(card.power, MAX_HP - user.hp);
      user.hp += healed;
      this.log.push(`${user.name} plays ${card.name} and restores ${healed} HP.`);
    } else if (card.suit === 'surge') {
      if (card.id === 'kindling') {
        user.mana += card.power;
        this.log.push(`${user.name} plays ${card.name} and gains ${card.power} mana.`);
      } else {
        this.drawFor(user);
        this.drawFor(user);
        this.log.push(`${user.name} plays ${card.name} and draws 2 cards.`);
      }
    }
    this.checkEnd();
  }

  dealDamage(target, amount, attackerName, cardName) {
    const absorbed = Math.min(target.block, amount);
    target.block -= absorbed;
    const through = amount - absorbed;
    target.hp = Math.max(0, target.hp - through);
    let line = `${attackerName}'s ${cardName} deals ${amount} damage to ${target.name}`;
    if (absorbed > 0) line += ` (${absorbed} blocked)`;
    line += '.';
    this.log.push(line);
  }

  checkEnd() {
    if (this.enemy.hp <= 0) {
      this.phase = 'won';
      this.log.push('The Cinder Witch is doused. Victory!');
    } else if (this.player.hp <= 0) {
      this.phase = 'lost';
      this.log.push('Your ember fades. The Cinder Witch wins.');
    }
  }

  endTurn() {
    if (this.phase !== 'player') return;
    this.log.push('You end your turn.');
    this.beginEnemyTurn();
  }

  // Staged states for the screenshots: real game states, set up deterministically.
  stageTable() {
    this.phase = 'player';
    this.turn = 4;
    this.player.hp = 22; this.player.block = 4; this.player.maxMana = 4; this.player.mana = 3;
    this.enemy.hp = 17; this.enemy.block = 2; this.enemy.maxMana = 4; this.enemy.mana = 0;
    this.player.hand = this.pickStagedHand(this.player, ['ember-strike', 'ash-guard', 'flame-lash', 'kindling', 'warm-mend']);
    this.enemy.hand = this.pickStagedHand(this.enemy, ['flame-lash', 'cinder-jab', 'ash-guard', 'ember-strike']);
    const spent = this.pickStagedHand(this.player, ['spark-burst'])[0];
    this.played = spent ? [{ card: spent, by: 'Ember Knight' }] : [];
    this.log = [
      'Round 4 — your turn. Mana refills to 4.',
      "Cinder Witch's Flame Lash deals 3 damage to Ember Knight (2 blocked).",
      'Ember Knight plays Ash Guard and gains 6 block.',
      'Your move: strike, guard, or mend?',
    ];
    this.emit();
  }

  stageWin() {
    this.stageTable();
    this.enemy.hp = 0;
    this.phase = 'won';
    this.log.push('Ember Strike deals 5 damage to Cinder Witch. The Cinder Witch is doused. Victory!');
    this.emit();
  }

  stageLoss() {
    this.stageTable();
    this.player.hp = 0;
    this.phase = 'lost';
    this.log.push('Your ember fades. The Cinder Witch wins.');
    this.emit();
  }

  // Pick staged cards out of the fighter's piles, so the deck counts the
  // screenshots show are the true counts of the staged state.
  pickStagedHand(fighter, ids) {
    const all = [...fighter.pile.drawPile, ...fighter.hand, ...fighter.pile.discardPile];
    const picked = ids.map((id) => all.find((card) => card.id === id)).filter(Boolean);
    for (const card of picked) {
      for (const pile of [fighter.pile.drawPile, fighter.hand, fighter.pile.discardPile]) {
        const at = pile.indexOf(card);
        if (at !== -1) pile.splice(at, 1);
      }
    }
    return picked;
  }

  emit() {
    if (this.onChange) this.onChange(this);
  }
}
