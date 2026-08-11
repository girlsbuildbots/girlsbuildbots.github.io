/**
 * levels.mjs — the badge tree, parsed once from `_source/index.html`.
 *
 * The library lives in the `LEVELS` object inside the source page's <script>
 * tag. That block is plain JS (no DOM access), so we slice it out and evaluate
 * it rather than re-typing any content. Nothing under `_source/` is ever
 * written to — including the 2026 trim, which is applied here on the way out.
 *
 * Consumers: scripts/import-badges.mjs (Robotics pages, level overviews,
 * sidebar) and scripts/import-lesson-plans.mjs (the 27 lesson-plan pages).
 */

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DOCS = join(ROOT, 'src', 'content', 'docs');
const SOURCE = join(ROOT, '_source', 'index.html');

/* ------------------------------------------------------------------- trim */

/**
 * The library was cut to the families a robotics team can actually staff:
 * Robotics, Coding for Good, Cybersecurity, Automotive Engineering (Brownies
 * and Juniors) and STEM Career Exploration — 13/13/10 badges.
 *
 * A family listed as ALL keeps every badge; an object keeps only the listed
 * badges and may rename the family. Families absent from the map are dropped.
 */
const ALL = Symbol('keep every badge');
const KEEP = {
  brownies: {
    Robotics: ALL,
    'Coding for Good': ALL,
    Cybersecurity: ALL,
    'Automotive Engineering': ALL,
    Careers: ALL,
  },
  juniors: {
    Robotics: ALL,
    'Coding for Good': ALL,
    Cybersecurity: ALL,
    'Automotive Engineering': ALL,
    // Also held Digital Leadership and Entertainment Technology; with those
    // gone the family is just the careers badge, so it takes the Careers name
    // the other two levels use.
    'Digital Life & Careers': {
      name: 'Careers',
      note: 'Single badge',
      badges: ['STEM Career Exploration'],
    },
  },
  cadettes: {
    Robotics: ALL,
    'Coding for Good': ALL,
    Cybersecurity: ALL,
    Careers: ALL,
  },
};

/** Level taglines advertised families that no longer exist. */
const TAGLINE = {
  juniors:
    'Real programming logic and structured design. Juniors write programs with loops and events, run the full engineering design process, dig into how networks and data really work, and start seeing themselves in STEM careers.',
  cadettes:
    'Real engineering and real science. Cadettes program autonomous behavior, build and ship apps, investigate cybersecurity and digital forensics, and pitch their work to real audiences.',
};

/* ---------------------------------------------------------------- helpers */

/** The source strings are HTML-escaped (they were destined for innerHTML). */
export const decode = (s) =>
  String(s)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ');

/** Decoded text, made safe to drop into MDX prose. */
export const t = (s) => decode(s).replace(/([{}<>])/g, '\\$1');

/** Decoded text for YAML frontmatter values (always emitted double-quoted). */
export const yaml = (s) => `"${decode(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** First sentence of a decoded string, for page descriptions. */
export const firstSentence = (s) => {
  const text = decode(s).trim();
  const end = text.search(/\.(\s|$)/);
  return end === -1 ? text : text.slice(0, end + 1);
};

export const slugify = (s) =>
  decode(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** "Brownies" -> "Brownie", matching the source's officialBox() wording. */
export const singular = (levelName) => levelName.slice(0, -1);

/** The shared VTK / Shop / Activity Zone aside. Never restates official steps. */
export function officialRequirements(levelName, badgeTitle, R) {
  return `:::note[Official requirements]
The step-by-step requirements for the ${t(singular(levelName))} ${t(badgeTitle)} badge are
published by Girl Scouts of the USA. Troop leaders access them free in the
[Volunteer Toolkit](${R.vtk.url}), or purchase the badge and requirement pamphlet
from the [Girl Scout Shop](${R.shopStem.url}). Free sample activities for many
badges are on the [Girl Scout Activity Zone](${R.zone.url}).

*Always verify workshop activities against the official steps before awarding the badge.*
:::`;
}

/* ------------------------------------------------------------------- load */

function trim(LEVELS) {
  for (const [levelKey, level] of Object.entries(LEVELS)) {
    const keep = KEEP[levelKey];
    if (!keep) throw new Error(`No KEEP entry for level "${levelKey}"`);
    if (TAGLINE[levelKey]) level.tagline = TAGLINE[levelKey];

    level.families = level.families.flatMap((fam) => {
      const rule = keep[decode(fam.name)];
      if (!rule) return [];
      if (rule === ALL) return [fam];
      fam.badges = fam.badges.filter((b) => rule.badges.includes(decode(b.title)));
      if (rule.name) fam.name = rule.name;
      if (rule.note) fam.note = rule.note;
      return [fam];
    });

    const kept = level.families.map((f) => decode(f.name));
    const missing = Object.entries(keep)
      .map(([name, rule]) => (rule !== ALL && rule.name ? rule.name : name))
      .filter((name) => !kept.includes(name));
    if (missing.length) {
      throw new Error(`KEEP names not found in ${levelKey}: ${missing.join(', ')}`);
    }
  }
  return LEVELS;
}

/** Pull `R` + `LEVELS` out of the source page, trimmed to the current library. */
export async function loadLevels() {
  const html = await readFile(SOURCE, 'utf8');
  const start = html.indexOf('/* ==================== SHARED RESOURCES');
  const end = html.indexOf('/* ==================== RENDERERS');
  if (start === -1 || end === -1) {
    throw new Error('Could not locate the LEVELS data block in _source/index.html');
  }
  const code = html.slice(start, end);
  // eslint-disable-next-line no-new-func -- the sliced block is data + pure helpers
  const { R, LEVELS } = new Function(`${code}\nreturn { R, LEVELS };`)();
  return { R, LEVELS: trim(LEVELS) };
}

/** Flat list of every kept badge, with its level and family attached. */
export async function loadBadges() {
  const { R, LEVELS } = await loadLevels();
  const badges = [];
  for (const [levelKey, level] of Object.entries(LEVELS)) {
    for (const family of level.families) {
      for (const badge of family.badges) {
        badges.push({ badge, family, level, levelKey, slug: slugify(badge.title) });
      }
    }
  }
  return { R, LEVELS, badges };
}
