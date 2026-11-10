// CAV-004: cursor-pair sprite composition from measured nursery-sheet frames.
// Bamboo 1x2 pair  = frame 0 (48x96  vertical) above frame 38 (48x96  vertical)  -> 48x192
// Tree   1x3 pair  = frame 0 (48x144 vertical) above frame 17 (48x144 vertical)  -> 48x288
// Drawn onto an extension canvas appended below the existing atlas, then
// composited back into CWFrontend/public/textures/PlacementCursors.png.
const fs = require('fs');
const path = require('path');
const { PNG } = canUse();

function canUse() {
  try { return require('pngjs'); } catch (e) { throw new Error('pngjs required: npm i -D pngjs'); }
}

const root = path.resolve(__dirname, '..', '..');
const SHEET_BAMBOO = path.join(root, 'sheets/Bamboo Nursery.png');
const SHEET_TREE = path.join(root, 'sheets/Tree Nursery.png');
const ATLAS = path.join(root, 'CWFrontend/public/textures/PlacementCursors.png');

// Measured frame geometry (verify gate, CAV-004 analyze-sheets.js):
const BAMBOO = { frames: 39, frameH: 96 };
const TREE = { frames: 18, frameH: 144 };

function load(p) { return PNG.sync.read(fs.readFileSync(p)); }
function save(p, png) { fs.writeFileSync(p, PNG.sync.write(png)); }

function makeCanvas(w, h) {
  const png = new PNG({ width: w, height: h });
  for (let i = 3; i < png.data.length; i += 4) png.data[i] = 0; // transparent
  return png;
}

// Copy a rect from src into dst at (dx, dy).
function blit(dst, src, sx, sy, w, h, dx, dy) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = ((sy + y) * src.width + (sx + x)) * 4;
      const d = ((dy + y) * dst.width + (dx + x)) * 4;
      dst.data[d] = src.data[s];
      dst.data[d + 1] = src.data[s + 1];
      dst.data[d + 2] = src.data[s + 2];
      dst.data[d + 3] = src.data[s + 3];
    }
  }
}

function makePair(sheetPath, frameCount, frameH, outLabel) {
  const sheet = load(sheetPath);
  const first = 0;
  const last = frameCount - 1;
  const canvas = makeCanvas(48, frameH * 2);
  blit(canvas, sheet, first * 48, 0, 48, frameH, 0, 0);
  blit(canvas, sheet, last * 48,  0, 48, frameH, 0, frameH);
  console.log(`${outLabel}: pair canvas ${canvas.width}x${canvas.height} from frames [0] + [${last}]`);
  return canvas;
}

const bambooPair = makePair(SHEET_BAMBOO, BAMBOO.frames, BAMBOO.frameH, 'Bamboo 1x2');
const treePair = makePair(SHEET_TREE, TREE.frames, TREE.frameH, 'Work 1x3');

// --- Compose extension atlas: existing 1163x1449 + Bamboo pair (48x192) + gap + Tree pair (48x288)
// Layout (stacked vertically in ONE 48-px column):
//   Bamboo pair: from-top rows 1449..1640 (2 cells)
//   gap cell:    rows 1641..1688  (48 px, empty)
//   Tree pair:   from-top rows 1689..1976 (3 cells)
// Placement.tsx offset.y counts px from the atlas BOTTOM (flipY), so the
// Tree pair sits closest to the new bottom edge. See probe-offsets.js.
const atlas = load(ATLAS);
const oldW = atlas.width, oldH = atlas.height;
const extW = Math.max(oldW, 48);
const extH = oldH + 192 + 48 + 288; // bamboo pair + gap cell + tree pair
const ext = makeCanvas(extW, extH);

// bottom rows of the existing atlas carry real content (verify gate) — extend below
blit(ext, atlas, 0,  0, oldW, oldH, 0, 0);

const BAMBOO_TOP = oldH;            // 1449
const TREE_TOP = oldH + 192 + 48;   // 1689
blit(ext, bambooPair, 0, 0, 48, bambooPair.height, 0, BAMBOO_TOP);
blit(ext, treePair, 0, 0, 48, treePair.height, 0, TREE_TOP);

save(ATLAS, ext);
console.log(`atlas extended: ${oldW}x${oldH} -> ${ext.width}x${ext.height}`);
console.log(`  Bamboo pair from-top rows ${BAMBOO_TOP}..${BAMBOO_TOP + 191}`);
console.log(`  gap cell rows ${BAMBOO_TOP + 192}..${TREE_TOP - 1}`);
console.log(`  Tree pair from-top rows ${TREE_TOP}..${TREE_TOP + 287}`);
console.log(`offset.y px from atlas bottom (for Placement.tsx; from-bottom = extH - topRow):`);
console.log(`  Bamboo can:     ${extH - BAMBOO_TOP - 96}`);
console.log(`  Bamboo can't:   ${extH - BAMBOO_TOP - 192 - 96}`);
console.log(`  Tree can:       ${extH - TREE_TOP - 144}`);
console.log(`  Tree can't:     ${extH - TREE_TOP - 288 - 144}`);
