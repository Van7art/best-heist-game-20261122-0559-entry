// Midnight Vault — the engine: movement, guards, cameras, the alarm.
//
// One fixed update step (dt seconds). The thief moves with WASD / arrows,
// Shift sneaks (slower, half the detection rate). Guards walk patrol loops
// and look where they walk; cameras sweep. Anything that can see the thief
// raises the alarm; at 100 the room locks down and the guards hunt.

import { LEVELS, VIEW } from './config.js';

const TAU = Math.PI * 2;
const WALK = 195;
const SNEAK = 98;
const RADIUS = 12;

export const STATE = { TITLE: 'title', PLAY: 'play', CLEAR: 'clear', OVER: 'over', WIN: 'win' };

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
function angDiff(a, b) {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}
function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

// Deterministic random for posed screenshots: mulberry32.
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pointInWalls(x, y, walls) {
  for (const w of walls) {
    if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) return true;
  }
  return false;
}

// Line of sight: sample the segment; blocked when a sample lands in a wall.
export function hasSight(ax, ay, bx, by, walls) {
  const d = dist(ax, ay, bx, by);
  const steps = Math.max(2, Math.ceil(d / 8));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (pointInWalls(ax + (bx - ax) * t, ay + (by - ay) * t, walls)) return false;
  }
  return true;
}

export function newGame() {
  return {
    state: STATE.TITLE,
    level: 0,
    score: 0,
    time: 0,
    alarm: 0,
    lockdown: 0,
    spotted: 0,
    msg: '',
    msgT: 0,
    levelTime: 0,
    muted: false,
    player: null,
    guards: [],
    cameras: [],
    loot: [],
    won: false,
  };
}

export function loadLevel(g, idx) {
  const L = LEVELS[idx];
  g.level = idx;
  g.levelTime = 0;
  g.alarm = Math.max(0, g.alarm - 45);
  g.lockdown = 0;
  g.spotted = 0;
  g.player = { x: L.entry.x, y: L.entry.y, vx: 0, vy: 0, sneaking: false, face: -Math.PI / 2 };
  g.guards = L.guards.map((gd) => ({
    path: gd.path, speed: gd.speed, i: 0, x: gd.path[0][0], y: gd.path[0][1],
    dir: 0, mode: 'patrol', hx: 0, hy: 0, wait: 0,
  }));
  g.cameras = L.cameras.map((c) => ({ ...c, t: 0 }));
  g.loot = L.loot.map((l) => ({ ...l, taken: false }));
  g.state = STATE.PLAY;
}

// Circle vs wall rects; slide along the blocked axis.
function moveCircle(p, dx, dy, walls) {
  const nx = p.x + dx;
  if (!hitsWall(nx, p.y, walls)) p.x = nx;
  const ny = p.y + dy;
  if (!hitsWall(p.x, ny, walls)) p.y = ny;
  const r = VIEW.room;
  p.x = clamp(p.x, r.x + RADIUS + 2, r.x + r.w - RADIUS - 2);
  p.y = clamp(p.y, r.y + RADIUS + 2, r.y + r.h - RADIUS - 2);
}

function hitsWall(x, y, walls) {
  for (const w of walls) {
    const cx = clamp(x, w.x, w.x + w.w);
    const cy = clamp(y, w.y, w.y + w.h);
    if (dist(x, y, cx, cy) < RADIUS) return true;
  }
  return false;
}

// How strongly one watcher sees the thief: 0 = blind, 1 = dead to rights.
function seeFactor(wx, wy, wdir, range, half, px, py, walls, sneak) {
  const d = dist(wx, wy, px, py);
  if (d > range) return 0;
  if (Math.abs(angDiff(angleTo(wx, wy, px, py), wdir)) > half) return 0;
  if (!hasSight(wx, wy, px, py, walls)) return 0;
  const near = 1 - d / range;
  let f = 0.35 + 0.65 * near;
  if (sneak) f *= 0.45;
  return f;
}

