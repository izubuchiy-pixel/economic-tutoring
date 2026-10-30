// Build-time only: export the existing SVG without changing the ET design.
// Requires sharp (available in the bundled workspace runtime); no browser/runtime dependency.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = new URL('../', import.meta.url);
const svg = await fs.readFile(new URL('favicon.svg', root));
const png = size => sharp(svg, {density: 384}).resize(size, size).png().toBuffer();
await fs.writeFile(new URL('favicon.png', root), await png(96));
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((bytes, i) => {
  const start = 6 + i * 16;
  header[start] = header[start + 1] = sizes[i];
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(bytes.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += bytes.length;
});
await fs.writeFile(new URL('favicon.ico', root), Buffer.concat([header, ...images]));
console.log(JSON.stringify({source: 'favicon.svg', png: [96, 96], ico: sizes}));
