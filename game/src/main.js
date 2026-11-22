// Ember Duel — boot: wire the buttons and keys, then open the title screen.
// With ?shot= in the address bar the game jumps straight to a staged state
// for screenshots; without it, a fresh duel waits behind "Begin the Duel".

import { Game } from './game.js';
import { render } from './render.js';
import { applyShot, readShotParams } from './shots.js';

const params = readShotParams();
const game = new Game(params.seed);
game.onChange = () => render(game);

document.getElementById('start-button').addEventListener('click', () => game.start());
document.getElementById('again-button').addEventListener('click', () => {
  const fresh = new Game(params.seed);
  fresh.onChange = game.onChange;
  fresh.start();
  Object.assign(game, fresh);
  render(game);
});
document.getElementById('end-turn').addEventListener('click', () => game.endTurn());

document.addEventListener('keydown', (event) => {
  if (game.phase === 'title' && (event.key === 'Enter' || event.key === ' ')) {
    game.start();
    return;
  }
  if (game.phase === 'player') {
    if (event.key === 'Enter') {
      game.endTurn();
    } else if (event.key >= '1' && event.key <= '7') {
      game.playCard(Number(event.key) - 1);
    }
  } else if ((game.phase === 'won' || game.phase === 'lost') && event.key === 'Enter') {
    document.getElementById('again-button').click();
  }
});

applyShot(game, params);
render(game);