export function update(g, dt, input) {
  if (g.state !== STATE.PLAY) return;
  const L = LEVELS[g.level];
  g.time += dt;
  g.levelTime += dt;
  if (g.msgT > 0) g.msgT -= dt;
  if (g.spotted > 0) g.spotted -= dt;

  // --- player ---
  const p = g.player;
  let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  if (mx || my) {
    const len = Math.hypot(mx, my);
    mx /= len; my /= len;
    p.face = Math.atan2(my, mx);
  }
  p.sneaking = !!input.sneak;
  const sp = (p.sneaking ? SNEAK : WALK) * dt;
  moveCircle(p, mx * sp, my * sp, L.walls);

  // --- loot ---
  for (const l of g.loot) {
    if (!l.taken && dist(p.x, p.y, l.x, l.y) < 26) {
      l.taken = true;
      g.score += 250;
      g.msg = 'Loot secured  +250';
      g.msgT = 1.4;
      if (g.onPickup) g.onPickup();
    }
  }

  // --- cameras ---
  let seen = 0;
  for (const c of g.cameras) {
    c.t += dt * c.speed;
    const dir = (c.base + Math.sin(c.t) * c.sweep) * Math.PI / 180;
    c.dir = dir;
    seen = Math.max(seen, seeFactor(c.x, c.y, dir, 235, 0.52, p.x, p.y, L.walls, p.sneaking));
  }

  // --- guards ---
  for (const gd of g.guards) {
    const target = gd.path[gd.i];
    const tx = target[0], ty = target[1];
    const d = dist(gd.x, gd.y, tx, ty);
    let speed = gd.speed;
    if (g.lockdown > 0) speed = 150;
    if (gd.mode === 'hunt') speed = 145;
    if (d < 6) {
      gd.i = (gd.i + 1) % gd.path.length;
    } else {
      const nx = (tx - gd.x) / d, ny = (ty - gd.y) / d;
      gd.x += nx * speed * dt;
      gd.y += ny * speed * dt;
      gd.dir = Math.atan2(ny, nx);
    }
    if (g.lockdown > 0 || gd.mode === 'hunt') {
      gd.dir = angleTo(gd.x, gd.y, p.x, p.y);
      // Hunt: steer straight at the thief.
      const hd = dist(gd.x, gd.y, p.x, p.y);
      if (hd > 4) {
        gd.x += ((p.x - gd.x) / hd) * speed * dt;
        gd.y += ((p.y - gd.y) / hd) * speed * dt;
      }
    }
    const f = seeFactor(gd.x, gd.y, gd.dir, 205, 0.61, p.x, p.y, L.walls, p.sneaking);
    seen = Math.max(seen, f);
    if (f > 0.55 && gd.mode === 'patrol') {
      gd.mode = 'suspicious';
      gd.hx = p.x; gd.hy = p.y;
    }
    // Caught on touch.
    if (dist(gd.x, gd.y, p.x, p.y) < RADIUS + 13) {
      g.state = STATE.OVER;
      g.msg = 'Caught by a guard';
      if (g.onCaught) g.onCaught();
      return;
    }
  }

  // --- alarm ---
  if (seen > 0) {
    g.alarm += (18 + 55 * seen) * dt;
    if (g.spotted <= 0 && seen > 0.45) {
      g.spotted = 0.9;
      if (g.onSpotted) g.onSpotted();
    }
  } else {
    g.alarm -= 11 * dt;
  }
  g.alarm = clamp(g.alarm, 0, 100);
  if (g.alarm >= 100 && g.lockdown <= 0) {
    g.lockdown = 6;
    g.msg = 'LOCKDOWN — reach the exit!';
    g.msgT = 2.2;
    for (const gd of g.guards) gd.mode = 'hunt';
    if (g.onLockdown) g.onLockdown();
  }
  if (g.lockdown > 0) {
    g.lockdown -= dt;
    if (g.lockdown <= 0) {
      g.alarm = 55;
      for (const gd of g.guards) gd.mode = 'patrol';
    }
  }

  // --- win the level: all loot, then reach the exit ---
  const allLoot = g.loot.every((l) => l.taken);
  const e = L.exit;
  if (allLoot && p.x > e.x - 8 && p.x < e.x + e.w + 8 && p.y < e.y + e.h + 14 && p.y > e.y - 20) {
    const timeBonus = Math.max(0, Math.round((L.par - g.levelTime) * 4));
    const calmBonus = Math.round((100 - g.alarm) * 2);
    g.score += 500 + timeBonus + calmBonus;
    g.msg = `Room clear  +${500 + timeBonus + calmBonus}`;
    g.msgT = 2;
    if (g.onClear) g.onClear();
    if (g.level + 1 >= LEVELS.length) {
      g.state = STATE.WIN;
      g.won = true;
    } else {
      g.state = STATE.CLEAR;
      g.clearT = 0;
    }
  }
}

// Advance a CLEAR screen, then load the next level. Returns true when it did.
export function advanceClear(g, dt) {
  if (g.state !== STATE.CLEAR) return false;
  g.clearT = (g.clearT || 0) + dt;
  if (g.clearT > 2.2) {
    loadLevel(g, g.level + 1);
    return true;
  }
  return false;
}
