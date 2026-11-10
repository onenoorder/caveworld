// CAV-004: cell-level occupancy map of PlacementCursors.png (48x48 grid).
// Marks each cell empty (.) or inked (#), then reports vertical empty runs
// long enough for a 1x2 (Bamboo) or 1x3 (Tree) cursor pair slot.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..', '..');
const png = PNG.sync.read(fs.readFileSync(path.join(root, 'CWFrontend/public/textures/PlacementCursors.png')));
const { width, height, data } = png;
const cols = Math.ceil(width / 48);
const rows = Math.ceil(height / 48);

const cellInked = [];
for (let r = 0; r < rows; r++) {
  const rowCells = [];
  for (let c = 0; c < cols; c++) {
    let ink = false;
    const x0 = c * 48, x1 = Math.min((c + 1) * 48, width);
    const y0 = r * 48, y1 = Math.min((r + 1) * 48, height);
    for (let y = y0; y < y1 && !ink; y++) {
      for (let x = x0; x < x1; x++) {
        if (data[(y * width + x) * 4 + 3] > 0) { ink = true; break; }
      }
    }
    rowCells.push(ink);
  }
  cellInked.push(rowCells);
}

console.log(`atlas ${width}x${height}, grid ${cols} cols x ${rows} rows (last row ${height % 48}px)`);
for (let r = 0; r < rows; r++) {
  console.log(String(r).padStart(2) + ' ' + cellInked[r].map(v => v ? '#' : '.').join(''));
}

// vertical empty runs per column
console.log('\nvertical empty runs (col: startRow-endRun length):');
for (let c = 0; c < cols; c++) {
  let start = -1;
  for (let r = 0; r <= rows; r++) {
    const empty = r < rows && !cellInked[r][c];
    if (empty && start === -1) start = r;
    if (!empty && start !== -1) {
      console.log(`col ${c}: rows ${start}-${r - 1} (len ${r - start})`);
      start = -1;
    }
  }
}

// count of stray-pixel cells: inked cells with < 20 inked pixels (likely stray)
let stray = 0;
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  if (!cellInked[r][c]) continue;
  let n = 0;
  for (let y = r * 48; y < Math.min((r + 1) * 48, height); y++)
    for (let x = c * 48; x < Math.min((c + 1) * 48, width); x++)
      if (data[(y * width + x) * 4 + 3] > 0) n++;
  if (n < 20) stray++;
}
console.log(`\ncells with <20 ink pixels (stray): ${stray}`);
