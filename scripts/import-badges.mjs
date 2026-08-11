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

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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

/**
 * Optional photo on a level overview, matching the level's age range. Reuses
 * shots already published elsewhere on the site; alt text and captions are kept
 * identical to those placements so the same image never gets two descriptions.
 * Juniors have none — every photo is in use and repeating a third would crowd
 * the page.
 */
const LEVEL_PHOTO = {
  brownies: {
    file: 'mentoring-scout-shop',
    align: 'center', // portrait
    alt: "Gabi, in her Girl Scout vest and robotics team shirt, standing with a young Scout in the team's shop beneath FIRST Robotics Competition banners.",
    caption: 'Every workshop pairs Scouts with robotics-team mentors.',
  },
  cadettes: {
    file: 'camp-robot-presentations',
    align: 'full', // landscape
    alt: "Gabi holding a small robot for a group of campers gathered around her, a 'Robot Presentations' slide on the screen behind.",
    caption: 'Robot presentations at summer camp.',
  },
};

/** "junior-robotics-curriculum.md" -> "junior-robotics-curriculum". */
const stem = (file) => file.replace(/\.md$/, '');

/** True when the badge's page is owned by scripts/import-lesson-plans.mjs. */
const hasLessonPlan = (levelKey, slug) =>
  existsSync(join(ROOT, '_source', 'lesson-plans', `${levelKey.slice(0, -1)}-${slug}.md`));

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

- [**PLAN** — Full ${t(singular(level.name))} Robotics curriculum (PDF)](/downloads/lesson-plans/${stem(level.curriculum)}.pdf)
- [**PLAN** — Full ${t(singular(level.name))} Robotics curriculum (PowerPoint)](/downloads/lesson-plans/${stem(level.curriculum)}.pptx)
- [**SLIDES** — Presentation deck (PDF)](/downloads/slides/${stem(badge.slides)}.pdf)
- [**SLIDES** — Presentation deck (PowerPoint)](/downloads/slides/${stem(badge.slides)}.pptx)
- [**GUIDE** — Resource guide + planning checklist (PDF)](/downloads/resource-guide.pdf)

The markdown sources are in [Resources & downloads](/resources/) — the decks are
Marp-compatible, so you can present them with the free Marp extension for VS
Code or read them as a teaching script.

<ShareCallout />`;
}

function badgePage(badge, level, levelKey, family, R) {
  // Every badge this script still owns is a Robotics badge with a full teaching
  // kit; the source's "lite" badges all have lesson plans now and are built by
  // import-lesson-plans.mjs instead. Fail loudly rather than emit a stub.
  if (badge.type !== 'full') {
    throw new Error(
      `${levelKey}/${slugify(badge.title)} is a "${badge.type}" badge with no lesson plan — ` +
        'add one to _source/lesson-plans/ so it gets a full page.'
    );
  }

  return `---
title: ${yaml(badge.title)}
description: ${yaml(firstSentence(badge.about))}
level: ${levelKey.slice(0, -1)}
---

import { Badge } from '@astrojs/starlight/components';
import LevelPill from '../../../components/LevelPill.astro';
import ShareCallout from '../../../components/ShareCallout.astro';
import ReviewForm from '../../../components/ReviewForm.astro';

<LevelPill level="${levelKey}" family=${yaml(family.name)} icon="${badge.ico}" />

${fullBadgeBody(badge, level, R)}

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

  const photo = LEVEL_PHOTO[levelKey];

  return `---
title: ${yaml(`${level.name} STEM Badges`)}
description: ${yaml(`${level.grades} · ${badgeCount} STEM badges. ${firstSentence(level.tagline)}`)}
level: ${levelKey.slice(0, -1)}
---

import { Badge } from '@astrojs/starlight/components';
import LevelPill from '../../../components/LevelPill.astro';${
    photo
      ? `
import PhotoFigure from '../../../components/PhotoFigure.astro';
import levelPhoto from '../../../assets/photos/${photo.file}.jpg';`
      : ''
  }

<LevelPill level="${levelKey}" />

<p class="meeting-chips">
  <Badge text="🎓 ${t(level.grades)}" variant="tip" size="medium" />
  <Badge text="🏅 ${badgeCount} STEM badges" variant="tip" size="medium" />
  <Badge text="👥 ${t(level.ratio)}" variant="tip" size="medium" />
</p>

${t(level.tagline)}
${
  photo
    ? `
<PhotoFigure
  src={levelPhoto}
  align="${photo.align}"
  alt=${yaml(photo.alt)}
  caption=${yaml(photo.caption)}
/>
`
    : ''
}
## Teaching kit

- [**PLAN** — Full ${t(singular(level.name))} Robotics curriculum (PDF)](/downloads/lesson-plans/${stem(level.curriculum)}.pdf)
- [**GUIDE** — Resource guide + planning checklist (PDF)](/downloads/resource-guide.pdf)
- [**ALL** — Every plan, deck, and format](/resources/)

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

/* -------------------------------------------------------------- downloads */

/**
 * Index of every published file, for the /resources/ download tables. Robotics
 * badges share one curriculum per level; the other 27 each have their own
 * lesson plan. Both cases have a per-badge deck.
 */
function downloadsFile(LEVELS) {
  const levels = Object.entries(LEVELS).map(([levelKey, level]) => {
    const prefix = levelKey.slice(0, -1);
    const badges = level.families.flatMap((fam) =>
      fam.badges.map((badge) => {
        const slug = slugify(badge.title);
        const own = hasLessonPlan(levelKey, slug);
        return {
          title: decode(badge.title),
          ico: decode(badge.ico),
          family: decode(fam.name),
          slug,
          plan: own ? `${prefix}-${slug}` : stem(level.curriculum),
          sharedPlan: !own,
          slides: own ? `${prefix}-${slug}-slides` : stem(badge.slides),
        };
      })
    );
    return {
      key: levelKey,
      name: decode(level.name),
      grades: decode(level.grades),
      curriculum: stem(level.curriculum),
      badges,
    };
  });

  return `// GENERATED by scripts/import-badges.mjs — do not edit by hand.
export const downloads = ${JSON.stringify(levels, null, 2)};
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
      if (hasLessonPlan(levelKey, slug)) {
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
  await writeFile(join(ROOT, 'src', 'downloads.generated.mjs'), downloadsFile(LEVELS), 'utf8');
  console.log('  src/downloads.generated.mjs');
}

const total = Object.values(LEVELS).reduce(
  (n, l) => n + l.families.reduce((m, f) => m + f.badges.length, 0),
  0
);
console.log(
  `\n${written} file(s) written, ${skipped} lesson-plan page(s) left to import-lesson-plans.mjs. ${total} badges in library.`
);
