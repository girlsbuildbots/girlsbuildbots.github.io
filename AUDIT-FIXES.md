# Audit Response — Verify, then Fix

An external audit of https://girlsbuildbots.github.io flagged the issues below.
**Important context:** the audit may have been run against an earlier FAILED deploy
(the first two GitHub Actions runs failed on a Node version error; only the third
succeeded). So several "critical 404" findings are probably stale, not real bugs.

**Your job: verify each claim against the CURRENT source and the CURRENT live
site before changing anything. Fix what is genuinely broken. For anything that is
already correct, report it as "already fine — no change" rather than inventing a
fix.** Do not modify `_source/`. Run `npm run build` after changes and confirm it
stays green. Group changes into small commits with clear messages.

---

## Part A — VERIFY FIRST (likely already fine)

### A1. Subpage 404s (/pairing/, /brownies/, /juniors/, /cadettes/, /resources/)
The audit says all of these return 404. We believe this is false — the last build
reported 69 pages with 0 errors. Verify:
- Run `npm run build`, then list `dist/` and confirm each of these exists:
  `dist/pairing/index.html`, `dist/brownies/index.html`, `dist/juniors/index.html`,
  `dist/cadettes/index.html`, `dist/resources/index.html`, plus a sample badge page
  like `dist/brownies/programming-robots/index.html`.
- Confirm `astro.config.mjs` has `site: 'https://girlsbuildbots.github.io'` and NO
  `base` set (root deploy — a stray `base` is the usual real cause of subpage 404s).
- If all files exist and config is correct, report: "Routing already correct;
  the audit's 404s reflect a pre-fix failed deploy." Do NOT restructure routes.
- Only if a file is genuinely missing: diagnose why that page didn't generate and fix
  the source page/route, not the whole pipeline.

### A2. Header navigation "missing"
The audit wants a custom `<header><nav>` with Brownies/Juniors/Cadettes/Pairing/
Resources links. Note: this is a **Starlight** site — primary navigation is the
left sidebar (already generated for all 62 badges + levels), which is standard and
accessible. Before adding a redundant top nav, confirm the sidebar renders and works.
Then, as a genuine UX improvement (not a "fix"), add these five destinations to
Starlight's top bar via the `head`/nav config or a small Header component override —
so the level overviews and Pairing/Resources are reachable in one click from any page.
Keep it consistent with Starlight's own header; do not bolt on a hand-rolled nav that
fights the theme.

### A3. Skip-link, heading anchors, sitemap `<link>`
These are Starlight-generated markup. The audit flags:
- Skip link targeting `#_top` (claims no such element).
- Heading anchor "duplicate screen-reader text."
- `<link rel=sitemap>` allegedly incomplete.
Verify against the built HTML in `dist/`. Starlight ships an accessible skip-link and
anchor pattern by default, and emits a proper sitemap link when `@astrojs/sitemap` is
configured. If the built output is already correct/accessible, report "already fine."
Only patch if the built HTML genuinely has the broken target or a missing sitemap.
Do NOT hand-edit generated markup in a way the next build will overwrite — if a real
fix is needed, fix it at the config/component level.

---

## Part B — LIKELY REAL, FIX THESE

### B1. Favicon
Verify the current favicon setup. If it's still the default Astro/Starlight icon or an
empty `href`, add a real favicon: place `favicon.svg` in `public/`, and ensure it's
referenced (Starlight uses the `favicon` option in `astro.config.mjs`). A simple,
original mark is fine — e.g., a robot or badge silhouette in Girl Scout green #00743F.
Do not use any trademarked Girl Scout or FIRST logo.

### B2. Meta description + social preview (Open Graph / Twitter)
Add site-wide SEO/social metadata. In Starlight this is done via the `head` array in
`astro.config.mjs` (and/or per-page frontmatter), NOT by hand-editing `<head>`.
Add, using Starlight's mechanism:
- `<meta name="description">` — site default: "Connecting Girl Scout troops with
  FIRST robotics teams so Scouts earn official STEM badges through hands-on,
  mentor-led workshops."
- Open Graph: `og:type=website`, `og:url=https://girlsbuildbots.github.io/`,
  `og:title=Girls Build Bots`, `og:description=STEM badges, earned the real way —
  with real robots and real mentors.`, `og:image=https://girlsbuildbots.github.io/og-image.png`
- Twitter: `twitter:card=summary_large_image` plus title/description/image to match.
- Create a simple `public/og-image.png` (1200×630) with the site name, tagline, and
  the green accent — original artwork only, no trademarked logos. If generating an
  image isn't feasible, wire up the tags and leave a clearly-named placeholder file
  plus a note to replace it.
Confirm the tags appear in built `dist/index.html` and on a sample subpage.

### B3. Sitemap generation
Ensure a real sitemap is produced: confirm `@astrojs/sitemap` is installed and added
to `astro.config.mjs` integrations (Starlight recommends it). Rebuild and confirm
`dist/sitemap-index.xml` (or `sitemap-0.xml`) exists. This also resolves the audit's
sitemap `<link>` complaint properly (at the source, not by patching markup).

---

## Part C — REPORT BACK
When done, give me a short table: each audit item → {already fine | fixed | improved},
with one line each. Then the `npm run build` result. I'll review before we commit and
push (the push auto-deploys via the workflow).

## Guardrails
- `_source/` is read-only.
- Keep the Formspree placeholders (`YOUR_PAIRING_FORM_ID`, `YOUR_REVIEW_FORM_ID`).
- No trademarked Girl Scout / GSUSA / FIRST logos in favicon or og-image.
- Don't reproduce official GSUSA badge requirement text.
- Prefer config/component-level fixes over hand-editing generated HTML.
