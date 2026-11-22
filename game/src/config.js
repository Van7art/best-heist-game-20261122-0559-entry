// Midnight Vault — level data.
//
// Three rooms, three variants of the same heist. Each level is one room the
// thief crosses: an entry door at the bottom, the vault at the top, loot on
// pedestals between them, guards walking patrol loops and wall cameras
// sweeping cones. All coordinates are in the 1280x720 play canvas; the HUD
// occupies the top 64 pixels, so the room itself runs y = 84 .. 700.
//
// A wall is {x, y, w, h}. A guard is {path: [[x, y], ...], speed}. A camera
// is {x, y, base: angleDeg, sweep: degrees, speed}. Loot is {x, y, kind}.
// Angles are degrees, 0 = east, 90 = south.

export const VIEW = { w: 1280, h: 720, hud: 64, room: { x: 40, y: 84, w: 1200, h: 616 } };

export const LEVELS = [
  {
    id: 'gallery',
    name: 'The Gallery',
    sub: 'Variant A — the museum job',
    par: 75,
    palette: {
      floor: '#101d2b', floorAlt: '#0d1824', wall: '#233246', wallTop: '#31435e',
      accent: '#e8b64c', accentDim: '#8a6d2f', guard: '#c94f4f', camera: '#e05a5a',
      cone: '255, 214, 90', camCone: '255, 92, 92', player: '#7b5cff', exit: '#39d98a',
    },
    entry: { x: 640, y: 668 },
    exit: { x: 640, y: 108, w: 96, h: 18 },
    vault: { x: 592, y: 96, w: 96, h: 30 },
    walls: [
      { x: 40, y: 84, w: 1200, h: 14 },
      { x: 40, y: 686, w: 1200, h: 14 },
      { x: 40, y: 84, w: 14, h: 616 },
      { x: 1226, y: 84, w: 14, h: 616 },
      { x: 220, y: 240, w: 180, h: 22 },
      { x: 880, y: 240, w: 180, h: 22 },
      { x: 220, y: 470, w: 180, h: 22 },
      { x: 880, y: 470, w: 180, h: 22 },
      { x: 560, y: 330, w: 160, h: 22 },
    ],
    pedestals: [
      { x: 300, y: 360, w: 44, h: 44 },
      { x: 936, y: 360, w: 44, h: 44 },
      { x: 640, y: 560, w: 44, h: 44 },
    ],
    loot: [
      { x: 322, y: 352, kind: 'diamond' },
      { x: 958, y: 352, kind: 'emerald' },
      { x: 662, y: 552, kind: 'ruby' },
    ],
    guards: [
      { path: [[300, 170], [980, 170], [980, 300], [300, 300]], speed: 72 },
      { path: [[980, 620], [300, 620], [300, 440], [980, 440]], speed: 66 },
    ],
    cameras: [
      { x: 54, y: 180, base: 0, sweep: 55, speed: 0.55 },
      { x: 1226, y: 540, base: 180, sweep: 55, speed: 0.45 },
    ],
  },
  {
    id: 'vault',
    name: 'The Vault Corridor',
    sub: 'Variant B — the bank job',
    par: 90,
    palette: {
      floor: '#14211a', floorAlt: '#101a15', wall: '#26382e', wallTop: '#35493d',
      accent: '#d8c25a', accentDim: '#8a7a33', guard: '#c94f4f', camera: '#e05a5a',
      cone: '255, 214, 90', camCone: '255, 92, 92', player: '#7b5cff', exit: '#39d98a',
    },
    entry: { x: 640, y: 668 },
    exit: { x: 640, y: 108, w: 96, h: 18 },
    vault: { x: 592, y: 96, w: 96, h: 30 },
    walls: [
      { x: 40, y: 84, w: 1200, h: 14 },
      { x: 40, y: 686, w: 1200, h: 14 },
      { x: 40, y: 84, w: 14, h: 616 },
      { x: 1226, y: 84, w: 14, h: 616 },
      { x: 180, y: 200, w: 22, h: 260 },
      { x: 560, y: 200, w: 22, h: 260 },
      { x: 940, y: 200, w: 22, h: 260 },
      { x: 340, y: 300, w: 220, h: 22 },
      { x: 720, y: 470, w: 220, h: 22 },
    ],
    pedestals: [
      { x: 260, y: 540, w: 44, h: 44 },
      { x: 640, y: 250, w: 44, h: 44 },
      { x: 1020, y: 540, w: 44, h: 44 },
      { x: 640, y: 600, w: 44, h: 44 },
    ],
    loot: [
      { x: 282, y: 532, kind: 'gold' },
      { x: 662, y: 242, kind: 'diamond' },
      { x: 1042, y: 532, kind: 'emerald' },
      { x: 662, y: 592, kind: 'ruby' },
    ],
    guards: [
      { path: [[260, 150], [1020, 150]], speed: 80 },
      { path: [[1020, 640], [260, 640]], speed: 78 },
      { path: [[640, 200], [640, 660]], speed: 62 },
    ],
    cameras: [
      { x: 54, y: 380, base: 0, sweep: 60, speed: 0.6 },
      { x: 1226, y: 380, base: 180, sweep: 60, speed: 0.6 },
    ],
  },
  {
    id: 'penthouse',
    name: 'The Rooftop Penthouse',
    sub: 'Variant C — the neon job',
    par: 105,
    palette: {
      floor: '#1b1030', floorAlt: '#160b28', wall: '#2e2148', wallTop: '#40346a',
      accent: '#ff5fa2', accentDim: '#8a2f56', guard: '#ff7a59', camera: '#ff5f7a',
      cone: '255, 214, 90', camCone: '255, 92, 122', player: '#38e1ff', exit: '#39d98a',
    },
    entry: { x: 640, y: 668 },
    exit: { x: 640, y: 108, w: 96, h: 18 },
    vault: { x: 592, y: 96, w: 96, h: 30 },
    walls: [
      { x: 40, y: 84, w: 1200, h: 14 },
      { x: 40, y: 686, w: 1200, h: 14 },
      { x: 40, y: 84, w: 14, h: 616 },
      { x: 1226, y: 84, w: 14, h: 616 },
      { x: 320, y: 220, w: 120, h: 120 },
      { x: 840, y: 220, w: 120, h: 120 },
      { x: 320, y: 470, w: 120, h: 120 },
      { x: 840, y: 470, w: 120, h: 120 },
    ],
    pedestals: [
      { x: 380, y: 160, w: 44, h: 44 },
      { x: 900, y: 160, w: 44, h: 44 },
      { x: 380, y: 620, w: 44, h: 44 },
      { x: 900, y: 620, w: 44, h: 44 },
    ],
    loot: [
      { x: 402, y: 152, kind: 'diamond' },
      { x: 922, y: 152, kind: 'emerald' },
      { x: 402, y: 612, kind: 'ruby' },
      { x: 922, y: 612, kind: 'gold' },
    ],
    guards: [
      { path: [[200, 160], [1080, 160], [1080, 400], [200, 400]], speed: 84 },
      { path: [[1080, 640], [200, 640], [200, 430], [1080, 430]], speed: 84 },
      { path: [[640, 380], [1080, 380], [1080, 640], [640, 640], [640, 380]], speed: 70 },
    ],
    cameras: [
      { x: 640, y: 98, base: 90, sweep: 70, speed: 0.5 },
      { x: 54, y: 420, base: 0, sweep: 55, speed: 0.55 },
      { x: 1226, y: 420, base: 180, sweep: 55, speed: 0.55 },
    ],
  },
];

// Loot look: fill colour and label shown on the HUD when taken.
export const LOOT_KINDS = {
  diamond: { color: '#bfe9ff', label: 'Diamond' },
  emerald: { color: '#4ade80', label: 'Emerald' },
  ruby: { color: '#f87171', label: 'Ruby' },
  gold: { color: '#fbbf24', label: 'Gold bar' },
};
