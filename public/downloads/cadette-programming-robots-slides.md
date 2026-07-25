---
marp: true
theme: default
paginate: true
---

# Programming Robots ⚙️
## Cadette Robotics Badge — Girls Build Bots
### Presented by your robotics mentors!

---

# The Control Loop

Every robot on Earth runs the same fundamental cycle:

```
        ┌──────────────────────────┐
        ▼                          │
     SENSE  →  THINK  →  ACT  ─────┘
                 (repeat forever, many times per second)
```

A robot is **a program running in a loop, connected to the physical world.**

---

# Trace it on a real robot 🔍

Robot vacuum:
- **SENSE:** bump sensor pressed, cliff sensor sees stairs
- **THINK:** "obstacle ahead → pick a new direction"
- **ACT:** motors reverse and turn
- **...and repeat, ~50 times per second**

**Your turn:** trace the loop for a self-driving car. What could go wrong if the loop runs too slowly?

---

# Today's programming toolkit 🧰

| Concept | What it does | Example |
|---|---|---|
| **Event** | reacts to a trigger | on sprite overlap |
| **Loop** | repeats behavior | forever: move |
| **Conditional** | makes decisions | if wall hit → turn |
| **Variable** | remembers a value | packages = 3 |

These four ideas power everything from games to Mars rovers.

---

# Build: Autonomous Warehouse Robot 🏭

In MakeCode Arcade:

1. Robot sprite in a warehouse map with walls
2. **Sense:** detect wall collisions
3. **Think:** if wall hit → change direction; track packages in a **variable**
4. **Act:** move continuously in a *forever* loop
5. Collect package sprites on overlap

---

# The Autonomy Challenge 🎯

**Make your robot collect ALL packages with ZERO keyboard input.**

Pure programmed behavior. No driving.

This is the difference between *operating* a machine and *engineering* one.

**Stretch goals:**
- 🔋 Battery variable that drains + charging station
- 🤖🤖 Second robot — avoid collisions!

---

# Code Review: How real teams work 👥

Swap laptops with a partner. On your review sheet:

1. What does this program do?
2. Point to a **conditional**. Point to a **variable**.
3. One thing you'd improve.

Then discuss — and improve your own code with their feedback.

*Every professional software team on Earth does exactly this.*

---

# What you accomplished ✅

- Explained the sense→think→act control loop
- Programmed autonomous behavior — no human input
- Used events, loops, conditionals, and variables
- Ran a real code review

**This is genuinely how robots are programmed.** FRC robots run the same logic — just in a bigger language.

---

# Level up 🚀

- **arcade.makecode.com** — finish your stretch goals
- **microbit.org** — program real hardware (~$20)
- **python.org / Codecademy** — text-based coding is your next step
- **FIRST Tech Challenge** (firstinspires.org) — program real competition robots in Java
- Ask us what programming an FRC robot is like!
