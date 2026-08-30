/**
 * make-decks.mjs — one command that rebuilds every distributable download.
 *
 * Gabi's workflow: edit the markdown in `_source/`, run `npm run decks`, push.
 * Filenames never change, so every link on the site keeps resolving.
 *
 * Pipeline (pandoc + LibreOffice, per GABI-UPDATES.md — no substitutes):
 *   slide decks   .md → .pptx   pandoc --slide-level=1 --reference-doc=<template>
 *                      → .pdf   soffice --convert-to pdf
 *   lesson plans  .md → .pptx   pandoc --reference-doc=<template>
 *                      → .pdf   via .docx, so the printable plan stays a
 *                               document instead of a wall of overflowing slides
 *   markdown      copied alongside, so the editable source ships too
 *
 * Outputs:
 *   public/downloads/lesson-plans/  18 badge plans + 3 Robotics curricula
 *                                  (9 are Canva-hosted — see src/canva-overrides.json)
 *   public/downloads/slides/        27 badge decks + 9 Robotics decks
 *   public/downloads/              resource guide
 *
 * Usage:
 *   npm run decks
 *   npm run decks -- --only junior-cybersecurity-basics
 */

import { readFile, writeFile, mkdir, copyFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, '_source');
const PLANS = join(SOURCE, 'lesson-plans');
const OUT = join(ROOT, 'public', 'downloads');
const TEMPLATE = join(SOURCE, 'slide-tools', 'girlsbuildbots-template.pptx');

/**
 * Badges whose lesson plan is maintained by Gabi in Canva. The same file drives
 * the badge pages and /resources/ (src/components/DownloadTable.astro), so a
 * swap is one JSON edit: the page link and this exclusion move together.
 *
 * Their markdown stays in `_source/lesson-plans/` as provenance, but we never
 * publish a generated plan for them — a stale PDF must not compete with hers.
 * Slide decks are unaffected: Canva replaces the lesson plan only.
 */
const CANVA = JSON.parse(await readFile(join(ROOT, 'src', 'canva-overrides.json'), 'utf8'));

const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

/* --------------------------------------------------------------- toolchain */

/**
 * Find a binary. Neither tool is guaranteed to be on PATH — on Windows they are
 * usually installed per-machine and only added to the PATH of shells opened
 * afterwards — so fall back to the standard install locations.
 */
function locate(name, candidates) {
  for (const path of candidates) if (existsSync(path)) return path;
  return null;
}

const PANDOC = locate('pandoc', [
  'C:/Program Files/Pandoc/pandoc.exe',
  `${process.env.LOCALAPPDATA}/Pandoc/pandoc.exe`,
  '/usr/bin/pandoc',
  '/usr/local/bin/pandoc',
]);

const SOFFICE = locate('soffice', [
  'C:/Program Files/LibreOffice/program/soffice.exe',
  'C:/Program Files (x86)/LibreOffice/program/soffice.exe',
  '/usr/bin/soffice',
  '/usr/local/bin/soffice',
  '/Applications/LibreOffice.app/Contents/MacOS/soffice',
]);

const missing = [
  !PANDOC && 'pandoc — https://pandoc.org/installing.html (winget install JohnMacFarlane.Pandoc)',
  !SOFFICE &&
    'LibreOffice — https://www.libreoffice.org/download (winget install TheDocumentFoundation.LibreOffice)',
].filter(Boolean);

if (missing.length) {
  console.error('\nCannot build the downloads. Install:\n');
  for (const m of missing) console.error(`  · ${m}`);
  console.error('\nThen re-run `npm run decks`.\n');
  process.exit(1);
}

/* ------------------------------------------------------------------- jobs */

/** Marp front-matter is presentation config; pandoc would render it as text. */
const stripFrontMatter = (md) => md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

const TMP = join(tmpdir(), 'gbb-decks');

