/**
 * import-badges.mjs — generates Starlight content from _source/index.html.
 *
 * The badge library lives in the `LEVELS` object inside the source page's
 * <script> tag. That block is plain JS (no DOM access), so we slice it out and
 * evaluate it rather than re-typing any content. Nothing under _source/ is
 * ever written to.
 *
 * Outputs:
 *   src/content/docs/<level>/<badge-slug>.mdx   one page per badge (62)
 *   src/content/docs/<level>/index.mdx          one overview page per level
 *   src/sidebar.generated.mjs                   sidebar tree for astro.config.mjs
 *
 * Usage:
 *   node scripts/import-badges.mjs                       # everything
 *   node scripts/import-badges.mjs --only brownies/programming-robots
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, '_source', 'index.html');
const DOCS = join(ROOT, 'src', 'content', 'docs');

const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

/* ---------------------------------------------------------------- parsing */

/** Pull `R` + `LEVELS` out of the source page by evaluating the data block. */
async function loadLevels() {
  const html = await readFile(SOURCE, 'utf8');
  const start = html.indexOf('/* ==================== SHARED RESOURCES');
  const end = html.indexOf('/* ==================== RENDERERS');
  if (start === -1 || end === -1) {
    throw new Error('Could not locate the LEVELS data block in _source/index.html');
  }
  const code = html.slice(start, end);
  // eslint-disable-next-line no-new-func -- the sliced block is data + pure helpers
  return new Function(`${code}\nreturn { R, LEVELS };`)();
}

/** The source strings are HTML-escaped (they were destined for innerHTML). */
const decode = (s) =>
  String(s)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ');

/** Decoded text, made safe to drop into MDX prose. */
const t = (s) => decode(s).replace(/([{}<>])/g, '\\$1');

/** Decoded text for YAML frontmatter values (always emitted double-quoted). */
const yaml = (s) => `"${decode(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const slugify = (s) =>
  decode(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** "Brownies" -> "Brownie", matching the source's officialBox() wording. */
const singular = (levelName) => levelName.slice(0, -1);

/* ---------------------------------------------------------------- sections */

function officialRequirements(levelName, badgeTitle, R) {
  return `:::note[Official requirements]
The step-by-step requirements for the ${t(singular(levelName))} ${t(badgeTitle)} badge are
published by Girl Scouts of the USA. Troop leaders access them free in the
[Volunteer Toolkit](${R.vtk.url}), or purchase the badge and requirement pamphlet
from the [Girl Scout Shop](${R.shopStem.url}). Free sample activities for many
badges are on the [Girl Scout Activity Zone](${R.zone.url}).

*Always verify workshop activities against the official steps before awarding the badge.*
:::`;
}

function fullBadgeBody(badge, level, R) {
  return `## About this badge

${t(badge.about)}

**Scouts will learn:**

${badge.learn.map((x) => `- ${t(x)}`).join('\n')}

${officialRequirements(level.name, badge.title, R)}

## Meeting plan

<p class="meeting-chips">
  <Badge text="⏱ ${t(badge.duration)}" variant="tip" size="medium" />
  <Badge text="👥 ${t(level.ratio)}" variant="tip" size="medium" />
  <Badge text="💻 MakeCode Arcade — free" variant="tip" size="medium" />
</p>

${badge.activities.map((x) => `- ${t(x)}`).join('\n')}

**Materials:** ${t(badge.materials)}

## Teach this badge

- [**SLIDES** — Presentation deck: ${t(badge.title)}](/downloads/${badge.slides})
- [**PLAN** — Full ${t(singular(level.name))} Robotics curriculum](/downloads/${level.curriculum})
- [**GUIDE** — Resource guide + planning checklist](/downloads/resource-guide.md)

Slide decks are Marp-compatible markdown — present them with the free Marp
extension for VS Code, or read them as a teaching script.

## Completion checklist

By the end of the session, each Scout:

${badge.checklist.map((x) => `- [ ] ${t(x)}`).join('\n')}`;
}

function liteBadgeBody(badge, level, R) {
  return `## About this badge

${t(badge.about)}

${officialRequirements(level.name, badge.title, R)}

## Leading the meeting

${t(badge.meeting)}

## Best free resources

${badge.resources.map((r) => `- [${t(r.label)}](${r.url})`).join('\n')}

Planning help — mentor ratios, timing, surveys, and a 6-week checklist — is in the
[Resource Guide](/downloads/resource-guide.md).`;
}

function badgePage(badge, level, levelKey, family, R) {
  const isFull = badge.type === 'full';
  const imports = [
    `import { Badge } from '@astrojs/starlight/components';`,
    `import LevelPill from '../../../components/LevelPill.astro';`,
    `import ReviewForm from '../../../components/ReviewForm.astro';`,
  ];
  // Lite pages have no chips, so they don't need Starlight's Badge component.
  if (!isFull) imports.shift();

  return `---
