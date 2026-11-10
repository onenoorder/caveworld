// CAV-004: discriminate the Placement.tsx offset.y convention.
// Hypothesis FLIP (GPU flipY): displayed sprite region = rows
//   [H - offsetPx - repeatPx, H - offsetPx) counted from TOP.
// Hypothesis NAIVE: region = rows [offsetPx, offsetPx + repeatPx) from TOP.
// A true sprite window contains its ink with clear(ish) space just outside;
// a false window slices foreign sprites and ink continues past the edges.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..', '..');
const png = PNG.sync.read(fs.readFileSync(path.join(root, 'CWFrontend/public/textures/PlacementCursors.png')));
const { width, height, data } = png;
const H = height;

function inkBBox(x0, y0, x1, y1) { // inclusive bounds
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, count = 0;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      if (data[(y * width + x) * 4 + 3] > 0) {
        count++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
  return { count, minX, minY, maxX, maxY };
}

function probe(label, offX, offY, w, h) {
  const naive = inkBBox(offX, offY, offX + w - 1, offY + h - 1);
  const flipTop = H - offY - h;
  const flip = inkBBox(offX, flipTop, offX + w - 1, flipTop + h - 1);
  // margins: 8px ring around each window, same x range
  const ring = (y0) => inkBBox(offX, Math.max(0, y0 - 8), offX + w - 1, Math.min(H - 1, y0 - 1));
  const ringBelow = (y1) => inkBBox(offX, Math.min(H - 1, y1 + 1), offX + w - 1, Math.min(H - 1, y1 + 8));
  console.log(`--- ${label} (offX=${offX} offY=${offY} ${w}x${h}) ---`);
  console.log(`  NAIVE window rows ${offY}..${offY + h - 1}: ink ${naive.count}px bbox x${naive.minX}..${naive.maxX} y${naive.minY}..${naive.maxY}`);
  console.log(`  FLIP  window rows ${flipTop}..${flipTop + h - 1}: ink ${flip.count}px bbox x${flip.minX}..${flip.maxX} y${flip.minY}..${flip.maxY}`);
  const nAbove = ring(offY), nBelow = ringBelow(offY + h - 1);
  const fAbove = ring(flipTop), fBelow = ringBelow(flipTop + h - 1);
  console.log(`  NAIVE margins: above ${nAbove.count}px, below ${nBelow.count}px`);
  console.log(`  FLIP  margins: above ${fAbove.count}px, below ${fBelow.count}px`);
}

// TinyHouse can (2x2): offX 483, offY 1264
probe('TinyHouse can', 483, 1264, 96, 96);
// TinyHouse can't: offX 386, offY 1264
probe('TinyHouse can\'t', 386, 1264, 96, 96);
// MediumHouse can (3x3=144x96? actually height 3 width 2 -> repeat y=144 x=96): offX 871, offY 1305
probe('MediumHouse can', 871, 1305, 96, 144);
// HugeHouse can (4x5 -> repeat 192x240): offX 915, offY 0
probe('HugeHouse can', 915, 0, 240, 192);
// Dig can (1x1): offX 1017, offY 1352
probe('Dig can', 1017, 1352, 48, 48);
// Woodworks can (3x5): offX 627, offY 630
probe('Woodworks can', 627, 630, 240, 144);
