# Girls Build Bots — Starlight Migration Brief

## What this project is
A Girl Scout Gold Award project website: it pairs Girl Scout troops with FIRST
robotics teams and hosts a STEM badge library (62 badges across Brownies,
Juniors, Cadettes) with teaching curriculum. The finished site deploys to
GitHub Pages at https://girlsbuildbots.github.io (root — no base path needed).

## Source material (do not edit; read only)
- `_source/index.html` — the complete current site. **All badge content lives in
  the `LEVELS` JavaScript object inside its `<script>` tag** (levels → families →
  badges, with about text, meeting plans, resource links, checklists). The `R`
  object above it maps resource keys to labels/URLs. Parse these
  programmatically; do not retype content.
- `_source/*-robotics-curriculum.md` — 3 full curriculum docs (downloads).
- `_source/*-slides.md` — 9 Marp slide decks (downloads).
- `_source/resource-guide.md` — planning guide (download).

## Migration plan

### 1. Content structure
Write a Node script (`scripts/import-badges.mjs`) that parses the LEVELS object
from `_source/index.html` and generates one MDX page per badge under
`src/content/docs/<level>/<badge-slug>.mdx`. Each page preserves this section
order:
1. **About this badge** (the `about` text; for full-type badges also the
   "Scouts will learn" list)
2. **Official requirements** — an `:::note` aside linking the Volunteer Toolkit
   (https://mygs.girlscouts.org), the Girl Scout Shop STEM section, and the
   Activity Zone, with the "verify against official steps" disclaimer. Never
   reproduce official GSUSA requirement text.
3. **Meeting plan** (full badges: duration/ratio chips, activities, materials;
   lite badges: the `meeting` paragraph)
4. **Teach this badge / Resources** — download links (full badges) or the
   `resources` link list (lite badges)
5. **Completion checklist** (full badges only) — as a task list
6. **Review form** — Formspree POST form with hidden `level` and `badge`
   fields, 1–5 rating, role select, textarea. Build it once as
   `src/components/ReviewForm.astro` and embed per page.

### 2. Sidebar
Configure `astro.config.mjs` sidebar: top-level groups Brownies (22 badges),
Juniors (24), Cadettes (16); nested groups per badge family exactly as in
LEVELS (Robotics, Coding for Good, Cybersecurity, Automotive Engineering,
Mechanical Engineering, Science & Nature / Math in Nature / Science &
Investigation / Digital Life & Media, Careers). Use `collapsed: true` for
families so the sidebar stays scannable.

### 3. Landing page
Replace the default splash (`src/content/docs/index.mdx`, template: splash):
- Hero: title "Girls Build Bots", tagline about earning STEM badges with real
  robots and mentors; actions → "Pair up a troop & team" (links to /pairing/)
  and "Browse the badge library" (links to /brownies/).
- Cards (Starlight `<CardGrid>`): Why this exists · How a workshop works ·
  The badge library by level. Pull copy from `_source/index.html`'s home page.
- Create `/pairing/` page containing the pairing hub content: the two
  find-each-other cards (FIRST team search, council finder links) and the
  pairing form (same Formspree pattern, hidden field form_type=pairing-request,
  fields: role, name, email, troop/team number, location, levels, badges,
  message). Build as `src/components/PairingForm.astro`.
- Create `/resources/` page from the Resources tab content, with a downloads
  section linking every file in step 4.

### 4. Downloads
Copy all `_source/*.md` content files to `public/downloads/` and link them
with absolute paths (`/downloads/<file>.md`). Do not run them through the
content pipeline.

### 5. Branding
- Accent color: Girl Scout green `#00743F` (set via Starlight custom CSS
  `src/styles/custom.css`, both light and dark palettes).
- Level accent tints where feasible: Brownies `#7A4A21`, Juniors `#00743F`,
  Cadettes `#8C6F3F` (e.g., a small colored badge/pill on each page's header —
  keep it subtle; Starlight's own design leads).
- Site title "Girls Build Bots"; add the footer disclaimer from
  `_source/index.html` (not an official GSUSA resource; FIRST trademark note)
  via component override of Footer.

### 6. Deployment
- Add `.github/workflows/deploy.yml` using `withastro/action@v3` +
  `actions/deploy-pages@v4` (the official Astro→Pages recipe), triggering on
  push to main.
- `astro.config.mjs`: `site: 'https://girlsbuildbots.github.io'` — no `base`.
- Verify `npm run build` passes before every commit.

### 7. Acceptance checks
- All 62 badge pages exist and appear in the sidebar under the right family.
- Landing, /pairing/, /resources/ render; both forms POST to Formspree
  placeholders (`YOUR_PAIRING_FORM_ID`, `YOUR_REVIEW_FORM_ID`) — leave the
  placeholders; a human will swap in real IDs.
- Every download link resolves in the built site (`npm run build && npx serve
  dist` spot-check).
- Built-in Starlight search finds badges by name.
- No content invented: every badge page's text traces to the LEVELS object.

## Working agreements
- Small commits with clear messages; Gabi reviews and commits.
- Never modify `_source/`.
- If the LEVELS parse is ambiguous anywhere, ask rather than guess.
