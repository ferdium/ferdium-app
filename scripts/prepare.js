const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function main() {
  if (process.env.CI && process.env.CI !== 'false') {
    return;
  }

  const huskyBin = path.resolve(
    __dirname,
    '..',
    'node_modules',
    'husky',
    'bin.js',
  );

  // electron-builder prunes devDependencies before installing production
  // dependencies. In that context Husky is intentionally unavailable.
  if (!fs.existsSync(huskyBin)) {
    return;
  }

  execFileSync(process.execPath, [huskyBin], { stdio: 'inherit' });
}

main();
