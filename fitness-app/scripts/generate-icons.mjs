// Regenerates public/*.png icons from the source SVGs in icon-src/.
// Run with: npm run icons
import sharp from 'sharp';
import fs from 'node:fs';

const src = fs.readFileSync('icon-src/icon-source.svg');
const mask = fs.readFileSync('icon-src/icon-maskable.svg');

await sharp(src, { density: 384 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(src, { density: 384 }).resize(192, 192).png().toFile('public/pwa-192.png');
await sharp(src, { density: 384 }).resize(512, 512).png().toFile('public/pwa-512.png');
await sharp(mask, { density: 384 }).resize(512, 512).png().toFile('public/maskable-512.png');
await sharp(src, { density: 384 }).resize(32, 32).png().toFile('public/favicon-32.png');

console.log('Icons written to public/');
