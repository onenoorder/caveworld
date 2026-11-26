// CAV-004: post-generation verification of the extended cursor atlas (v2 top append).
// Re-scans the full atlas for window isolation and prints the pair windows.
// Expected layout: Tree pair rows(top) 0..143, gap 144..191, Bamboo pair
// rows(top) 192..287, old atlas rows(top) 288..1736.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..', '..');
const png = PNG.sync.read(fs.readFileSync(path.join(root, 'CWFrontend/public/textures/PlacementCursors.png')));
const { width, height, data } = png;
console.log(`atlas ${width}x${height}`);
if (width !== 1163 || height !== 1737) {
  console.error('UNEXPECTED ATLAS DIMENSIONS');
  process.exit(1);
}

function winStats(x0, y0, x1, y1) {
  let count = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, red = 0, white = 0;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      count++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (data[i] === 255 && data[i + 1] === 0) red++;
      if (data[i] === 255 && data[i + 1] === 255) white++;
    }
  return { count, minX, minY, maxX, maxY, red, white };
}

// Tree pair windows (top rows 0..143)
console.log('Tree   can\'t  window (0,0)-(47,143):', JSON.stringify(winStats(0, 0, 47, 143)));
console.log('Tree   can    window (49,0)-(96,143):', JSON.stringify(winStats(49, 0, 96, 143)));
// Bamboo pair windows (top rows 192..287)
console.log('Bamboo can\'t  window (0,192)-(47,287):', JSON.stringify(winStats(0, 192, 47, 287)));
console.log('Bamboo can    window (49,192)-(96,287):', JSON.stringify(winStats(49, 192, 96, 287)));

// isolation: gap rows between pairs must be empty in x 0..96; below the
// bamboo pair (rows 288..295) the old atlas content resumes — instead check
// the Tree-pair upper edge (nothing above) and the gap 144..191.
function rowInk(y, x0, x1) {
  let n = 0;
  for (let x = x0; x <= x1; x++) if (data[(y * width + x) * 4 + 3] > 0) n++;
  return n;
}
let gaps = 0;
for (let y = 144; y <= 191; y++) gaps += rowInk(y, 0, 96);
console.log('gap rows between Tree and Bamboo pairs (144..191, x0..96) ink:', gaps, 'px');
// old atlas intact: its previous top row is now row 288; old row 0 was
// inked (HugeHouse pair). Also the old bottom row (1448) is now row 1736.
console.log('old-atlas top row now at 288 (x0..96 ink):', rowInk(288, 0, 96), 'px');
console.log('old-atlas bottom row now at 1736 (x0..96 ink):', rowInk(1736, 0, 96), 'px');

// growth textures spot check
function fileStats(rel, subdir = 'buildings') {
  const p = PNG.sync.read(fs.readFileSync(path.join(root, 'CWFrontend/public/textures', subdir, rel)));
  let n = 0, firstX = -1, lastX = -1;
  for (let x = 0; x < p.width; x++) {
    let ink = false;
    for (let y = 0; y < p.height; y++) if (p.data[(y * p.width + x) * 4 + 3] > 0) { ink = true; break; }
    if (ink) { if (firstX === -1) firstX = x; lastX = x; n++; }
  }
  return `${rel}: ${p.width}x${p.height}, ink columns ${n} (${firstX}..${lastX})`;
}
console.log(fileStats('Bamboo0.png', 'plants/bamboo'));
console.log(fileStats('Bamboo35.png', 'plants/bamboo'));
console.log(fileStats('Bamboo.png', 'plants/bamboo'));
console.log(fileStats('Tree0.png', 'plants/tree'));
console.log(fileStats('Tree14.png', 'plants/tree'));
console.log(fileStats('Tree.png', 'plants/tree'));
