#!/usr/bin/env node
const { mkdirSync } = require('fs');
const { resolve } = require('path');
const { execFileSync } = require('child_process');

const pkg = require('../package.json');
const outDir = resolve(__dirname, '..', 'build');
mkdirSync(outDir, { recursive: true });
const outFile = `smart-log-viewer-${pkg.version}.vsix`;
const outPath = resolve(outDir, outFile);

console.log(`Packaging extension to ${outPath}`);
try {
  // Use a shell-based exec so Windows debugging environments can resolve `npx` reliably
  const cmd = `npx @vscode/vsce package --out "${outPath}"`;
  require('child_process').execSync(cmd, { stdio: 'inherit', shell: true });
} catch (err) {
  console.error('Packaging failed:', err && err.message ? err.message : err);
  console.error(err && err.stack ? err.stack : '');
  process.exit((err && err.status) || 1);
}
