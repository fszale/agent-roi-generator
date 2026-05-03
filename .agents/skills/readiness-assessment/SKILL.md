---
name: readiness-assessment
description: How the Agentic Readiness Scorecard is designed — 12 questions, 5 dimensions, 5 stages. Read this before changing anything in app/src/lib/scorecard.ts.
---

# Skill: Readiness Assessment

The scorecard is a **mirror**, not a recommendation engine. It tells
the operator where they are on the agentic curve so they can decide
what to do next. The output is observation-based, not prescriptive.

---

## The 5 dimensions

| Dimension              | What it measures |
| ---------------------- | ---------------- |
| Data Readiness         | Quality, accessibility, and governance of the data agents will rely on |
| Process Documentation  | How completely operational processes are written down |
| AI Tool Adoption       | How widely AI tooling is used and trusted across the team |
| Governance & HITL      | Whether you have review gates, audit logs, and rollback paths |
| Leadership Alignment   | Executive alignment on agentic outcomes and budget |

These five exist because, in practice, **each one independently can
veto an agent rollout**. Strong leadership without data is theater;
great data without governance is a regulatory incident waiting to
happen; etc.

---

## The 12 questions

The 12 questions are split:

- Data Readiness — 3 questions (foundational, weighted by count)
- Process Documentation — 2 questions
- AI Tool Adoption — 2 questions
- Governance & HITL — 2 questions
- Leadership Alignment — 3 questions (foundational on the human side)

Every question has **4 options** scoring 0–3 from "not started" to
"in production". The dimension score is normalized to 0–100 so the
radar reads cleanly regardless of question count.

When adding a question:
- Choose a dimension that exists. Do not invent a 6th dimension.
- Use a stable `id` (`data-4`, `lead-4`, …) — never reuse one.
- The 4 options must form a clear maturity ladder; do not write two
  options that are equally "good but different".
- Update the landing page copy if you change the count from 12.

---

## The 5 stages

Stages are derived from the **overall** score:

| Score       | Stage             | Mental model |
| ----------- | ----------------- | ------------ |
| 0–19        | Stage 1: Exploring   | Curiosity-led; nothing operational |
| 20–39       | Stage 2: Piloting    | First workflows touched by AI |
| 40–59       | Stage 3: Scaling     | Multiple workflows in production |
| 60–79       | Stage 4: Optimizing  | Production agents tuned for cost, drift, and reliability |
| 80–100      | Stage 5: Operating   | Agents are the default operating motion across functions; gains compound |

**Each stage has exactly one recommended next step**, defined in
`nextStepFor()`. The next step is concrete enough to do this week.
Vague next steps are a bug.

---

## Observations

The result includes 2–3 short observations. They follow this template:

1. **The lowest-dimension callout.** Always present. Identifies the
   constraint that will throttle every other initiative.
2. **The highest-dimension callout.** Always present. Tells the user
   which strength to lean on when picking the first agent.
3. **A conditional callout.** Pattern-matched on common shapes:
   - Tools outpacing governance → "Pause and ship an HITL policy"
   - Leadership outpacing data → "Spend 30 days on instrumentation"
   - Process documentation < 40 → "An agent inherits whatever clarity
     the SOP has — fix this first"
   - None of the above → "No single dimension is broken. Pick a high
     leverage, low blast-radius first workflow."

Observations are **markdown-allowed** — `**bold**` will be rendered.
Keep them short, direct, and operator-targeted.

---

## What the scorecard does NOT do

- It does **not** recommend a specific workflow. That's what the ROI
  generator is for.
- It does **not** assign a vendor. We don't sell a stack.
- It does **not** save anything between visits. Re-take = fresh.

---

## Versioning the scorecard

If you add a question, the dimension scoring still works (it
normalizes by question count), but the **overall score may shift**.
This is fine for new visitors but breaks shareable URLs from old
visitors.

Strategy:
- For minor additions (one question to an existing dimension), accept
  the small drift; older URLs decode but score slightly differently.
- For major restructures (renaming a dimension, changing the stage
  thresholds), bump a `v` field in the encoded payload and ship a
  legacy decoder in `share-link.ts`.

---

## Tone of the radar chart

The radar uses primary orange `#EB6928` at ~30% fill. Don't use red
for low scores or green for high — the chart is for shape, not for
emotion. The numbers next to the bars carry the value judgment.
