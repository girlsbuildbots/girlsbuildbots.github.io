# ADDENDUM-ABOUT-PHOTOS.md — About page + site photography

This extends GABI-UPDATES.md. You are mid-Phase 2 — finish Phase 2 and its
checkpoint first. Then fold this in as follows: do the About page and photo
pipeline as **Phase 3b** (right after the Share Your Impact page, since both
touch the nav), and the per-page photo placements during Phase 5 wiring.
Same rules: build green after each step, small commits.

## New inputs I am placing in the repo
`_source/photos/` — six images, currently named g0–g5:
- g0.jpg — Gabi speaking at a GTRI podium (About portrait)
- g1.png — Gabi in Girl Scout vest + robotics shirt with a young girl, FRC banners
- g2.png — Gabi with three younger Scouts in the robotics shop
- g3.png — camp classroom, students coding MakeCode Arcade
- g4.png — Gabi presenting a small robot to campers ("Robot Presentations" screen)
- g5.png — camp showcase: kids at the mic, audience watching, LEGO kits in front

## Step 1 — Image pipeline
- Rename to descriptive slugs (e.g. gabi-gtri-presentation.jpg,
  mentoring-scout-shop.png, camp-makecode-classroom.png, …) and process:
  resize longest edge to ~1600px, compress (target <400KB each), correct
  orientation. Put processed copies in `src/assets/photos/` and use Astro's
  <Image /> for responsive output. Do not modify the `_source/photos/` originals.
- ALT TEXT rules (also applies to captions): descriptive but **no minors'
  names ever**; refer to "a young Scout," "campers," etc. Gabi may be named.

## Step 2 — /about/ page ("About Gabi")
Create /about/ with this content — the prose below is FINAL, use verbatim
(fix nothing, it's her voice):

Title: About Gabi
Photo: g0 (GTRI podium), prominent — right-aligned float or top hero, your
call to match Starlight's look. Caption: "Presenting at Georgia Tech Research
Institute."

Body (verbatim):
"Hi! I'm Gabi, and Girls Build Bots is my Girl Scout Gold Award project
designed to help more girls discover robotics, engineering, and STEM through
hands-on learning.

I created Girls Build Bots after seeing how much a single positive experience
can change a young student's confidence and make STEM feel like something they
belong in. The project combines official Girl Scout badge requirements with
hands-on robotics activities, giving girls an opportunity to build, program,
experiment, and earn badges while discovering what STEM can look like.

My interest in engineering began with LEGO and grew into robotics, programming,
and eventually autonomous systems. Through Walton Robotics, my STEM Engineering
Academy, and research at Georgia Tech Research Institute, I've explored
mechanical, electrical, and computer engineering. But some of my favorite
experiences have not been building robots myself—they've been helping someone
else discover that they can build one too.

For several years, I've mentored younger robotics students through FIRST LEGO
League and other outreach programs. As a girl in a field where I am often one
of the few girls in the room, I especially wanted to create those same
opportunities for younger Girl Scouts.

That idea became Girls Build Bots. I created the curriculum, tested activities
with Girl Scouts, and worked with my robotics team to turn the project into a
resource that can continue beyond my Gold Award. I've also loved learning
website development and finding new ways to make the curriculum engaging and
accessible.

My goal is not just to teach girls how to build a robot, but to help them
leave thinking, 'I can do this.'"

Below the body, a styled testimonial blockquote (verbatim):
"Gabi's curriculum made our summer camp more engaging by giving students
hands-on robotics activities connected to Girl Scout badges. I'm excited to
continue using her curriculum at our GirlsFIRST events and give even more
girls the opportunity to discover STEM."
— Dom Wilson, Outreach Director, Walton Robotics

Footer of the page: a link "Connect with Gabi on LinkedIn" →
https://www.linkedin.com/in/gabriella-angryk/ (rel="noopener", new tab).

Nav: add "About" to the site nav/top bar (with Share Your Impact from
Phase 3). Also link /about/ from the landing page — swap the landing's
"created by Gabriella Angryk" sentence in "Why this exists" to link to /about/.

## Step 3 — Photo placements across the site (during Phase 5 wiring)
- Landing page, "Why this exists" section: g1, sized to sit beside/above the
  card. Caption: "Every workshop pairs Scouts with robotics-team mentors."
- Landing page, "How a workshop works" section: g3.
  Caption: "Campers building their first programs in MakeCode Arcade."
- /pairing/: g2 near the top. Caption: "Troop meets team at the Walton
  Robotics shop."
- /share-your-impact/: g4 and g5 (side by side or stacked). Captions:
  "Robot presentations at summer camp." / "Campers showcase their builds for
  families." These photos SHOW the impact the page asks teams to report.
- Do not place photos on badge pages — they stay clean and curricular.

## Acceptance additions (fold into Phase 5 acceptance)
- /about/ renders with photo, full verbatim text, testimonial, LinkedIn link;
  present in nav.
- All six photos render responsive and compressed; every img has alt text;
  no minor is named anywhere.
- Build green; no layout overflow on mobile widths (spot-check the landing
  sections with photos at ~375px).
