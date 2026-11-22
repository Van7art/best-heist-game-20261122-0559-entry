// Midnight Vault — boot, input, loop, and posed screenshot scenes.
//
// Play it: WASD / arrows to move, Shift to sneak, M to mute, R to retry.
// Screenshots: open ?shot=start, ?shot=play or ?shot=end (with &seed=1).
// A shot poses one deterministic frame — guards mid-patrol, cones on, the
// thief mid-room — and renders it synchronously, so a screenshot always
// catches the same frame.

import { LEVELS, VIEW } from './config.js';
import { newGame, loadLevel, update, advanceClear, STATE, rng } from './game.js';
import { render } from './render.js';
import { sfx, setMuted, isMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const g = newGame();

g.onPickup = () => sfx.pickup();
g.onSpotted = () => sfx.spotted();
g.onLockdown = () => sfx.lockdown();
g.onCaught = () => sfx.caught();
g.onClear = () => sfx.clear();

const input = { up: false, down: false, left: false, right: false, sneak: false };

const KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'sneak', ShiftRight: 'sneak',
};

window.addEventListener('keydown', (e) => {
  if (KEYS[e.code] !== undefined) {
    input[KEYS[e.code]] = true;
    e.preventDefault();
  }
  if (e.code === 'Enter') startFromState();
  if (e.code === 'KeyM') setMuted(!isMuted());
  if (e.code === 'KeyR' && (g.state === STATE.OVER || g.state === STATE.PLAY)) {
    loadLevel(g, g.level);
  }
});
window.addEventListener('keyup', (e) => {
  if (KEYS[e.code] !== undefined) input[KEYS[e.code]] = false;
});
canvas.addEventListener('click', () => startFromState());

function startFromState() {
  sfx.click();
  if (g.state === STATE.TITLE) loadLevel(g, 0);
  else if (g.state === STATE.OVER) g.state = STATE.TITLE;
  else if (g.state === STATE.WIN) {
    g.score = 0; g.time = 0;
    g.state = STATE.TITLE;
  }
}

// Pose one frozen frame for a screenshot. Deterministic: same seed, same
// frame, every time. The frame must show the whole heist at a glance:
// the room, the thief crossing, guards with cones, cameras, loot, vault,
// and the alarm meter.
function poseShot(shot, seed) {
  const r = rng(seed);
  loadLevel(g, 0);
  const L = LEVELS[0];
  if (shot === 'start') {
    g.state = STATE.TITLE;
    g.time = 0;
  } else if (shot === 'play') {
    // Mid-heist: thief halfway up the room, one jewel already lifted,
    // a guard closing in, alarm at a third.
    g.player.x = 620; g.player.y = 430; g.player.face = -Math.PI / 2;
    g.loot[2].taken = true;
    g.score = 250;
    g.alarm = 34;
    g.levelTime = 41;
    g.guards[0].x = 700; g.guards[0].y = 300; g.guards[0].dir = Math.PI * 0.78; g.guards[0].mode = 'suspicious';
    g.guards[1].x = 420; g.guards[1].y = 560; g.guards[1].dir = -Math.PI * 0.1;
    g.cameras[0].dir = 0.5;
    g.cameras[1].dir = Math.PI + 0.4;
    // No transient message: the frame stays clean for the screenshot.
  } else if (shot === 'end') {
    // The getaway: two jewels lifted, alarm high, thief sprinting for the
    // vault with a guard in pursuit.
    g.player.x = 600; g.player.y = 190; g.player.face = -Math.PI / 2;
    g.loot[0].taken = true;
    g.loot[2].taken = true;
    g.score = 500;
    g.alarm = 78;
    g.levelTime = 63;
    g.guards[0].x = 660; g.guards[0].y = 300; g.guards[0].dir = -Math.PI / 2; g.guards[0].mode = 'hunt';
    g.guards[1].x = 900; g.guards[1].y = 470; g.guards[1].dir = Math.PI;
    g.cameras[0].dir = 0.9;
    g.cameras[1].dir = Math.PI - 0.3;
    g.lockdown = 4;
    // No transient message or flash: the red alarm bar and the hunting
    // guard already tell the lockdown story, and the vault stays readable.
  }
  void r;
  render(ctx, g, 0);
}

// --- boot ---
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = parseInt(params.get('seed') || '1', 10) || 1;

if (shot) {
  poseShot(shot, seed);
} else {
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (g.state === STATE.CLEAR) advanceClear(g, dt);
    update(g, dt, input);
    render(ctx, g, now / 1000);
    requestAnimationFrame(loop);
  };
  loadLevel(g, 0);
  g.state = STATE.TITLE;
  requestAnimationFrame(loop);
}
