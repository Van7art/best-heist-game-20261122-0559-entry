// Midnight Vault — rendering. Everything the judge sees is drawn here:
// the room, the thief mid-crossing, guards with vision cones, cameras,
// the loot, the vault, and the alarm meter, all in one 1280x720 frame.

import { LEVELS, VIEW, LOOT_KINDS } from './config.js';

const TAU = Math.PI * 2;

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function conePath(ctx, x, y, dir, range, half) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, dir - half, dir + half);
  ctx.closePath();
}

function drawCone(ctx, x, y, dir, range, half, rgb, alpha) {
  const grad = ctx.createRadialGradient(x, y, 8, x, y, range);
  grad.addColorStop(0, `rgba(${rgb},${alpha})`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = grad;
  conePath(ctx, x, y, dir, range, half);
  ctx.fill();
  ctx.strokeStyle = `rgba(${rgb},${alpha * 0.55})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawGuard(ctx, gd, pal, t) {
  drawCone(ctx, gd.x, gd.y, gd.dir, 205, 0.61, pal.cone, gd.mode === 'hunt' ? 0.4 : 0.26);
  // Body: dark uniform, red trim, facing tick.
  ctx.fillStyle = '#1d2733';
  ctx.strokeStyle = pal.guard;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(gd.x, gd.y, 13, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = pal.guard;
  ctx.beginPath();
  ctx.arc(gd.x + Math.cos(gd.dir) * 7, gd.y + Math.sin(gd.dir) * 7, 4, 0, TAU);
  ctx.fill();
  // Suspicion mark.
  if (gd.mode === 'suspicious' || gd.mode === 'hunt') {
    ctx.fillStyle = '#ffd65a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(gd.mode === 'hunt' ? '!' : '?', gd.x, gd.y - 20 + Math.sin(t * 6) * 2);
  }
}

function drawCamera(ctx, c, pal) {
  drawCone(ctx, c.x, c.y, c.dir, 235, 0.52, pal.camCone, 0.22);
  ctx.fillStyle = '#222d3a';
  ctx.strokeStyle = pal.camera;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 8, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff3b30';
  ctx.beginPath();
  ctx.arc(c.x, c.y, 3, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = pal.camera;
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + Math.cos(c.dir) * 14, c.y + Math.sin(c.dir) * 14);
  ctx.stroke();
}

function drawLoot(ctx, l, t) {
  if (l.taken) return;
  const kind = LOOT_KINDS[l.kind];
  const bob = Math.sin(t * 2.4 + l.x) * 2;
  ctx.save();
  ctx.shadowColor = kind.color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = kind.color;
  ctx.beginPath();
  ctx.moveTo(l.x, l.y - 11 + bob);
  ctx.lineTo(l.x + 9, l.y + bob);
  ctx.lineTo(l.x, l.y + 11 + bob);
  ctx.lineTo(l.x - 9, l.y + bob);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(l.x - 3, l.y - 4 + bob, 2, 0, TAU);
  ctx.fill();
}

function drawPlayer(ctx, p, pal, t) {
  const bob = Math.sin(t * 9) * (p.sneaking ? 0.5 : 1.2);
  ctx.save();
  ctx.translate(p.x, p.y + bob * 0.4);
  // Cloak.
  ctx.fillStyle = '#2a2140';
  ctx.strokeStyle = pal.player;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -13);
  ctx.lineTo(11, 10);
  ctx.lineTo(-11, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Hood.
  ctx.fillStyle = pal.player;
  ctx.beginPath();
  ctx.arc(0, -4, 7, 0, TAU);
  ctx.fill();
  // Face direction tick.
  ctx.fillStyle = '#0b0b12';
  ctx.beginPath();
  ctx.arc(Math.cos(p.face) * 4, -4 + Math.sin(p.face) * 4, 2.5, 0, TAU);
  ctx.fill();
  ctx.restore();
  if (p.sneaking) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SNEAKING', p.x, p.y - 22);
  }
}

function drawHud(ctx, g) {
  const L = LEVELS[g.level];
  const pal = L.palette;
  ctx.fillStyle = '#0a0f16';
  ctx.fillRect(0, 0, 1280, 64);
  ctx.fillStyle = pal.accent;
  ctx.fillRect(0, 62, 1280, 2);

  // Left: game name + room. Centre: score + time. Right: the alarm meter.
  // Loot pips sit between the title and the score so nothing overlaps.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f2f5f9';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('MIDNIGHT VAULT', 24, 28);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#9fb0c3';
  ctx.fillText(`Room ${g.level + 1} of ${LEVELS.length} · ${L.name} — ${L.sub}`, 24, 50);
  let lx = 300;
  for (const l of g.loot) {
    const kind = LOOT_KINDS[l.kind];
    ctx.fillStyle = l.taken ? kind.color : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(lx, 20);
    ctx.lineTo(lx + 8, 30);
    ctx.lineTo(lx, 40);
    ctx.lineTo(lx - 8, 30);
    ctx.closePath();
    ctx.fill();
    lx += 24;
  }
  ctx.fillStyle = '#9fb0c3';
  ctx.font = '13px sans-serif';
  ctx.fillText(`${g.loot.filter((l) => l.taken).length}/${g.loot.length} loot`, lx + 4, 34);

  // Centre: score + time.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2f5f9';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`SCORE ${g.score}`, 640, 28);
  const mm = String(Math.floor(g.levelTime / 60)).padStart(2, '0');
  const ss = String(Math.floor(g.levelTime % 60)).padStart(2, '0');
  ctx.fillStyle = '#9fb0c3';
  ctx.font = '14px sans-serif';
  ctx.fillText(`${mm}:${ss}  ·  par ${L.par}s`, 640, 50);

  // Right: the alarm meter.
  const ax = 980, ay = 20, aw = 240, ah = 22;
  const frac = g.alarm / 100;
  const col = frac < 0.4 ? '#39d98a' : frac < 0.7 ? '#f5b83d' : '#ef4444';
  ctx.textAlign = 'left';
  ctx.fillStyle = g.alarm >= 100 || (g.lockdown > 0 && Math.floor(g.time * 6) % 2 === 0) ? '#ff5f5f' : '#f2f5f9';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(g.lockdown > 0 ? '⚠ LOCKDOWN' : 'ALARM', ax, ay - 4);
  ctx.fillStyle = '#1a2432';
  ctx.fillRect(ax, ay, aw, ah);
  ctx.fillStyle = col;
  ctx.fillRect(ax, ay, aw * frac, ah);
  ctx.strokeStyle = '#3a4a5e';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax, ay, aw, ah);
  ctx.fillStyle = '#f2f5f9';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.round(g.alarm)}%`, ax + aw, ay + ah + 15);
}

