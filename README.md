# Ember Duel — a turn-based card battler

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/NgademinSikil/makefun-card-game/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/NgademinSikil/makefun-card-game/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**Ember Duel** is an original turn-based card battler built for the
[make.fun best card game bounty](https://make.fun/bounty/best-card-game-20261122-1826).
The Cinder Witch has stolen the last ember of the valley. Duel her card for
card — spend mana, guard the flame, and douse her before your ember goes out.

## How to play

- Click a card to play it. Cards cost mana; your mana well grows by one
  crystal every round, up to six, and refills each turn.
- ▲ **Attack** (red) deals damage. ■ **Guard** (blue) gains block, which
  absorbs damage until your next turn. ● **Mend** (green) restores your HP.
  ◆ **Surge** (amber) gives mana or draws cards.
- Both fighters start at 30 HP. Reduce the Cinder Witch to 0 HP to win;
  fall to 0 HP and the ember fades.
- Keys `1`–`7` play a card from your hand, `Enter` ends your turn.
- The Cinder Witch plays a readable game: she finishes you when she can,
  guards and mends when she is hurt, and otherwise spends her mana on the
  hardest hit she affords — so you can read her and counter her.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

No build step, no network request: `game/` is plain static files
(`index.html`, `styles.css`, `src/*.js`) that open in any desktop browser.

## Layout

- `main.ts` — the hand-in program (Node 22, standard library only): copies
  `game/` and `screenshots/` to the output directory and writes
  `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `game/` — the playable game: `index.html`, `styles.css`, and `src/`
  (`cards.js` card designs, `deck.js` seeded shuffle and piles,
  `ai.js` the Cinder Witch's choices, `game.js` the rules and turns,
  `render.js` drawing the table, `shots.js` screenshot staging,
  `main.js` boot).
- `screenshots/` — four real renders of the game's own code: the title
  screen, a mid-duel table, the victory screen and the defeat screen.
- `shots.json` — the address-bar states each screenshot was taken from
  (`?shot=title|table|win|loss&seed=7`).

<sub>Entered on [make.fun](https://make.fun/?ref=ds1567x3&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