title: ${yaml(badge.title)}
description: ${yaml(`${decode(badge.about).split('. ')[0]}.`)}
---

${imports.join('\n')}

<LevelPill level="${levelKey}" family=${yaml(family.name)} icon="${badge.ico}" />

${isFull ? fullBadgeBody(badge, level, R) : liteBadgeBody(badge, level, R)}

<ReviewForm
  level=${yaml(level.name)}
  badge=${yaml(badge.title)}
  id="${levelKey}-${badge.key}"
/>
`;
}

function levelIndexPage(level, levelKey, badgeCount) {
  const families = level.families
    .map((fam) => {
      const links = fam.badges
        .map((b) => `  - [${t(b.ico)} ${t(b.title)}](/${levelKey}/${slugify(b.title)}/)`)
        .join('\n');
      return `- **${t(fam.name)}** — ${t(fam.note)}\n${links}`;
    })
    .join('\n');

  return `---
title: ${yaml(`${level.name} STEM Badges`)}
description: ${yaml(`${level.grades} · ${badgeCount} STEM badges. ${decode(level.tagline).split('. ')[0]}.`)}
---

import { Badge } from '@astrojs/starlight/components';
import LevelPill from '../../../components/LevelPill.astro';

<LevelPill level="${levelKey}" />

<p class="meeting-chips">
  <Badge text="🎓 ${t(level.grades)}" variant="tip" size="medium" />
  <Badge text="🏅 ${badgeCount} STEM badges" variant="tip" size="medium" />
  <Badge text="👥 ${t(level.ratio)}" variant="tip" size="medium" />
</p>

${t(level.tagline)}

## Teaching kit

- [**PLAN** — Full ${t(singular(level.name))} Robotics curriculum](/downloads/${level.curriculum})
- [**GUIDE** — Resource guide + planning checklist](/downloads/resource-guide.md)

## Badges by family

${families}
`;
}

/* ---------------------------------------------------------------- sidebar */

function sidebarFile(LEVELS) {
  const groups = Object.entries(LEVELS).map(([levelKey, level]) => {
    const families = level.families.map((fam) => {
      const items = fam.badges
        .map((b) => `          { label: ${JSON.stringify(decode(b.title))}, slug: '${levelKey}/${slugify(b.title)}' },`)
        .join('\n');
      return `      {
        label: ${JSON.stringify(decode(fam.name))},
        collapsed: true,
        items: [
${items}
        ],
      },`;
    });
    const count = level.families.reduce((n, f) => n + f.badges.length, 0);
    return `  {
    label: ${JSON.stringify(`${decode(level.name)} (${count} badges)`)},
    items: [
      { label: 'Overview', slug: '${levelKey}' },
${families.join('\n')}
    ],
  },`;
  });

  return `// GENERATED by scripts/import-badges.mjs — do not edit by hand.
export const badgeSidebar = [
${groups.join('\n')}
];
`;
}

/* ---------------------------------------------------------------- main */

const { R, LEVELS } = await loadLevels();

let written = 0;
for (const [levelKey, level] of Object.entries(LEVELS)) {
  const badgeCount = level.families.reduce((n, f) => n + f.badges.length, 0);
  const dir = join(DOCS, levelKey);
  await mkdir(dir, { recursive: true });

  for (const family of level.families) {
    for (const badge of family.badges) {
      const path = `${levelKey}/${slugify(badge.title)}`;
      if (ONLY && ONLY !== path) continue;
      await writeFile(join(DOCS, `${path}.mdx`), badgePage(badge, level, levelKey, family, R), 'utf8');
      written++;
      console.log(`  ${path}.mdx`);
    }
  }

  if (!ONLY) {
    await writeFile(join(dir, 'index.mdx'), levelIndexPage(level, levelKey, badgeCount), 'utf8');
    written++;
    console.log(`  ${levelKey}/index.mdx`);
  }
}

if (!ONLY) {
  await writeFile(join(ROOT, 'src', 'sidebar.generated.mjs'), sidebarFile(LEVELS), 'utf8');
  console.log('  src/sidebar.generated.mjs');
}

const total = Object.values(LEVELS).reduce(
  (n, l) => n + l.families.reduce((m, f) => m + f.badges.length, 0),
  0
);
console.log(`\n${written} file(s) written. ${total} badges in source.`);