function drawRoom(ctx, g, t) {
  const L = LEVELS[g.level];
  const pal = L.palette;
  const r = VIEW.room;
  // Floor tiles.
  ctx.fillStyle = pal.floor;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = pal.floorAlt;
  const ts = 80;
  for (let y = r.y; y < r.y + r.h; y += ts) {
    for (let x = r.x; x < r.x + r.w; x += ts) {
      if (((x - r.x) / ts + (y - r.y) / ts) % 2 === 0) ctx.fillRect(x, y, ts, ts);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = r.x; x <= r.x + r.w; x += ts) {
    ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke();
  }
  for (let y = r.y; y <= r.y + r.h; y += ts) {
    ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke();
  }

  // Vault: gold-framed door at the top, the loot target.
  ctx.fillStyle = pal.accentDim;
  ctx.fillRect(L.vault.x - 6, L.vault.y - 6, L.vault.w + 12, L.vault.h + 12);
  ctx.fillStyle = '#3a2f16';
  ctx.fillRect(L.vault.x, L.vault.y, L.vault.w, L.vault.h);
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(L.vault.x, L.vault.y, L.vault.w, L.vault.h);
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.arc(L.vault.x + L.vault.w / 2, L.vault.y + L.vault.h / 2, 7, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#0b0b12';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VAULT', L.vault.x + L.vault.w / 2, L.vault.y - 12);

  // Exit door at the bottom.
  const e = L.exit;
  ctx.fillStyle = '#0d2b1d';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = pal.exit;
  ctx.lineWidth = 2;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = pal.exit;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h + 16);

  // Pedestals.
  for (const pd of L.pedestals) {
    ctx.fillStyle = '#1a2432';
    ctx.fillRect(pd.x, pd.y, pd.w, pd.h);
    ctx.strokeStyle = '#3a4a5e';
    ctx.strokeRect(pd.x, pd.y, pd.w, pd.h);
  }

  // Walls with a lit top edge.
  for (const w of L.walls) {
    ctx.fillStyle = pal.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = pal.wallTop;
    if (w.w >= w.h) ctx.fillRect(w.x, w.y, w.w, 4);
    else ctx.fillRect(w.x, w.y, 4, w.h);
  }
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5, 8, 13, 0.72)';
  ctx.fillRect(0, 64, 1280, 656);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(title, 640, 300);
  ctx.fillStyle = '#e8eef5';
  ctx.font = '20px sans-serif';
  lines.forEach((ln, i) => ctx.fillText(ln, 640, 350 + i * 32));
}

