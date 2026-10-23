# Girls Build Bots — Cadette Robotics Badge Curriculum
### A badge-aligned workshop guide for robotics outreach events
**Level:** Cadettes (Grades 6–8) · **Badges covered:** Programming Robots, Designing Robots, Showcasing Robots
**Format:** One full-day camp (6–7 hours) or three 2-hour sessions · **Ratio:** 1 mentor per 5–6 Scouts

> **Troop Leaders:** This curriculum is designed to *align with* the Cadette Robotics badge series. Official badge requirements are available in your Girl Scout Volunteer Toolkit (VTK). Please verify completed activities against the official steps before awarding badges. Badges are purchased by troops through your council shop.

---

## Big Ideas for Cadettes

Cadettes can handle **real engineering thinking**. They should leave able to:

1. Explain the **sense → think → act** control loop and trace it through a real robot's behavior.
2. Program with **conditionals, variables, loops, and events** — and read someone else's code.
3. Design an **assistive robot prototype** for a real human need, with documented trade-offs.
4. Present technical work to a non-technical audience — the core skill of every engineer.

**Vocabulary:** control loop, conditional, variable, algorithm, feedback, sensor fusion, prototype, constraint, trade-off, iteration, assistive technology.

---

## Module 1: Programming Robots (2 hours)

**Badge theme:** Understanding how robots are programmed and building programs with real logic structures.

### Materials
- Laptops with **MakeCode Arcade** (arcade.makecode.com); micro:bit boards if available
- Projector; printed "control loop" diagram (sense → think → act, looping forever)
- Optional: any programmable robot the team owns for live demos

