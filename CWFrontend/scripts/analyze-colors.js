// CAV-004: average color of nursery-sheet frames (first vs last) to decide
// can/can't cursor tinting.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..', '..');

function frameStats(rel, frameIdx, frameH) {
  const png = PNG.sync.read(fs.readFileSync(path.join(root, rel)));
  const { width, data } = png;
  let r = 0, g = 0, b = 0, n = 0;
  const x0 = frameIdx * 48, x1 = x0 + 47;
  for (let y = 0; y < frameH; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] > 0) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
    }
  }
  return { n, r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

const b0 = frameStats('sheets/Bamboo Nursery.png', 0, 96);
const b38 = frameStats('sheets/Bamboo Nursery.png', 38, 96);
const t0 = frameStats('sheets/Tree Nursery.png', 0, 144);
const t17 = frameStats('sheets/Tree Nursery.png', 17, 144);
console.log('bamboo frame0 (sprout):', JSON.stringify(b0));
console.log('bamboo frame38 (mature):', JSON.stringify(b38));
console.log('tree frame0 (sprout):', JSON.stringify(t0));
console.log('tree frame17 (mature):', JSON.stringify(t17));