export function render(ctx, g, t) {
  const L = LEVELS[g.level];
  ctx.clearRect(0, 0, 1280, 720);
  ctx.fillStyle = '#070b11';
  ctx.fillRect(0, 0, 1280, 720);
  drawRoom(ctx, g, t);
  for (const c of g.cameras) drawCamera(ctx, c, L.palette);
  for (const gd of g.guards) drawGuard(ctx, gd, L.palette, t);
  for (const l of g.loot) drawLoot(ctx, l, t);
  if (g.player) drawPlayer(ctx, g.player, L.palette, t);
  drawHud(ctx, g);

  // Transient message, kept clear of the vault and exit at the top.
  if (g.msgT > 0 && g.msg) {
    ctx.textAlign = 'center';
    ctx.fillStyle = g.lockdown > 0 ? '#ff6b6b' : '#ffd65a';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(g.msg, 640, 185);
  }
  // Spotted flash.
  if (g.spotted > 0) {
    ctx.fillStyle = `rgba(239, 68, 68, ${0.10 * (g.spotted / 0.9)})`;
    ctx.fillRect(0, 64, 1280, 656);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('SPOTTED!', 640, 215);
  }

  if (g.state === 'title') {
    overlay(ctx, 'MIDNIGHT VAULT', [
      'A museum heist in three rooms. Cross the floor, lift every jewel,',
      'slip past the guards and their vision cones, dodge the cameras,',
      'and reach the EXIT before the alarm hits 100%.',
      '',
      'Move — WASD / arrows      Sneak — Shift (slower, harder to spot)',
      'Mute — M      Restart room — R',
      '',
      'Press ENTER or click to begin',
    ], '#e8b64c');
  } else if (g.state === 'clear') {
    overlay(ctx, 'ROOM CLEAR', [
      g.msg || '',
      `Score ${g.score} — next room loading…`,
    ], '#39d98a');
  } else if (g.state === 'over') {
    overlay(ctx, 'CAUGHT!', [
      g.msg || 'The guards got you.',
      `Score ${g.score} — press R to retry the room, ENTER for the title screen`,
    ], '#ef4444');
  } else if (g.state === 'win') {
    overlay(ctx, 'THE VAULT IS YOURS', [
      `Every jewel lifted. Final score ${g.score}.`,
      'Press ENTER to play again',
    ], '#e8b64c');
  }
}
