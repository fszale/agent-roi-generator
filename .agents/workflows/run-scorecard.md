# Workflow: Run the Agentic Readiness Scorecard

> Use this playbook to run the scorecard with a client, a team, or
> several stakeholders for a comparative read.

---

## When to use the scorecard vs the ROI generator

- **Scorecard** answers: *Where is the organization on the agentic
  curve, broadly?*
- **ROI generator** answers: *Which specific workflow should we ship
  first?*

The scorecard is the **strategy-level** read. The ROI generator is the
**workflow-level** read. They are complementary — the recommended
flow for a new prospect is: scorecard first, then pick the highest-
leverage workflow and run it through the ROI generator.

---

## Single-stakeholder run (~5 minutes)

1. Open `solidcage.com/tools/scorecard`.
2. Click "Start the scorecard".
3. Answer all 12 questions one at a time. The answer is committed
   when the operator clicks the option — no "next" button.
4. The results page renders the radar, the per-dimension bars, the
   observations, and the recommended next step.
5. Click "Copy shareable link" to bookmark this snapshot.

## Multi-stakeholder run (the high-value play)

The scorecard is **most valuable when run by 3–5 people independently**
on the same organization. The interesting answer is rarely the
average — it's the **disagreement**.

Process:

1. Send the URL to 3–5 stakeholders (CEO, COO, head of data, head of
   ops, a senior IC). Ask them to take it independently, not as a
   group, and to share back the link.
2. Plot the five overall scores on a single sheet:
   - If they cluster within 10 points, the org has a shared view.
   - If they spread by 30+ points, you have a leadership-alignment
     problem disguised as a tooling question.
3. Plot the per-dimension scores side-by-side. The dimension with the
   widest spread is the conversation to have at the next leadership
   offsite.
4. Bring this comparison to the next stakeholder meeting. The scorecard
   itself doesn't fix the disagreement — but surfacing it is the work.

---

## Reading the result honestly

Resist the temptation to round up. If the result says **Stage 2:
Piloting**, the org is at Stage 2. The biggest mistake operators make
after this assessment is conflating "we have an LLM in our IDE" with
"we are operating with agents". Tool adoption is one of five
dimensions, not the whole picture.

The recommended next step is **stage-specific**:

- Stage 1 (Exploring) → instrumentation sprint + scoping call
- Stage 2 (Piloting) → promote a pilot to assisted + HITL queue
- Stage 3 (Scaling) → audit production agents for drift; pick one for autonomy
- Stage 4 (Optimizing) → codify the agent kernel as shared infrastructure
- Stage 5 (Operating) → externalize what you've built (community of practice, partner program)

Each is one sentence and one quarter of work. Do not skip stages.

---

## After the scorecard

Two paths:

1. **Run the ROI generator** on whatever workflow looks like the
   highest-leverage first agent given the scorecard result.
2. **Book a strategy session** at `crm.solidcage.com` and bring the
   scorecard result (and ideally the multi-stakeholder spread) to the
   conversation.

The shareable link is the artifact. If the operator forgets to copy
it before closing the tab, the result is gone — that's the point of
stateless. They can re-take it any time.
