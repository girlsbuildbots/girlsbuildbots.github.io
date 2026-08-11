/**
 * import-badges.mjs — generates the Robotics badge pages, the level overview
 * pages and the sidebar from `_source/index.html` (see scripts/lib/levels.mjs).
 *
 * The 27 non-Robotics badges are NOT written here: their pages are built from
 * the approved lesson plans by scripts/import-lesson-plans.mjs, and this script
 * skips any badge that has a lesson plan so the two never fight over a file.
 *
 * Outputs:
 *   src/content/docs/<level>/<badge-slug>.mdx   Robotics pages only (9)
 *   src/content/docs/<level>/index.mdx          one overview page per level
 *   src/sidebar.generated.mjs                   sidebar tree for astro.config.mjs
 *
 * Usage:
 *   node scripts/import-badges.mjs                       # everything
 *   node scripts/import-badges.mjs --only brownies/programming-robots
 */

import { writeFile, mkdir, access } from 'node:fs/promises';
import { join } from 'node:path';

import {
  ROOT,
  DOCS,
  loadLevels,
  decode,
  t,
  yaml,
  slugify,
  singular,
  firstSentence,
  officialRequirements,
} from './lib/levels.mjs';

const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

/** True when the badge's page is owned by scripts/import-lesson-plans.mjs. */
async function hasLessonPlan(levelKey, slug) {
  const path = join(ROOT, '_source', 'lesson-plans', `${levelKey.slice(0, -1)}-${slug}.md`);
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------------- sections */

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

## Completion checklist

By the end of the session, each Scout:

${badge.checklist.map((x) => `- [ ] ${t(x)}`).join('\n')}

## Teach this badge

- [**SLIDES** — Presentation deck: ${t(badge.title)}](/downloads/${badge.slides})
- [**PLAN** — Full ${t(singular(level.name))} Robotics curriculum](/downloads/${level.curriculum})
- [**GUIDE** — Resource guide + planning checklist](/downloads/resource-guide.md)

Slide decks are Marp-compatible markdown — present them with the free Marp
extension for VS Code, or read them as a teaching script.

<ShareCallout />`;
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
[Resource Guide](/downloads/resource-guide.md).

<ShareCallout />`;
}

function badgePage(badge, level, levelKey, family, R) {
  const isFull = badge.type === 'full';
  const imports = [
    `import { Badge } from '@astrojs/starlight/components';`,
    `import LevelPill from '../../../components/LevelPill.astro';`,
    `import ShareCallout from '../../../components/ShareCallout.astro';`,
    `import ReviewForm from '../../../components/ReviewForm.astro';`,
  ];
  // Lite pages have no chips, so they don't need Starlight's Badge component.
  if (!isFull) imports.shift();

  return `---
title: ${yaml(badge.title)}
description: ${yaml(firstSentence(badge.about))}
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
description: ${yaml(`${level.grades} · ${badgeCount} STEM badges. ${firstSentence(level.tagline)}`)}
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
let skipped = 0;
for (const [levelKey, level] of Object.entries(LEVELS)) {
  const badgeCount = level.families.reduce((n, f) => n + f.badges.length, 0);
  const dir = join(DOCS, levelKey);
  await mkdir(dir, { recursive: true });

  for (const family of level.families) {
    for (const badge of family.badges) {
      const slug = slugify(badge.title);
      const path = `${levelKey}/${slug}`;
      if (ONLY && ONLY !== path) continue;
      if (await hasLessonPlan(levelKey, slug)) {
        skipped++;
        continue;
      }
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
console.log(
  `\n${written} file(s) written, ${skipped} lesson-plan page(s) left to import-lesson-plans.mjs. ${total} badges in library.`
);
