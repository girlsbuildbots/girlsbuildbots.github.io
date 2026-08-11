/**
 * import-lesson-plans.mjs — builds a full badge page from each approved lesson
 * plan in `_source/lesson-plans/`.
 *
 * The plans are FINAL content: this script only re-orders their existing blocks
 * into the site's badge-page shape, never rewrites prose. Badge metadata (title,
 * icon, family, review-form id) still comes from the LEVELS tree so the pages
 * stay consistent with the Robotics pages and the sidebar.
 *
 * Section order, matching the Robotics pages:
 *   About this badge → Official requirements → Meeting plan → Completion
 *   checklist → Teach this badge → Share callout → Review form
 *
 * The plans' "📣 Share Your Impact" block and "Mentor Guide" are deliberately
 * NOT copied onto the page — the ask lives at /share-your-impact/ and both stay
 * in the downloadable file.
 *
 * Outputs: src/content/docs/<level>/<badge-slug>.mdx  (27 pages)
 *
 * Usage:
 *   node scripts/import-lesson-plans.mjs
 *   node scripts/import-lesson-plans.mjs --only junior-cybersecurity-basics
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';

import {
  ROOT,
  DOCS,
  loadBadges,
  decode,
  yaml,
  firstSentence,
  officialRequirements,
} from './lib/levels.mjs';

const PLANS = join(ROOT, '_source', 'lesson-plans');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx > -1 ? process.argv[onlyIdx + 1] : null;

/* ---------------------------------------------------------------- parsing */

/** Split markdown on headings of a given level into {heading, body} chunks. */
function sections(md, level) {
  const marker = new RegExp(`^${'#'.repeat(level)} `, 'm');
  const splitter = new RegExp(`^${'#'.repeat(level)} `, 'gm');
  if (!marker.test(md)) return [];
  return md
    .split(splitter)
    .slice(1)
    .map((chunk) => {
      const nl = chunk.indexOf('\n');
      return {
        heading: chunk.slice(0, nl === -1 ? chunk.length : nl).trim(),
        body: nl === -1 ? '' : chunk.slice(nl + 1),
      };
    });
}

/** Drop the `---` rules the plans use between sections, plus edge blank lines. */
const clean = (s) =>
  s
    .replace(/\n---\s*$/, '')
    .replace(/^\s+|\s+$/g, '');

/**
 * The plans are written for humans, not MDX. Nothing in them currently uses
 * characters MDX would read as JSX, and silently escaping prose would violate
 * "prose is FINAL" — so fail loudly instead if that ever changes.
 */
function assertMdxSafe(text, file) {
  const bad = text.match(/[{}]|<[a-zA-Z/]/g);
  if (bad) {
    throw new Error(
      `${file}: contains MDX-significant characters (${[...new Set(bad)].join(' ')}). ` +
        'Escape them in the page template rather than editing the plan.'
    );
  }
}

