#!/usr/bin/env node
// Copies the static web app into www/, the folder Capacitor wraps into
// native iOS/Android builds. Root stays the canonical source (and the
// GitHub Pages deploy target) so there's only one copy of the app to edit.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const wwwDir = path.join(root, 'www');

const ASSETS = ['index.html', 'sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];

fs.rmSync(wwwDir, { recursive: true, force: true });
fs.mkdirSync(wwwDir, { recursive: true });

for (const asset of ASSETS) {
  fs.copyFileSync(path.join(root, asset), path.join(wwwDir, asset));
}

console.log(`Copied ${ASSETS.length} files to ${path.relative(root, wwwDir)}/`);
