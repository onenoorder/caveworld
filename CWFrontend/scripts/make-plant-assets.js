// CAV-004: growth-frame crop + cursor-pair composer (one-off asset generation).
//
// Measured facts (scripts/analyze-sheets.js, verify gate):
//   Bamboo Nursery.png 1871x96  -> N = 39 frames of 48 px (frame 38 mature)
//   Tree   Nursery.png 851x144  -> N = 18 frames of 48 px (frame 17 mature)
// Contract (render doc 87407bec v3 C/D/E):
//   export Bamboo0..37.png + Bamboo.png, Tree0..16.png + Tree.png at
//   48x96 / 48x144 into public/textures/buildings/ (pitch grid exactly 48).
//
// Cursor atlas layout (REGENERATED v2 — top append, not bottom append):
// Placement.tsx offset.y counts pixels from the atlas BOTTOM (flipY
// convention, verified by probe-offsets.js). Appending new rows at the
// bottom would invalidate every existing offset.y numerator; appending at
// the TOP keeps them valid — only textureHeight changes (1449 -> 1737).
//   ext 1163x1737, from-bottom layout:
//     rows(top)    0..143    Tree pair   (48x144) -> offset.y = 1737-0-144 = 0
//     rows(top)  144..191    empty gap (48 px)
//     rows(top)  192..287    Bamboo pair (48x96)  -> offset.y = 1737-192-96 = 1449
//     rows(top)  288..1736   old atlas (1163x1449)
// Cursor pairs (horizontal convention, TinyHouse precedent can't=386/can=483):
//   red (can't) left, white (can) right, same offset.y; pair pitch 49 px.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..', '..');
const BUILDINGS_DIR = path.join(root, 'CWFrontend/public/textures/buildings');
const ATLAS = path.join(root, 'CWFrontend/public/textures/PlacementCursors.png');

const BAMBOO = { sheet: 'Bamboo Nursery.png', frames: 39, frameH: 96 };
const TREE = { sheet: 'Tree Nursery.png', frames: 18, frameH: 144 };

function load(p) { return PNG.sync.read(fs.readFileSync(p)); }
function save(p, png) { fs.writeFileSync(p, PNG.sync.write(png)); }

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

function cropFrame(sheetPng, frameIdx, frameH) {
  const png = new PNG({ width: 48, height: frameH });
  png.data.fill(0);
  blit(png, sheetPng, frameIdx * 48, 0, 48, frameH, 0, 0);
  return png;
}

// Flat-color silhouette tint: opaque source pixels become the target color,
// semi-transparent source pixels keep their alpha scaled toward the target
// color (nearest-neighbor, no new shades — matches the hard-edged atlas art).
function tint(png, rgb) {
  const out = new PNG({ width: png.width, height: png.height });
  out.data.fill(0);
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3];
    if (a === 0) continue;
    out.data[i] = rgb[0];
    out.data[i + 1] = rgb[1];
    out.data[i + 2] = rgb[2];
    out.data[i + 3] = a;
  }
  return out;
}

function exportFrames(name, spec) {
  const sheet = load(path.join(root, 'sheets', spec.sheet));
  const last = spec.frames - 1;
  for (let k = 0; k <= last; k++) {
    const frame = cropFrame(sheet, k, spec.frameH);
    const file = k === last ? `${name}.png` : `${name}${k}.png`;
    save(path.join(BUILDINGS_DIR, file), frame);
  }
  console.log(`${name}: exported ${spec.frames} files (${last} growth frames + mature ${name}.png)`);
}

exportFrames('Bamboo', BAMBOO);
exportFrames('Tree', TREE);

// ---- cursor atlas extension (top append) --------------------------------
// Same silhouette for both states (existing convention: only fill color
// differs). Mature frame fills the 1x2/1x3 window so the footprint reads.
function makePair(spec) {
  const sheet = load(path.join(root, 'sheets', spec.sheet));
  const mature = cropFrame(sheet, spec.frames - 1, spec.frameH);
  const red = tint(mature, [255, 0, 0]);        // can't
  const white = tint(mature, [255, 255, 255]); // can
  const canvas = new PNG({ width: 97, height: spec.frameH });
  canvas.data.fill(0);
  blit(canvas, red, 0, 0, 48, spec.frameH, 0, 0);
  blit(canvas, white, 0, 0, 48, spec.frameH, 49, 0);
  return canvas;
}

const atlas = load(ATLAS);
const oldH = atlas.height; // 1449 (committed baseline)
const treePair = makePair(TREE);
const bambooPair = makePair(BAMBOO);

const extW = atlas.width;
const extH = 144 + 48 + 96 + oldH; // 1737
const ext = new PNG({ width: extW, height: extH });
ext.data.fill(0);

const TREE_TOP = 0;      // rows 0..143
const BAMBOO_TOP = 192;  // rows 192..287
const OLD_TOP = 288;     // rows 288..1736
blit(ext, treePair, 0, 0, 97, 144, 0, TREE_TOP);
blit(ext, bambooPair, 0, 0, 97, 96, 0, BAMBOO_TOP);
blit(ext, atlas, 0, 0, atlas.width, oldH, 0, OLD_TOP);
save(ATLAS, ext);

const treeOffsetY = extH - TREE_TOP - 144;   // 0
const bambooOffsetY = extH - BAMBOO_TOP - 96; // 1449
console.log(`atlas: ${atlas.width}x${oldH} -> ${extW}x${extH} (top append)`);
console.log(`Tree   1x3 pair rows(top) ${TREE_TOP}..${TREE_TOP + 143}: offset.y px(from bottom) = ${treeOffsetY}`);
console.log(`Bamboo 1x2 pair rows(top) ${BAMBOO_TOP}..${BAMBOO_TOP + 95}: offset.y px(from bottom) = ${bambooOffsetY}`);
console.log(`  can't(red) offset.x px = 0   can(white) offset.x px = 49`);
