---
name: roi-scoring
description: How the deterministic ROI opportunity score is computed from a 5-step intake. Read this before changing anything in app/src/lib/scoring.ts or scoring-config.json.
---

# Skill: ROI Scoring

This skill documents **how the opportunity score is produced**. The
score is the most important number the user sees, so it must be
explainable, auditable, and stable across releases.

---

## The six dimensions

Each dimension returns a raw value `0–10`. The composite score is a
weighted average normalized to `0–100`.

| Dimension          | Weight | Inverted? | What it captures |
| ------------------ | ------ | --------- | ---------------- |
| Process Clarity    | 1.5    | no        | Length and step language in the process description |
| Data Readiness     | 2.0    | no        | Self-reported maturity of the data foundation |
| Metric Leverage    | 2.0    | no        | Magnitude of the gap between current and target metric |
| Team Capacity      | 1.0    | no        | Team-size sweet spot — mid-size scores highest |
| Complexity         | 1.5    | **yes**   | Heuristic on legacy/regulatory/integration words |
| Timeline Pressure  | 1.0    | **yes**   | "<30 days" hurts; ">12 months" is fine |

"Inverted" means a high raw value lowers the composite — e.g. high
complexity is bad for the opportunity score.

The full configuration is in
`app/src/lib/scoring-config.json`. **Always change the JSON first**,
then mirror it in `DimensionKey` and the dimension function in
`scoring.ts`.

---

## Process Clarity heuristic

Score is driven by:

- Length of the description (a 400+ char description scores 9, an
  empty one scores 1)
- Presence of step language (`step 1`, `then`, `next`, `finally`,
  numbered lists). Two or more matches grants a +1 bonus.

Why length? Operators who can describe the workflow in detail have
already done the documentation work an agent will need. Length is
proxy for thinking, not for verbosity.

## Data Readiness mapping

A direct lookup from the four-bucket dropdown:

- "Mostly manual" → 2
- "Some structured systems" → 5
- "Modern data stack" → 8
- "Real-time pipelines" → 10

This is intentionally non-linear: the gap between "Mostly manual" and
"Some structured systems" is bigger than the label suggests.

## Metric Leverage formula

```
delta = |target - current| / max(|current|, 1)
```

Then mapped:
- ≥0.5 → 10
- ≥0.3 → 8
- ≥0.15 → 6
- ≥0.05 → 4
- <0.05 → 2

If either metric isn't parseable as a number, fall back to 5 if both
fields are populated, 2 otherwise. Numeric metrics always beat fuzzy
text.

## Team Capacity peak

Mid-sized companies score highest because they have *enough* people to
run a pilot but not so many that bureaucracy crushes the iteration
loop:

- 1–10 → 4
- 11–50 → 7
- 51–200 → 9
- 201–1000 → 8
- 1000+ → 6

## Complexity heuristic

Starts at 4, adds:
- +2 if integration/legacy/SAP/ERP language appears
- +2 if compliance/regulatory/HIPAA/GDPR/PII/PHI language appears
- +1 if "manual handoff", "spreadsheet", "Excel", or "email" appears
- +1 if "real-time" or "low latency" requirements appear

Then clamped to `[0, 10]`. The complexity score also drives the
**Implementation Complexity** rating (Low/Medium/High/Very High) and
the **HITL** posture.

## Timeline Pressure mapping

A short timeline doesn't help — it forces premature autonomy. A
generous timeline doesn't hurt:

- "<30 days" → 9 (high pressure, bad)
- "30-90 days" → 5
- "3-6 months" → 2
- "6-12 months" → 1
- ">12 months" → 1

---

## Composite & stage thresholds

```
weightedSum = Σ (adjusted[k] * weight[k])
weightTotal = Σ (weight[k] * 10)
composite = round(weightedSum / weightTotal * 100)
```

Stages from `scoring-config.json#stageThresholds`:
- ≥75 → "Strong AI candidate"
- ≥55 → "Promising — needs scoping"
- ≥35 → "Pilot first"
- <35 → "Not ready yet"

These thresholds are **deliberately conservative.** A real strong
candidate is rare. Do not lower them to flatter the user.

## HITL posture

- **Continuous** if the industry/process/bottleneck text matches a
  regulated keyword (`hipaa`, `compliance`, `audit`, `health`, `finance`,
  `gdpr`)
- **Heavy** if complexity rating is High or Very High
- **Light** otherwise

## Risk surfacing

Risks are not random — each one is gated on a dimension threshold:

| Trigger                          | Risk surfaced |
| -------------------------------- | ------------- |
| dataReadiness < 5                | "Plan a 2-week instrumentation sprint before the pilot." |
| processClarity < 5               | "Run a 60-minute walkthrough and write a step-by-step SOP first." |
| complexity ≥ 7                   | "Reduce blast radius by shipping a shadow-mode agent before any write actions." |
| timelinePressure ≥ 7             | "Cut scope to a single sub-step (read-only summarization) for week one." |
| metricLeverage < 5               | "Confirm the executive sponsor cares about this number before investing." |
| teamCapacity < 5                 | "Allocate one named operator to babysit the agent for the first 30 days." |

If fewer than 3 triggers fire, fill from a fallback set so the user
always sees three. Never show fewer than three.

## Recommended workflow heuristic

A keyword match on the process description chooses one of six stock
recommendations (triage, daily-digest, quote-builder, QA-screening,
onboarding) or falls back to a "{processName} co-pilot" template.

This is a **rule-based suggestion, not a prediction.** It exists to
anchor the strategy conversation, not to replace it.

---

## How to add a new dimension

1. Add it to `scoring-config.json` with a label, weight, description,
   and `inverted` flag if applicable.
2. Add the key to the `DimensionKey` union in `scoring.ts`.
3. Write a `scoreFooBar(intake)` function that returns 0–10.
4. Add the call inside `scoreDimensions()`.
5. Add at least three test cases in `scoring.test.ts`:
   - The two endpoints (highest possible, lowest possible)
   - At least one realistic mid-range case
6. Update this skill file to document the new dimension.

If the change is large enough that it would change a published score
for a previously-shared URL, **bump the schema version** and add a
fallback decoder in `share-link.ts`.

## Things to never do

- Never read user input into a template literal that's passed to an
  LLM. The scoring path is pure.
- Never round to a multiple that hides volatility (e.g. nearest-5).
  Honesty about a score of 41 vs 45 matters.
- Never silently change a weight in the JSON without updating tests
  and this file.
