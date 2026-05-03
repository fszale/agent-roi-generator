# AGENTS.md — operating instructions for any AI agent in this repo

> This file is the contract any agent (Claude, Codex, Devin, internal,
> or human-with-an-LLM) accepts when working in this repository. If you
> are an LLM and you are reading this, **do not skip steps**.

---

## 1. Read before you write

Before changing **any file**, read in this exact order:

1. `CONTEXT.md` — strategic intent
2. This file (`AGENTS.md`) — operating rules
3. The skill(s) most relevant to the change in `.agents/skills/`
4. The workflow(s) in `.agents/workflows/` if you are running a tool

If your change touches scoring, you must read
`.agents/skills/roi-scoring/SKILL.md`. If it touches the scorecard,
read `.agents/skills/readiness-assessment/SKILL.md`. If it touches the
PDF or the report layout, read `.agents/skills/report-generation/SKILL.md`.

---

## 2. The non-negotiables

These rules exist because they are the brand promise of the tools:

- **Stateless.** No backend. No accounts. No analytics that fingerprint
  the user. The browser is the database; the URL is the export.
- **Rule-based scoring.** The opportunity score and the readiness score
  are produced by deterministic functions in `app/src/lib/`. They are
  **not** produced by calling an LLM. If you see a PR that adds an LLM
  call to the scoring path, reject it.
- **Auditable weights.** All weights and thresholds live in
  `app/src/lib/scoring-config.json`. Code reads from this file. If you
  add a dimension, you add it to the JSON first.
- **Brand.** Cream `#F4F1EC` background, navy `#0E1320` text, orange
  `#EB6928` primary, blue `#387CBD` accent. JetBrains Mono for
  numbers, eyebrows, and code-feeling UI. Inter for prose. Do not
  introduce a third typeface.
- **CTA.** Every flow ends at `https://solidcage.com/book`. Do not
  swap this URL or add competing CTAs.

---

## 3. Code organization

```
app/
  src/
    lib/                # PURE LOGIC — no React imports here
      scoring.ts        # ROI scoring engine
      scoring-config.json
      scorecard.ts      # Readiness scorecard
      roadmap.ts        # 30/60/90 generator
      pdf.ts            # jsPDF-based PDF export
      share-link.ts     # URL state encode/decode
      validation.ts     # Per-step intake validation
      __tests__/        # Vitest tests for everything in lib/
    pages/              # One page per route
    components/
      layout.tsx        # Header + footer
      ui/               # shadcn primitives — do not edit ad hoc
    App.tsx             # Routes
```

The rule of thumb: **anything you can unit-test belongs in `lib/`.**
React components in `pages/` should be thin and ask `lib/` for answers.

---

## 4. Definition of done for any change

A change is only done when:

1. `pnpm --filter @workspace/agent-roi-generator run typecheck` is green
2. `pnpm --filter @workspace/agent-roi-generator run test` is green
3. The change is reflected in the relevant `.agents/skills/*.md` if it
   changed the methodology, not just the implementation
4. The brand non-negotiables in §2 still hold
5. The shareable link still round-trips with the new shape — if you
   added a field to `IntakeData`, old shared URLs must still decode (or
   you must explicitly version the schema)

---

## 5. How to add a new dimension to the ROI engine

1. Open `.agents/skills/roi-scoring/SKILL.md` and read it end to end
2. Add the dimension to `scoring-config.json` (label, weight, inverted?)
3. Add the typed key to `DimensionKey` in `scoring.ts`
4. Implement the dimension's scoring function (must return 0–10)
5. Add at least 3 unit tests in `scoring.test.ts`
6. Update the report card to render the new dimension
7. Update this file and the skill if the methodology changed

---

## 6. How to add a new scorecard question

1. Open `.agents/skills/readiness-assessment/SKILL.md` and confirm the
   dimension exists. If not, add it there first.
2. Add the question to `SCORECARD_QUESTIONS` in
   `app/src/lib/scorecard.ts`. Use a stable `id` — never reuse one.
3. Re-run tests; the structural tests will fail if the count is wrong.
4. Update the count in any UI copy that references "12 questions" — the
   landing page, the SEO description, etc.

---

## 7. Things you may not do without explicit human approval

- Add a backend service of any kind
- Add an analytics or tracking script
- Change `solidcage.com/book` to anything else
- Move scoring into an LLM call
- Replace the rule-based recommendation with a generative one
- Remove any of the 5 readiness dimensions
- Remove unit tests "to make CI green"

If you think you need to do one of these, write a proposal in a PR
description and **wait**.
