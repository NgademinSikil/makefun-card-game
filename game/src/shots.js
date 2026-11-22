// Ember Duel — screenshot staging.
// The game reads ?shot= from the address bar so its maker can render the
// exact states the bounty asks to see: the title screen, a mid-duel table,
// the victory screen and the defeat screen. Every state is a real game state
// built by the game's own code, never a mock-up.
//   ?shot=title          the title screen
//   ?shot=table&seed=7   a mid-duel table
//   ?shot=win&seed=7     the victory screen over that table
//   ?shot=loss&seed=7    the defeat screen over that table

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    shot: params.get('shot') || 'title',
    seed: Number(params.get('seed') || '7') || 7,
  };
}

export function applyShot(game, params) {
  if (params.shot === 'table') {
    game.stageTable();
  } else if (params.shot === 'win') {
    game.stageWin();
  } else if (params.shot === 'loss') {
    game.stageLoss();
  }
  // 'title' needs nothing: the game opens on its title screen.
}
