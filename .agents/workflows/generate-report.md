# Workflow: Generate an ROI Report

> Use this playbook if you are operating the tool on behalf of a client,
> or if you are an agent walking a user through it.

---

## Prerequisites

- A 5-minute conversation slot with the operator (the person who owns
  the workflow).
- Either a screen-share or a sandbox URL: `solidcage.com/tools/intake`.
- A pad to capture the inputs verbatim — the description text matters.

## Step 1 — Anchor the company

**Inputs:** company name, industry.

The industry choice matters because it triggers the regulated-HITL
heuristic for `Healthcare`, `Financial Services`. If the client lives
in a regulated space, choose the matching industry even if their
specific function isn't itself regulated — it surfaces the right risks.

## Step 2 — Pick ONE process

**Inputs:** process name, process description.

The most common failure mode at this step is the operator describing
their *whole department* as "the process". Push them to pick **one**
workflow with a clear input, a clear output, and a defined success
criterion.

The description should:
- Be at least 150 characters
- Use step language ("Step 1: …, then …, finally …")
- Mention the systems involved (Salesforce, SAP, Notion, etc.)
- Identify where humans hand off

If the description is thin, the **Process Clarity** dimension will
correctly score low and the report will recommend a documentation
sprint as the first deliverable. That is the correct outcome.

## Step 3 — Find the metric

**Inputs:** current metric, target metric.

The metric must be:
- The same units on both sides ("48 hours" and "6 hours", not "48
  hours" and "75% faster")
- Numeric where possible — fuzzy text falls back to a mid-range score
- Specific to *this* workflow, not a department-wide KPI

Common moves:
- For triage workflows: time-to-first-response or time-to-resolution
- For quote/proposal workflows: cycle time or win rate
- For inspection/QA workflows: defect leakage rate or sample throughput
- For onboarding/KYC: time-to-activate or exception rate

## Step 4 — Foundation check

**Inputs:** data readiness, team size.

Be honest. The temptation is to overstate readiness ("yeah, modern
data stack") because it's flattering. Pushing the client toward
honesty here is the highest-leverage thing the operator does — a "Some
structured systems" answer when the truth is "Mostly manual" produces
a recommendation that will fail in week 2.

## Step 5 — Bottleneck and timeline

**Inputs:** bottleneck (free text), timeline.

Ask: "If a magic wand removed one thing tomorrow, what would unlock
everything else?" Capture the answer verbatim — it drives the
complexity heuristic and the recommended workflow.

For timeline: pick the operator's **honest** preferred date, not the
boss's quoted date. A "<30 days" answer triggers the timeline-pressure
penalty and the report will recommend cutting scope.

## Step 6 — Read the report together

When the report renders:

1. Read the **score and stage** out loud first. Let the number sit.
2. Read the **recommended workflow** — confirm the operator agrees this
   is the right shape of agent for the process.
3. Walk through the **dimension breakdown**. For any dimension < 5, ask
   the operator: "Does that surprise you?" The conversation is the
   point of the bar chart.
4. Read the **3 risks** one at a time. Confirm each is real for them.
5. Read the **30/60/90** as commitments, not as suggestions.

## Step 7 — Save the artifact

The report URL is the export.

- Click **Download PDF** for an offline-survivable version.
- Click **Copy shareable link** to bookmark or send to the operator's
  team.
- Send both to whoever wasn't in the call.

## Step 8 — Book the next call

The CTA at the bottom of the report goes to `solidcage.com/book`.
That's the next step. The operator now has a one-page artifact to
bring to the strategy session — that artifact is what makes the
session productive.

---

## Failure modes to watch for

- **Score is high, but data readiness is low.** This is the most
  dangerous combination. The score says "Strong AI candidate" because
  the metric leverage and team capacity are great, but data readiness
  alone can sink the project. Always re-read the dimension breakdown
  before celebrating a high score.
- **Score is low, operator is deflated.** Reframe: a low score isn't a
  rejection, it's a 30/60/90 plan that focuses on instrumentation
  before model. The report is still valuable.
- **Operator wants to change inputs to get a better score.** Politely
  decline. The report is honest about *this* workflow with *these*
  inputs. If they want a different report, pick a different workflow.