### Activity 1.1 — The Control Loop (20 min)
Start with a real robot behavior (a line-following robot, a robot vacuum, or the team's FRC robot in auto mode). Trace it on the control loop diagram: *What does it sense? What decision does it make? What action results? How fast does this loop run?* Key insight for Cadettes: **a robot is a program running in a loop, connected to the physical world.**

### Activity 1.2 — Program a Simulated Robot (60 min)
Progressive MakeCode Arcade build simulating an autonomous robot:
1. **Setup:** a robot sprite in a warehouse tilemap with walls
2. **Sensing:** detect wall collisions (*on hit wall*)
3. **Thinking:** conditional logic — **if** wall hit, **then** change direction; use a **variable** to track packages collected
4. **Acting:** move continuously in a *forever* loop; pick up package sprites on overlap
5. **Autonomy challenge:** make the robot collect all packages **with no keyboard input** — pure programmed behavior
6. **Stretch goals:** add a battery variable that drains and a charging station; add a second robot and avoid collisions

The autonomy challenge is the heart of the module: Scouts experience the difference between *driving* a machine and *programming* one.

### Activity 1.3 — Code Review Pairs (30 min)
Swap laptops with a partner. Each Scout reads the partner's code and answers on a review sheet: *What does this program do? Where is a conditional? Where is a variable? One thing I'd improve.* Discuss in pairs, then improve your own code with the feedback. **This mirrors how real software teams work.**

### Completion Checklist — Module 1
- [ ] Can explain the sense→think→act control loop with a real example
- [ ] Built a program using events, loops, conditionals, and a variable
- [ ] Completed the no-input autonomy challenge
- [ ] Read a peer's code and gave constructive feedback

---

## Module 2: Designing Robots (2.5 hours)

**Badge theme:** Designing and prototyping a robot that helps people overcome real obstacles.

### Materials
- Challenge briefs (one page each — see menu below)
- Prototyping supplies: cardboard, foam board, dowels, rubber bands, syringes + tubing (for hydraulic demos), craft motors if available, hot glue (mentor-supervised)
- Engineering notebooks or design documentation sheets
- Optional: LEGO Technic/Mindstorms, VEX IQ, or micro:bit + servo kits if the team owns them

### Activity 2.1 — Assistive Robotics Case Studies (25 min)
Short mentor-led exploration of real assistive robotics: robotic prosthetics and exoskeletons, companion robots for older adults, hospital delivery robots, search-and-rescue robots, agricultural robots. For each: *Whose problem does it solve? What sensors does it need? What could go wrong?* That last question introduces **constraints and safety** — engineering maturity Cadettes are ready for.

### Activity 2.2 — Design Challenge (90 min)
Teams of 2–3 choose from a challenge menu of human-centered problems:
- **Mobility assist:** help someone who can't bend down retrieve dropped objects
- **Companion:** reduce isolation for a homebound older adult
- **Home care:** remind and assist with daily medication routines
- **Rescue:** locate a person in a space too dangerous for humans to enter
- **Accessibility:** help a person with limited hand mobility open doors or containers

Deliverables (documented in the engineering notebook):
1. **Problem statement** — who is the user, what exactly is the obstacle (15 min, includes a "user empathy" interview role-play with a mentor)
2. **Two concept sketches** — force the team to consider alternatives before committing (15 min)
3. **Decision matrix** — pick a concept by scoring both against 3 criteria the team chooses (cost, safety, ease of use…) (10 min)
4. **Prototype build** — physical model representing sensors, controller, actuation, and the tool that touches the user's world (40 min)
5. **Test & iterate** — run one failure-mode discussion ("what breaks first?") and make one documented design change (10 min)

### Activity 2.3 — Engineering Design Review (35 min)
Formal design review, engineering-style: each team presents to a mentor panel that asks real questions ("Why this sensor?", "What happens if the battery dies mid-task?", "How would you make it affordable?"). Teams may say "we don't know yet" — mentors model that this is a legitimate engineering answer, followed by "here's how we'd find out."

### Completion Checklist — Module 2
- [ ] Analyzed real assistive robots and their users
- [ ] Documented a problem statement for a specific user
- [ ] Compared multiple concepts using a decision matrix
- [ ] Built a prototype and made one documented iteration
- [ ] Defended the design in a review

---

## Module 3: Showcasing Robots (2 hours)

**Badge theme:** Sharing robot designs publicly and connecting to the robotics community.

### Materials
- Prototypes and engineering notebooks from Module 2
- Presentation tools: poster boards or slides
- FRC robot for demo; info about FIRST programs (FLL, FTC, FRC) and how to join

### Activity 3.1 — Pathways Into Robotics (25 min)
The high school team presents the robotics ecosystem: FIRST programs by age, what a build season is like, team roles beyond building (programming, CAD, strategy, business, outreach — Cadettes should hear that *strategy directors exist*), and how robotics connects to careers (mechatronics, CS, biomedical engineering). Live FRC robot demo with a "how it works" teardown talk.

### Activity 3.2 — Prepare the Public Pitch (50 min)
Teams prepare a 3-minute pitch aimed at a **non-technical audience** (imagine pitching to a city council or a school board for funding):
1. **Hook:** the human story — who needs this and why
2. **Solution:** the robot, explained without jargon (mentors flag jargon during rehearsal)
3. **Evidence:** what testing/iteration showed
4. **Ask:** what the team would need to build the real thing

Two full rehearsals with mentor feedback on clarity, pacing, and eye contact. Every team member has a speaking role.

### Activity 3.3 — Public Showcase (35 min)
Present to the largest audience available — parents at pickup, troop leaders, or a joint session with the younger levels (Cadettes presenting to Brownies is a powerful role-model moment that also deepens the Cadettes' own mastery). Audience Q&A after each pitch.

### Wrap-Up (10 min)
Reflection + next steps: hand out information about local FIRST teams and how to join or start one. Troop leaders confirm badge completion against the VTK.

### Completion Checklist — Module 3
- [ ] Learned about FIRST programs, team roles, and robotics career paths
- [ ] Prepared a jargon-free pitch with a human-centered hook
- [ ] Presented publicly and handled audience questions
- [ ] Identified a next step to continue in robotics

---

## Mentor Guide (High School Robotics Students)

- **Treat Cadettes as junior colleagues,** not kids. Middle schoolers disengage instantly when talked down to.
- **Share your own failures.** "Our robot bricked at competition because of one line of code" is the most credible teaching you can do.
- **Push on the 'why.'** Cadettes can defend design decisions — expect them to.
- **Near-peer power:** you are 3–5 years older than them. You are the most persuasive evidence in the room that they belong in robotics. Say so explicitly: "I started exactly where you are."
- **Recruit.** Every Cadette leaves with a concrete way to keep going (a team to join, a program to try, your team's contact info).

## Pre/Post Survey (Impact Measurement)
1–5 scale, before and after:
1. I can explain how a robot senses, thinks, and acts.
2. I can write a program with conditionals and variables.
3. I feel confident presenting technical ideas to a group.
4. I can see myself in a STEM career.
5. I know a concrete next step to continue in robotics. *(post-only)*

Report average change per question; question 5's yes-rate is your sustainability metric.

---

*Created for the "Girls Build Bots" Girl Scout Gold Award project. This is an original curriculum aligned to the Cadette Robotics badge series; official requirements © Girl Scouts of the USA, available to troop leaders in the Volunteer Toolkit.*