async function collect() {
  const planFiles = (await readdir(PLANS)).filter((f) => f.endsWith('.md'));
  const sourceFiles = await readdir(SOURCE);

  const jobs = [];
  const add = (dir, file, outDir, kind) =>
    jobs.push({ src: join(dir, file), base: basename(file, '.md'), outDir, kind });

  // The badge lesson plans and their 27 companion decks.
  for (const f of planFiles) {
    if (f.endsWith('-slides.md')) add(PLANS, f, join(OUT, 'slides'), 'deck');
    else if (!CANVA[basename(f, '.md')]) add(PLANS, f, join(OUT, 'lesson-plans'), 'plan');
  }

  // The Robotics series predates the lesson plans and lives at the _source root:
  // 3 curricula and 9 decks. They get the same treatment so every badge page can
  // offer the same four formats.
  for (const f of sourceFiles) {
    if (f.endsWith('-robotics-curriculum.md')) add(SOURCE, f, join(OUT, 'lesson-plans'), 'plan');
    else if (f.endsWith('-slides.md')) add(SOURCE, f, join(OUT, 'slides'), 'deck');
    else if (f === 'resource-guide.md') add(SOURCE, f, OUT, 'plan');
  }

  return ONLY ? jobs.filter((j) => j.base === ONLY || j.base === `${ONLY}-slides`) : jobs;
}

/* ------------------------------------------------------------------- main */

await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });

const jobs = await collect();
if (!jobs.length) {
  console.error(ONLY ? `No source matched --only ${ONLY}` : 'No sources found.');
  process.exit(1);
}

for (const dir of new Set(jobs.map((j) => j.outDir))) await mkdir(dir, { recursive: true });

console.log(`pandoc:      ${PANDOC}`);
console.log(`libreoffice: ${SOFFICE}`);
console.log(`\nBuilding ${jobs.length} document(s)…\n`);

// Pass 1 — markdown copy + pandoc to the Office formats.
const toPdf = [];
for (const job of jobs) {
  const md = await readFile(job.src, 'utf8');
  await copyFile(job.src, join(job.outDir, `${job.base}.md`));

  const clean = join(TMP, `${job.base}.md`);
  await writeFile(clean, job.kind === 'deck' ? stripFrontMatter(md) : md, 'utf8');

  const pptx = join(job.outDir, `${job.base}.pptx`);
  await run(PANDOC, [
    clean,
    '-o',
    pptx,
    `--reference-doc=${TEMPLATE}`,
    // Decks are authored one slide per h1; plans are prose and let pandoc choose.
    ...(job.kind === 'deck' ? ['--slide-level=1'] : []),
  ]);

  // Decks become PDFs from the deck itself; plans go through .docx so the
  // printable version reads as a document.
  if (job.kind === 'deck') {
    toPdf.push({ file: pptx, outDir: job.outDir });
  } else {
    const docx = join(TMP, `${job.base}.docx`);
    await run(PANDOC, [clean, '-o', docx]);
    toPdf.push({ file: docx, outDir: job.outDir, cleanup: true });
  }

  console.log(`  ✓ ${job.base}  (md, pptx)`);
}

// Pass 2 — LibreOffice. Batched per output directory: one headless start-up
// instead of 60, and a private profile so it never collides with a running copy.
console.log('\nConverting to PDF…\n');
const profile = `-env:UserInstallation=file:///${join(TMP, 'lo-profile').replace(/\\/g, '/')}`;

for (const outDir of new Set(toPdf.map((p) => p.outDir))) {
  const files = toPdf.filter((p) => p.outDir === outDir).map((p) => p.file);
  for (let i = 0; i < files.length; i += 20) {
    const batch = files.slice(i, i + 20);
    await run(SOFFICE, [profile, '--headless', '--convert-to', 'pdf', '--outdir', outDir, ...batch], {
      maxBuffer: 1024 * 1024 * 32,
    });
  }
  console.log(`  ✓ ${files.length} PDF(s) → ${outDir.replace(ROOT, '.')}`);
}

// The .docx files were only a route to PDF; they are not published.
for (const { file, outDir, cleanup } of toPdf) {
  if (cleanup) await rm(join(outDir, `${basename(file, '.docx')}.docx`), { force: true });
}
await rm(TMP, { recursive: true, force: true });

console.log(`\nDone. ${jobs.length} document(s) × (md + pptx + pdf) in public/downloads/.`);
