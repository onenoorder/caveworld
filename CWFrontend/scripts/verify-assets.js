// CAV-004: verify the master cursor atlas and generated plant textures.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..', '..');
const png = PNG.sync.read(fs.readFileSync(path.join(root, 'CWFrontend/public/textures/PlacementCursors.png')));
const { width, height, data } = png;
console.log(`atlas ${width}x${height}`);
if (width !== 1163 || height !== 1449) {
  console.error('UNEXPECTED ATLAS DIMENSIONS');
  process.exit(1);
}

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
console.log(fileStats('Bamboo31.png', 'plants/bamboo'));
console.log(fileStats('Bamboo.png', 'plants/bamboo'));
console.log(fileStats('Tree0.png', 'plants/tree'));
console.log(fileStats('Tree14.png', 'plants/tree'));
console.log(fileStats('Tree.png', 'plants/tree'));
