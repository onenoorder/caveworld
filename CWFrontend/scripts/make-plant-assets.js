// CAV-004: growth-frame exporter (one-off asset generation).
//
// Tree growth textures come from the individual sheets/Tree0.png..Tree14.png
// images; Tree.png remains the mature texture already in the output folder.
//   Bamboo growth assets are sourced individually from sheets/Bamboo0.png
//   through sheets/Bamboo31.png; Bamboo.png is mature frame 32.
// Contract (render doc 87407bec v3 C/D/E):
//   copy sheets/Bamboo0.png..Bamboo31.png and keep Bamboo.png as mature frame 32 at 48x96 in
//   public/textures/plants/bamboo/
//   and sheets/Tree0.png..Tree14.png at 48x144 into
//   public/textures/plants/tree/, preserving Tree.png.
//   (pitch grid exactly 48).
//
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const BAMBOO_DIR = path.join(root, 'CWFrontend/public/textures/plants/bamboo');
const TREE_DIR = path.join(root, 'CWFrontend/public/textures/plants/tree');

function exportBambooFrames() {
  fs.mkdirSync(BAMBOO_DIR, { recursive: true });
  for (let k = 0; k <= 31; k++) {
    const source = path.join(root, 'sheets', `Bamboo${k}.png`);
    const destination = path.join(BAMBOO_DIR, `Bamboo${k}.png`);
    fs.copyFileSync(source, destination);
  }
  console.log('Bamboo: copied sheets/Bamboo0.png .. sheets/Bamboo31.png; kept mature frame 32 in Bamboo.png');
}

function copyTreeFrames() {
  fs.mkdirSync(TREE_DIR, { recursive: true });
  for (let frame = 0; frame <= 14; frame++) {
    const source = path.join(root, 'sheets', `Tree${frame}.png`);
    const destination = path.join(TREE_DIR, `Tree${frame}.png`);
    fs.copyFileSync(source, destination);
  }
  for (const staleFrame of ['Tree15.png', 'Tree16.png']) {
    const destination = path.join(TREE_DIR, staleFrame);
    if (fs.existsSync(destination)) fs.unlinkSync(destination);
  }
  console.log('Tree: copied sheets/Tree0.png .. Tree14.png; kept mature Tree.png');
}

exportBambooFrames();
copyTreeFrames();

