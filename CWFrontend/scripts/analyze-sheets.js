// CAV-004 sheet measurement (one-off analysis; not part of the app build).
// Reads sheets/Bamboo Nursery.png and sheets/Tree Nursery.png, measures the
// number of 48-px growth frames per the render contract's verify gate, and
// maps PlacementCursors.png free space for the two new cursor pairs.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const root = path.resolve(__dirname, '..', '..'); // repo root (CWFrontend/..)
const TOL = 3; // px of lead/tail slack tolerated per frame cell

function loadPng(rel) {
  const buf = fs.readFileSync(path.join(root, rel));
  return PNG.sync.read(buf);
}

function columnHasInk(png, x) {
  // true if any pixel in column x has alpha > 0
  const { width, height, data } = png;
  for (let y = 0; y < height; y++) {
    if (data[(y * width + x) * 4 + 3] > 0) return true;
  }
  return false;
}

function analyzeSheet(rel) {
  const png = loadPng(rel);
  const { width, height } = png;
  const ink = [];
  for (let x = 0; x < width; x++) ink.push(columnHasInk(png, x));

  // Find contiguous ink runs (possible frames).
  const runs = [];
  let start = -1;
  for (let x = 0; x < width; x++) {
    if (ink[x] && start === -1) start = x;
    if (!ink[x] && start !== -1) {
      runs.push([start, x - 1]);
      start = -1;
    }
  }
  if (start !== -1) runs.push([start, width - 1]);

  // Try candidate frame counts: grid of ceil(width/48) cells vs runs.
  const cells = Math.ceil(width / 48);

  // A 48-grid cell "contains ink" if any column in [c*48, c*48+47] ∩ [0,width) has ink.
  const cellInk = [];
  for (let c = 0; c < cells; c++) {
    let has = false;
    for (let x = c * 48; x < Math.min((c + 1) * 48, width); x++) {
      if (ink[x]) { has = true; break; }
    }
    cellInk.push(has);
  }

  // Expected: first (cells-1) cells full of art, last cell possibly partial.
  // Count N = number of leading cells with ink (verify no gaps).
  let n = 0;
  let gapAfter = -1;
  for (let c = 0; c < cells; c++) {
    if (cellInk[c]) n++;
    else { gapAfter = c; break; }
  }

  // Measure first run and last run boundaries (px).
  const firstRun = runs[0];
  const lastRun = runs[runs.length - 1];

  // Find the widest inter-frame gap and the largest gap between runs.
  const gaps = [];
  for (let i = 1; i < runs.length; i++) {
    gaps.push([runs[i][0] - runs[i - 1][1] - 1, runs[i - 1][1] + 1, runs[i][0] - 1]);
  }

  console.log('=== ' + rel + ' ===');
  console.log(`dimensions: ${width} x ${height}`);
  console.log(`48-cells: ${cells} (occupancy: ${cellInk.map(v => v ? '#' : '.').join('')})`);
  console.log(`leading ink cells (N): ${n}, first gap after cell: ${gapAfter}`);
  console.log(`ink runs: ${runs.length}; first ${JSON.stringify(firstRun)}; last ${JSON.stringify(lastRun)}`);
  if (gaps.length) {
    gaps.sort((a, b) => b[0] - a[0]);
    console.log(`largest gaps (px, from, to): ${gaps.slice(0, 5).map(g => g.join(',')).join(' | ')}`);
  }
  console.log(`frame0 first-ink-x: ${firstRun ? firstRun[0] : 'n/a'}; last frame first-ink-x: ${lastRun ? lastRun[0] : 'n/a'}`);
  console.log('');
}

function analyzeCursors(rel) {
  const png = loadPng(rel);
  const { width, height } = png;
  const ink = [];
  for (let x = 0; x < width; x++) ink.push(columnHasInk(png, x));
  const rowInk = [];
  const rowHasInk = (y) => {
    for (let x = 0; x < width; x++) if (png.data[(y * width + x) * 4 + 3] > 0) return true;
    return false;
  };
  for (let y = 0; y < height; y++) rowInk.push(rowHasInk(y));

  const inkRows = rowInk.map(v => v ? 1 : 0).join('');
  // summarize runs of empty rows (48-row bands)
  const bands = Math.ceil(height / 48);
  console.log('=== ' + rel + ' ===');
  console.log(`dimensions: ${width} x ${height}; bands(48): ${bands}`);
  for (let b = 0; b < bands; b++) {
    let any = false;
    for (let y = b * 48; y < Math.min((b + 1) * 48, height); y++) if (rowInk[y]) { any = true; break; }
    console.log(`band ${b} (y ${b * 48}-${Math.min((b + 1) * 48, height) - 1}): ${any ? 'INK' : 'empty'}`);
  }
  // For the first 6 bands, print a compact column-occupancy map in 8-px units to spot sprite columns
  for (let b = 0; b < Math.min(bands, 8); b++) {
    let mapStr = '';
    for (let u = 0; u < Math.ceil(width / 8); u++) {
      let has = false;
      for (let x = u * 8; x < Math.min((u + 1) * 8, width); x++) {
        for (let y = b * 48; y < Math.min((b + 1) * 48, height); y++) {
          if (png.data[(y * width + x) * 4 + 3] > 0) { has = true; break; }
        }
        if (has) break;
      }
      mapStr += has ? '#' : '.';
    }
    console.log(`band ${b} columns(8px): ${mapStr}`);
  }
  console.log('');
}

analyzeSheet('sheets/Bamboo Nursery.png');
analyzeSheet('sheets/Tree Nursery.png');
analyzeCursors('CWFrontend/public/textures/PlacementCursors.png');
