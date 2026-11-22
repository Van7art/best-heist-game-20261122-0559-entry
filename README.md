# Midnight Vault

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Van7art/best-heist-game-20261122-0559-entry/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Van7art/best-heist-game-20261122-0559-entry/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

A museum heist in three rooms. Cross the floor, lift every jewel, slip past
the guards and their vision cones, dodge the sweeping cameras, and reach the
EXIT before the alarm meter hits 100%.

## The game

You are the thief. Three rooms stand between you and the vault:

1. **The Gallery** — the museum job: two guards, two cameras, three jewels.
2. **The Vault Corridor** — the bank job: three guards, two cameras, four
   pieces of loot, tight corridors.
3. **The Rooftop Penthouse** — the neon job: three guards, three cameras,
   four pieces of loot, open floor.

Guards patrol waypoints and look where they walk — step into a yellow vision
cone and the alarm climbs. Cameras sweep red cones across the room. Get
spotted and the alarm rises faster; at 100% the room locks down and the
guards hunt you. Sneak (Shift) to move slower and halve how fast you are
spotted. Lift all the loot in a room, then reach the EXIT.

## How it works

`main.ts` (Node 22, standard library only) writes the game to
`/output`: it copies `game/` and `screenshots/` from the repository and
writes `/output/dossier.json` with `buildDossier` from
`vendor/makefun-game.ts`. It needs no network and is deterministic.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network: `game/` is plain static files (canvas, ES modules, WebAudio synth).

## Controls

- Move — WASD / arrow keys
- Sneak — Shift (slower, harder to spot)
- Mute — M
- Retry room — R
- Start / continue — Enter or click

## Files

- `main.ts` — the hand-in program (Node 22)
- `serve.ts` — tiny static server for local playtesting
- `vendor/makefun-game.ts` — the make.fun dossier library, copied from the
  kit unchanged
- `game/` — the playable game (`index.html`, `styles.css`, `src/`)
- `game/src/config.js` — the three rooms (variants A, B, C)
- `game/src/game.js` — the engine: movement, guards, cameras, alarm
- `game/src/render.js` — canvas drawing: room, cones, loot, HUD
- `game/src/audio.js` — WebAudio synth sounds, no audio files
- `game/src/main.js` — boot, input, loop, posed screenshot scenes
- `screenshots/` — 3 real renders of the game's own code
- `shots.json` — the three screenshot scenes (`?shot=` queries)

---

<sub>Entered on [make.fun](https://make.fun/?ref=4e96xqxt&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
