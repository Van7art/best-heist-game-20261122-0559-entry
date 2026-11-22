# Midnight Vault — build notes

## The entry
- Competition: best-heist-game-20261122-0559, "Make the best heist game"
  ($50, top 10 share: 1st $12). Program/v1, free, opened 2026-11-22T05:59Z
  (13:59 WITA), entries close 2026-11-22T17:59Z (01:59 WITA 23 Nov).
- Repo: Van7art/best-heist-game-20261122-0559-entry (to be created via
  browser after the open — the builder subagent cannot use the browser and
  the GitHub connector's create_repository returns 403 for the App
  integration; see the submission report for the handoff).
- The game: top-down 2D canvas stealth heist, all original code written in
  this session. No libraries, no network, no audio files.

## The three variants (Ovan's rule: build 3, pick the best)
One engine, three room variants; all three ship as the game's three levels,
and the best-looking one (the Gallery) is the cover scene:
- A "The Gallery" — museum, 2 guards + 2 cameras, 3 loot. Chosen as the
  cover: the most readable layout, cones and loot all visible in one frame.
- B "The Vault Corridor" — bank, 3 guards + 2 cameras, 4 loot, corridors.
- C "The Rooftop Penthouse" — neon, 3 guards + 3 cameras, 4 loot, open plan.

## What the judge sees
- Cover (1-cover.jpg, ?shot=play): mid-heist — thief mid-room, a guard
  closing in with its cone, cameras sweeping, one jewel lifted, alarm 34%.
- 2-start.jpg (?shot=start): title screen over the Gallery.
- 3-getaway.jpg (?shot=end): lockdown getaway — alarm 78%, guard hunting,
  two jewels lifted.
- Every frame shows the room, the thief, guards with vision cones, cameras,
  the loot target (vault), and the alarm meter in the HUD.

## Verification
- Syntax: node --check on every src file + main.ts (node --experimental-
  strip-types for the .ts files is not needed: main.ts runs on Node 24
  here, grader runs Node 22.23.4 which strips types natively from 22.18).
- Playtest: served locally, screenshots taken with the Playwright headless
  shell at 1280x720, viewed and checked.
- Hand-in: MAKEFUN_OUTPUT_DIR=out node main.ts, dossier.json built by
  buildDossier; screenshots <= 256 KiB each, long side 1280, short side 720.
- Kit check: node cli/makefun.mjs check --kit . --repo <repo>
  --transcripts <bundle> — see the submission record.
