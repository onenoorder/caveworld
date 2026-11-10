// CAV-004: bottom-region + alpha forensics for PlacementCursors.png.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..', '..');
const png = PNG.sync.read(fs.readFileSync(path.join(root, 'CWFrontend/public/textures/PlacementCursors.png')));
const { width, height, data } = png;

function alphaAt(x, y) { return data[(y * width + x) * 4 + 3]; }

// Exact ink bounding box of the whole atlas
let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (alphaAt(x, y) > 0) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
console.log(`ink bbox: x ${minX}..${maxX}, y ${minY}..${maxY} (image ${width}x${height})`);

// Ink profile of rows 1380..1448: per row, count inked px and first/last ink x
console.log('\nrow-by-row (y: count, firstX..lastX) for y>=1380:');
for (let y = 1380; y < height; y++) {
  let count = 0, first = -1, last = -1;
  for (let x = 0; x < width; x++) {
    if (alphaAt(x, y) > 0) { count++; if (first === -1) first = x; last = x; }
  }
  if (count > 0) console.log(`${y}: ${count} px, ${first}..${last}`);
}

// Alpha histogram over the whole atlas (bucketed)
const buckets = new Array(9).fill(0);
for (let i = 3; i < data.length; i += 4) {
  const a = data[i];
  const bucket = Math.min(8, Math.floor(a / 32));
  buckets[bucket]++;
}
console.log('\nalpha histogram (0-31, ..., 224-255):', buckets.join(', '));

// Sample: alpha values inside a known cursor fill (TinyHouse can-place at 10*48+3, 26*48+8)
console.log('sample alphas in TinyHouse cursor interior (x 500, y 1265..1270):',
  [1265, 1266, 1267, 1268, 1269, 1270].map(y => alphaAt(500, y)).join(','));
console.log('sample alphas at right edge (x 1160, y 700..705):',
  [700, 701, 702, 703, 704, 705].map(y => alphaAt(1160, y)).join(','));
