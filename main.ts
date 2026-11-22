// Ember Duel — the hand-in program (Node 22, standard library only).
// It gathers the finished game for the grader: the static game/ folder and
// the screenshots/ folder are copied beside this file into the output
// directory, and dossier.json is written there with the vendored make.fun
// library, so the judge can read the game from one file.
//
// The program runs in a fresh container with no network, the repository
// read-only at /bot and a writable /output; outside that container the
// MAKEFUN_OUTPUT_DIR environment variable stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// Where this program lives, and where its output goes.
const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy one folder of the entry into the output, when it is there.
function handInFolder(name) {
  const from = join(repoRoot, name);
  const to = join(outDir, name);
  if (!existsSync(from)) return 0;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  return statSync(from).isDirectory() ? 1 : 0;
}

mkdirSync(outDir, { recursive: true });
handInFolder('game');
handInFolder('screenshots');

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the dossier's bytes; the rest refuse an entry the scorer would refuse —
// more than 4 screenshots or one over 256 KiB, more than 993 files in game/
// or 48 MiB of game files in all, or a path under game/ over 1000 bytes.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`Ember Duel handed in: game/ and screenshots/ copied to ${outDir}, dossier.json is ${dossier.length} bytes.`);
