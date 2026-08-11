/**
 * process-photos.mjs — prepares `_source/photos/` for the site.
 *
 * Originals are read-only. This writes processed copies to src/assets/photos/
 * so Astro's <Image /> can emit responsive, modern-format output from them.
 *
 * Each copy is: EXIF-rotated upright, resized to a 1600px longest edge, and
 * re-encoded as JPEG at whatever quality lands it under the size budget. The
 * source PNGs are camera photos — PNG keeps them at 2–4 MB, JPEG puts every
 * one comfortably under 400 KB with no visible loss at display sizes.
 *
 * Usage: node scripts/process-photos.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, '_source', 'photos');
const OUT = join(ROOT, 'src', 'assets', 'photos');

const MAX_EDGE = 1600;
const MAX_BYTES = 400 * 1024;
const QUALITIES = [82, 76, 70, 64, 58];

/** Original file -> descriptive slug. Kept here so the originals stay untouched. */
const PHOTOS = [
  { from: 'g0.jpg', to: 'gabi-gtri-presentation.jpg' },
  { from: 'g1.png', to: 'mentoring-scout-shop.jpg' },
  { from: 'g2.png', to: 'troop-visit-robotics-shop.jpg' },
  { from: 'g3.png', to: 'camp-makecode-classroom.jpg' },
  { from: 'g4.png', to: 'camp-robot-presentations.jpg' },
  { from: 'g5.png', to: 'camp-showcase-families.jpg' },
];

await mkdir(OUT, { recursive: true });

for (const { from, to } of PHOTOS) {
  const input = await readFile(join(SRC, from));

  let output;
  let used;
  for (const quality of QUALITIES) {
    output = await sharp(input)
      .rotate() // honours the EXIF orientation tag, then drops it
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    used = quality;
    if (output.byteLength <= MAX_BYTES) break;
  }

  await writeFile(join(OUT, to), output);

  const { width, height } = await sharp(output).metadata();
  const kb = (output.byteLength / 1024).toFixed(0);
  const warn = output.byteLength > MAX_BYTES ? '  ⚠ over budget' : '';
  console.log(`  ${from} → ${to}  ${width}×${height}  q${used}  ${kb}KB${warn}`);
}

console.log(`\n${PHOTOS.length} photo(s) processed into src/assets/photos/.`);
