# Agent ROI Generator + Agentic Readiness Scorecard

> Two stateless web tools by **Filip Szalewicz** at [solidcage.com](https://solidcage.com).
> No signup. No backend. Take five minutes, get a real plan.

**Live demo:** `<DEPLOY_URL>/agent-roi-generator/` and `<DEPLOY_URL>/agent-roi-generator/scorecard` (Replit Deployment — replace `<DEPLOY_URL>` with the live `*.replit.app` host from the project's Publishing tool, or a configured custom domain such as `solidcage.com`). Both tools live alongside the [Digital Twin Factory Demo Portal](https://github.com/fszale/digital-twin-factory) at `<DEPLOY_URL>/twin-portal/` and the [OI Tracker](https://github.com/fszale/operational-intelligence-lab) at `<DEPLOY_URL>/oi-tracker/`.

**Production:** [solidcage.com/tools](https://solidcage.com/tools) (mounts the `app/` source under `/tools`).

This repository contains both the production source and the **operating
methodology** I use to think about whether an organization is ready for
agentic AI, and which workflow to ship first.

---

## What's in here

| Path                              | Purpose |
| --------------------------------- | ------- |
| `app/`                            | The React + Vite source for the live site at `solidcage.com/tools` (mirror of `artifacts/agent-roi-generator/`). |
| `AGENTS.md`                       | Top-level instructions for any AI agent (Claude, Codex, Devin, internal) working in this repo. |
| `CLAUDE.md`                       | Claude-specific shortcuts and conventions, redirecting to `AGENTS.md`. |
| `CONTEXT.md`                      | The "why" behind the project — strategic context, audience, voice. |
| `.agents/skills/`                 | Reusable skills (markdown SOPs) for the three core jobs: ROI scoring, report generation, readiness assessment. |
| `.agents/workflows/`              | Step-by-step playbooks for the human-or-agent operator. |

---

## The two tools

### 1. ROI Report Generator (`/`)
A 5-step intake captures **company → process → metric → foundation →
constraints**. The deterministic scoring engine returns:

- An opportunity score (0–100) with a stage label
- The recommended first workflow (rule-based, not LLM)
- A 30/60/90-day expected metric trajectory
- An implementation complexity rating
- The required HITL posture (Light / Heavy / Continuous)
- Top 3 risks specific to the inputs
- A 30/60/90-day roadmap with deliverables and exit criteria
- Client-side PDF export and a compressed shareable URL (`?s=...`)

### 2. Agentic Readiness Scorecard (`/scorecard`)
12 questions across 5 dimensions: **Data Readiness, Process
Documentation, AI Tool Adoption, Governance & HITL, Leadership
Alignment**. The output is:

- An overall score (0–100) and one of the 5 stages (Exploring → Operating)
- A per-dimension radar chart
- 2–3 specific observations targeting the weakest and strongest dimensions
- A recommended next step keyed to the stage
- A shareable URL for re-running or comparing later

Both tools route to **`solidcage.com/book`** for a strategy session as
the call-to-action.

---

## Why stateless

- **Zero risk for the visitor.** No account, no email gate, no data
  leaving the browser unless they click "Copy shareable link".
- **The artifact is the value.** The intake encodes into a compressed
  base64url token — the URL itself is the report. Save it, share it,
  bring it to the call.
- **The scoring is auditable.** Every weight lives in
  `app/src/lib/scoring-config.json`. Fork it, change the thresholds,
  argue with my heuristics.

---

## Local development

```bash
# At the monorepo root
pnpm install
pnpm --filter @workspace/agent-roi-generator run dev
pnpm --filter @workspace/agent-roi-generator run test
pnpm --filter @workspace/agent-roi-generator run typecheck
```

The app runs on the artifact's assigned `PORT` with `BASE_PATH=/agent-roi-generator/`
in development. In production it's mounted at `solidcage.com/tools/`.

---

## Methodology

If you're a human or agent contributor, **read in this order**:

1. `CONTEXT.md` — what this project is for and who it's for
2. `AGENTS.md` — how to work in this repo
3. `.agents/skills/roi-scoring/SKILL.md` — the scoring engine
4. `.agents/skills/report-generation/SKILL.md` — what a "good" report looks like
5. `.agents/skills/readiness-assessment/SKILL.md` — the 5-stage model
6. `.agents/workflows/generate-report.md` — running the ROI tool end-to-end
7. `.agents/workflows/run-scorecard.md` — running the scorecard end-to-end

---

## License & contact

Source is mirrored publicly so the methodology can be inspected and
forked. For commercial use of the rule-based engine in your own product,
or to bring this into your operating cadence, **book a session**:
[solidcage.com/book](https://solidcage.com/book).

Filip Szalewicz · [solidcage.com](https://solidcage.com)
