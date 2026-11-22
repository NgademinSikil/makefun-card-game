// Ember Duel — drawing the table: hands, HP bars, mana, log and overlays.
// The whole view is re-rendered from the game state on every change, so what
// the screenshots show is always exactly what the game thinks is true.

import { SUITS } from './cards.js';
import { MAX_HP } from './game.js';

const $ = (id) => document.getElementById(id);

export function cardElement(card, options = {}) {
  const suit = SUITS[card.suit];
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `card ${suit.css}`;
  button.title = `${card.name}: ${card.text}`;
  button.innerHTML =
    `<span class="cost">${card.cost}</span>` +
    `<span class="suit">${suit.glyph}</span>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="card-value">${card.power}</div>` +
    `<div class="card-text">${card.text}</div>` +
    (options.key ? `<span class="card-key">${options.key}</span>` : '');
  if (options.disabled) button.disabled = true;
  if (options.onPlay) button.addEventListener('click', options.onPlay);
  return button;
}

function faceDownCard() {
  const card = document.createElement('div');
  card.className = 'card face-down';
  card.setAttribute('aria-hidden', 'true');
  return card;
}

function renderMana(row, mana, maxMana) {
  row.textContent = '';
  for (let i = 0; i < maxMana; i++) {
    const dot = document.createElement('span');
    dot.className = 'mana-dot' + (i < mana ? '' : ' spent');
    dot.title = i < mana ? 'Mana ready' : 'Mana spent';
    row.appendChild(dot);
  }
}

function renderFighter(prefix, fighter) {
  $(`${prefix}-hp`).textContent = fighter.hp;
  const fill = $(`${prefix}-hp-fill`);
  fill.style.width = `${(fighter.hp / MAX_HP) * 100}%`;
  fill.classList.toggle('low', fighter.hp <= 10);
  const badge = $(`${prefix}-block`);
  badge.hidden = fighter.block <= 0;
  $(`${prefix}-block-value`).textContent = fighter.block;
  renderMana($(`${prefix}-mana`), fighter.mana, fighter.maxMana);
}

export function render(game) {
  // Turn banner and round.
  $('round-label').textContent = `Round ${Math.max(1, game.turn)}`;
  $('turn-banner').textContent =
    game.phase === 'player' ? 'Your turn — play a card'
    : game.phase === 'ai' ? 'Cinder Witch is thinking…'
    : game.phase === 'won' ? 'Victory!'
    : game.phase === 'lost' ? 'Defeat'
    : 'Ember Duel';

  renderFighter('player', game.player);
  renderFighter('enemy', game.enemy);
  $('player-deck-count').textContent = game.player.pile.drawCount;
  $('player-discard-count').textContent = game.player.pile.discardCount;

  // Opponent hand: face-down cards, so her plans stay hidden.
  const enemyHand = $('enemy-hand');
  enemyHand.textContent = '';
  for (const _card of game.enemy.hand) enemyHand.appendChild(faceDownCard());

  // Your hand: playable cards lift on hover; unaffordable ones dim.
  const playerHand = $('player-hand');
  playerHand.textContent = '';
  game.player.hand.forEach((card, index) => {
    const playable = game.phase === 'player' && card.cost <= game.player.mana;
    playerHand.appendChild(cardElement(card, {
      disabled: !playable,
      key: String(index + 1),
      onPlay: playable ? () => game.playCard(index) : null,
    }));
  });

  // Last played cards, most recent last. They are inert: no click handler,
  // so they render at full colour instead of dimmed like an unplayable card.
  const played = $('played-area');
  played.textContent = '';
  for (const entry of game.played) {
    const el = cardElement(entry.card, {});
    el.classList.add('played');
    const tag = document.createElement('div');
    tag.textContent = entry.by;
    tag.style.cssText = 'position:absolute;top:-22px;left:0;font-size:12px;color:#c9a06a;';
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.appendChild(tag);
    wrap.appendChild(el);
    played.appendChild(wrap);
  }

  // Battle log, newest first.
  const log = $('battle-log');
  log.textContent = '';
  for (const line of [...game.log].slice(-5).reverse()) {
    const item = document.createElement('li');
    item.textContent = line;
    log.appendChild(item);
  }

  $('end-turn').disabled = game.phase !== 'player';

  // End screen.
  const endScreen = $('end-screen');
  if (game.phase === 'won' || game.phase === 'lost') {
    const won = game.phase === 'won';
    $('end-kicker').textContent = won ? 'THE EMBER ENDURES' : 'THE EMBER FADES';
    $('end-title').textContent = won ? 'VICTORY' : 'DEFEAT';
    $('end-text').textContent = won
      ? 'The Cinder Witch is doused. The valley keeps its last ember — and the Ember Knight keeps the table.'
      : 'The Cinder Witch snuffs your flame. The valley goes dark… until the next duel.';
    $('end-stats').textContent = `Duel lasted ${game.turn} rounds · You ended at ${game.player.hp} HP, the Cinder Witch at ${game.enemy.hp} HP.`;
    endScreen.hidden = false;
  } else {
    endScreen.hidden = true;
  }

  $('title-screen').hidden = game.phase !== 'title';
}

// A damage or healing number that floats up over the table.
export function floater(text, kind = '') {
  const area = $('played-area');
  const node = document.createElement('span');
  node.className = `floater ${kind}`;
  node.textContent = text;
  node.style.left = `${30 + Math.random() * 40}%`;
  node.style.top = '10px';
  area.style.position = 'relative';
  area.appendChild(node);
  setTimeout(() => node.remove(), 1050);
}