function parsePlan(md, file) {
  const h2 = sections(md, 2);

  const intro = h2.find((s) => /^The /.test(s.heading));
  const badgeSec = h2.find(
    (s) => !/^The /.test(s.heading) && !/^Mentor Guide/.test(s.heading) && !/Share Your Impact/.test(s.heading)
  );
  if (!intro || !badgeSec) throw new Error(`${file}: could not find intro / badge sections`);

  const durationMatch = badgeSec.heading.match(/^(.*?)\s*\((.+)\)$/);
  if (!durationMatch) throw new Error(`${file}: badge heading has no duration: ${badgeSec.heading}`);
  const [, badgeTitle, duration] = durationMatch;

  const ratio = md.match(/\*\*Ratio:\*\*\s*([^\n·]+)/)?.[1]?.trim();
  if (!ratio) throw new Error(`${file}: no **Ratio:** line`);

  // Everything before the first H3 in the badge section is the "Badge theme"
  // line — absent on the career badges, which have no series theme.
  const preamble = clean(badgeSec.body.split(/^### /m)[0]);
  const theme = preamble.match(/^\*\*Badge theme:\*\*.*/m)?.[0] ?? '';

  const h3 = sections(badgeSec.body, 3);
  const materials = h3.find((s) => s.heading === 'Materials');
  const checklist = h3.find((s) => /^Completion Checklist/.test(s.heading));
  const activities = h3.filter((s) => /^Activity /.test(s.heading));
  if (!materials || !checklist || !activities.length) {
    throw new Error(`${file}: missing Materials / Activities / Completion Checklist`);
  }

  // The optional robot-moment blockquote trails the last activity.
  let robotMoment = '';
  for (const activity of activities) {
    const found = activity.body.match(/^> \*\*Robot moment \(optional\):\*\*\s*(.+)$/m);
    if (found) {
      robotMoment = found[1].trim();
      activity.body = activity.body.replace(found[0], '');
    }
  }

  const checklistLead = clean(checklist.body).split('\n')[0];
  const checklistItems = clean(checklist.body)
    .split('\n')
    .filter((line) => line.startsWith('- [ ]'));

  return {
    badgeTitle: badgeTitle.trim(),
    duration: duration.trim(),
    ratio,
    theme,
    introHeading: intro.heading,
    introBody: clean(intro.body),
    materials: clean(materials.body),
    activities: activities.map((a) => ({ heading: a.heading, body: clean(a.body) })),
    robotMoment,
    checklistLead,
    checklistItems,
  };
}

/* ------------------------------------------------------------------- page */

function page(plan, { badge, family, level, levelKey }, base, R) {
  const chips = [
    `  <Badge text="⏱ ${plan.duration}" variant="tip" size="medium" />`,
    `  <Badge text="👥 ${plan.ratio}" variant="tip" size="medium" />`,
    `  <Badge text="🤖 Robot optional" variant="tip" size="medium" />`,
  ].join('\n');

  const about = [
    plan.theme,
    `### ${plan.introHeading}`,
    plan.introBody,
  ].filter(Boolean).join('\n\n');

  const robot = plan.robotMoment
    ? `\n\n:::tip[Robot moment (optional)]\n${plan.robotMoment}\n:::`
    : '';

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

## About this badge

${about}

${officialRequirements(level.name, badge.title, R)}

## Meeting plan

<p class="meeting-chips">
${chips}
</p>

${plan.activities.map((a) => `### ${a.heading}\n\n${a.body}`).join('\n\n')}${robot}

### Materials

${plan.materials}

## Completion checklist

${plan.checklistLead}

${plan.checklistItems.join('\n')}

## Teach this badge

- [**PLAN** — Lesson plan (PDF)](/downloads/lesson-plans/${base}.pdf)
- [**PLAN** — Lesson plan (PowerPoint)](/downloads/lesson-plans/${base}.pptx)
- [**SLIDES** — Presentation deck (PDF)](/downloads/slides/${base}-slides.pdf)
- [**SLIDES** — Presentation deck (PowerPoint)](/downloads/slides/${base}-slides.pptx)

The markdown sources are in [Resources & downloads](/resources/) — edit them,
re-run \`npm run decks\`, and every format regenerates.

<ShareCallout />

<ReviewForm
  level=${yaml(level.name)}
  badge=${yaml(badge.title)}
  id="${levelKey}-${badge.key}"
/>
`;
}

/* ------------------------------------------------------------------- main */

const { R, badges } = await loadBadges();
const files = (await readdir(PLANS)).filter((f) => f.endsWith('.md') && !f.endsWith('-slides.md'));

let written = 0;
for (const file of files) {
  const base = basename(file, '.md');
  if (ONLY && ONLY !== base) continue;

  const [levelPrefix, ...rest] = base.split('-');
  const levelKey = `${levelPrefix}s`;
  const slug = rest.join('-');

  const entry = badges.find((b) => b.levelKey === levelKey && b.slug === slug);
  if (!entry) throw new Error(`${file}: no badge in the library for ${levelKey}/${slug}`);

  const md = await readFile(join(PLANS, file), 'utf8');
  assertMdxSafe(md, file);
  const plan = parsePlan(md, file);

  if (plan.badgeTitle !== decode(entry.badge.title)) {
    throw new Error(`${file}: plan is "${plan.badgeTitle}" but badge is "${decode(entry.badge.title)}"`);
  }

  await writeFile(join(DOCS, levelKey, `${slug}.mdx`), page(plan, entry, base, R), 'utf8');
  written++;
  console.log(`  ${levelKey}/${slug}.mdx  ←  ${file}`);
}

console.log(`\n${written} badge page(s) built from lesson plans.`);
