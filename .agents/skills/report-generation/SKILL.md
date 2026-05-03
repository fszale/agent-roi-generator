---
name: report-generation
description: What a "good" generated ROI report looks like — the structure, the layout, the PDF. Read this before changing app/src/pages/roi-report.tsx or app/src/lib/pdf.ts.
---

# Skill: Report Generation

The report is the **artifact** the user takes from the tool to their
next conversation (with their boss, their team, or with us). If the
report doesn't survive being printed and brought into a meeting, it
has failed.

---

## The 7 sections, in order

Every report has these sections, in this order, on screen and in the
PDF. Do not reorder.

1. **Header** — company name, industry, process name, today's date.
2. **Score badge** — the composite 0–100 number, the stage label, the
   complexity rating, the HITL posture, and the recommended first
   workflow as a one-sentence statement.
3. **Dimension breakdown** — six bars (one per dimension) with the
   raw 0–10 score and the dimension label.
4. **Expected metric trajectory** — three lines (30, 60, 90 days)
   each showing either a numeric forecast (when both metrics are
   parseable) or a milestone narrative.
5. **Top 3 risks** — exactly three, gated by dimension thresholds
   (see `roi-scoring` skill).
6. **30/60/90 roadmap** — three rows, each with a window, a theme,
   2–4 deliverables, and an exit criterion.
7. **Footer CTA** — a single, clear call to book a strategy session
   at `crm.solidcage.com`.

---

## Voice rules for generated copy

- **Imperative.** "Run a 60-minute walkthrough." Not "Consider running."
- **Concrete.** "Ship a Slack approval flow" beats "implement HITL".
- **Numeric where possible.** "≥75% of volume with <10% rejection
  rate" is better than "high coverage with low rejection".
- **Honest.** If the score is low, the deliverables for day-90 are
  "Run a go/no-go review" — not "Scale to autonomy".

---

## PDF rules

The PDF is the **portable canonical version** of the report. It must:

- Fit US Letter (8.5×11), single column
- Render every section listed above
- Include `crm.solidcage.com/book` in the footer
- Use brand colors at all times: navy `#0E1320`, orange `#EB6928`,
  blue `#387CBD`, cream `#F4F1EC`, mid-gray `#6B7280`
- Be re-paginated cleanly — if a section would split awkwardly, the
  helper `ensureRoom()` in `pdf.ts` adds a page break first
- Have a filename of `agent-roi-{company-slug}.pdf`

The PDF is **deterministic**. Same intake → same PDF. No timestamps
inside the PDF body that would change between regenerations.

---

## Shareable URL rules

The URL is `?s=<base64url-deflated-json>`. The decoder is in
`share-link.ts`.

- **The URL is the export.** A user can bookmark it; it must always
  decode back to the same report.
- **No PII in the encoded payload.** The intake is whatever the user
  typed. We don't add names, emails, browser fingerprints, or
  timestamps to it.
- **Schema versioning.** If you add or remove a field on `IntakeData`,
  you have two options:
  1. (Preferred) Make the new field optional and provide a sensible
     default in the decoder.
  2. Bump a `v` field in the encoded payload and write a versioned
     decoder. Old URLs must still work.

---

## The "passes the print test" check

Before merging any change to the report, do this:

1. Generate a report with a realistic intake.
2. Click "Download PDF".
3. Open the PDF. Pretend you're a CFO who has 60 seconds.
4. Can you (a) see the score, (b) see the recommended workflow,
   (c) see the 30/60/90, and (d) see the CTA — without scrolling
   inside any one section?

If the answer to any of those is no, the change is not done.

---

## When NOT to change the layout

- Don't add charts unless the chart conveys information that the
  bars and the numeric trajectory don't already.
- Don't add a logo carousel of "trusted by" — the brand promise is
  honesty, not social proof.
- Don't add anything that requires a network round-trip to render.
  The report works offline after first load. Keep it that way.
