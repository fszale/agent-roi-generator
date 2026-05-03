export type ScorecardDimension =
  | "dataReadiness"
  | "processDocumentation"
  | "toolAdoption"
  | "governance"
  | "leadership";

export const SCORECARD_DIMENSIONS: { key: ScorecardDimension; label: string; description: string }[] = [
  {
    key: "dataReadiness",
    label: "Data Readiness",
    description: "Quality, accessibility, and governance of the data agents will rely on.",
  },
  {
    key: "processDocumentation",
    label: "Process Documentation",
    description: "How completely your operational processes are written down.",
  },
  {
    key: "toolAdoption",
    label: "AI Tool Adoption",
    description: "How widely AI tooling is used and trusted across the team.",
  },
  {
    key: "governance",
    label: "Governance & HITL",
    description: "Whether you have review gates, audit logs, and rollback paths.",
  },
  {
    key: "leadership",
    label: "Leadership Alignment",
    description: "How aligned executive leadership is on agentic outcomes and budget.",
  },
];

export type ScorecardAnswer = 0 | 1 | 2 | 3;

export type ScorecardQuestion = {
  id: string;
  dimension: ScorecardDimension;
  question: string;
  /** 4 options keyed not-started → in-production. */
  options: [string, string, string, string];
};

export const SCORECARD_QUESTIONS: ScorecardQuestion[] = [
  // Data Readiness — 3 questions
  {
    id: "data-1",
    dimension: "dataReadiness",
    question: "How accessible is the data your AI agents would need today?",
    options: [
      "Mostly in spreadsheets, email, and people's heads",
      "Some systems exist, but data is siloed",
      "Data is centralized but not queryable in real time",
      "Real-time, governed data warehouse or lakehouse",
    ],
  },
  {
    id: "data-2",
    dimension: "dataReadiness",
    question: "How well-instrumented are the workflows you want to automate?",
    options: [
      "Not instrumented — we'd be guessing at baselines",
      "Manual reporting, refreshed monthly",
      "Dashboards exist, refreshed weekly",
      "Every step is logged with structured events",
    ],
  },
  {
    id: "data-3",
    dimension: "dataReadiness",
    question: "Do you have a single source of truth for customer / operational data?",
    options: [
      "No — multiple systems disagree",
      "Sort of, with frequent reconciliation pain",
      "Yes, with documented mappings",
      "Yes, with golden-record + lineage",
    ],
  },
  // Process Documentation — 2 questions
  {
    id: "process-1",
    dimension: "processDocumentation",
    question: "How well-documented are the processes you'd hand to an agent?",
    options: [
      "Tribal knowledge only",
      "Some docs exist but are stale",
      "Most processes have current SOPs",
      "Every process has a versioned, machine-readable SOP",
    ],
  },
  {
    id: "process-2",
    dimension: "processDocumentation",
    question: "Can a new hire onboard onto your top workflow without shadowing for a week?",
    options: [
      "Definitely not — shadowing is required",
      "Partially, with heavy 1:1 coaching",
      "Yes, with the docs we have today",
      "Yes, and the docs are tested as part of onboarding",
    ],
  },
  // Tool Adoption — 2 questions
  {
    id: "tools-1",
    dimension: "toolAdoption",
    question: "How widely is AI tooling used across the organization today?",
    options: [
      "A few individuals experimenting",
      "Pockets of teams have AI in their flow",
      "Most knowledge workers use AI weekly",
      "AI is part of the default operating motion",
    ],
  },
  {
    id: "tools-2",
    dimension: "toolAdoption",
    question: "Have you shipped any AI feature into a production workflow?",
    options: [
      "No",
      "We've prototyped",
      "Yes, in one workflow",
      "Yes, in multiple workflows with metrics",
    ],
  },
  // Governance — 2 questions
  {
    id: "gov-1",
    dimension: "governance",
    question: "Do you have a defined human-in-the-loop policy for AI decisions?",
    options: [
      "No policy exists",
      "Informal — depends on the team",
      "Documented HITL gates per use case",
      "HITL gates with audit trails and rollback playbooks",
    ],
  },
  {
    id: "gov-2",
    dimension: "governance",
    question: "How would you know if an AI agent silently regressed in production?",
    options: [
      "We wouldn't",
      "We'd find out from a customer or operator complaint",
      "We monitor outputs but not drift",
      "Drift, eval, and on-call alerts in place",
    ],
  },
  // Leadership — 3 questions
  {
    id: "lead-1",
    dimension: "leadership",
    question: "How aligned is executive leadership on what agentic AI should change?",
    options: [
      "Curious but no shared view",
      "Some execs are bought in",
      "Aligned on a thesis but not on roadmap",
      "Aligned on thesis, roadmap, and metrics",
    ],
  },
  {
    id: "lead-2",
    dimension: "leadership",
    question: "Is there a budget line item for agentic / AI initiatives?",
    options: [
      "No",
      "Discretionary, project-by-project",
      "Yes, but small",
      "Yes, multi-quarter committed",
    ],
  },
  {
    id: "lead-3",
    dimension: "leadership",
    question: "Who owns the outcome of your AI initiatives end-to-end?",
    options: [
      "Nobody — it's a side project",
      "A senior IC, part-time",
      "A named director / VP",
      "An executive sponsor with a delivery team",
    ],
  },
];

export type ScorecardAnswers = Record<string, ScorecardAnswer>;

export type Stage = {
  id: 1 | 2 | 3 | 4 | 5;
  label: string;
  summary: string;
};

export const STAGES: Stage[] = [
  {
    id: 1,
    label: "Stage 1: Exploring",
    summary: "Curiosity-led — individuals are experimenting but no operational change yet.",
  },
  {
    id: 2,
    label: "Stage 2: Piloting",
    summary: "First workflows touched by AI; data and process are still catching up.",
  },
  {
    id: 3,
    label: "Stage 3: Scaling",
    summary: "Multiple workflows in production; HITL gates are in place but evolving.",
  },
  {
    id: 4,
    label: "Stage 4: Optimizing",
    summary: "Production agents are tuned for cost, drift, and reliability; gains are measurable.",
  },
  {
    id: 5,
    label: "Stage 5: Operating",
    summary: "Agents are the default operating motion across functions, with governance and compounding outcomes.",
  },
];

export type ScorecardResult = {
  overall: number; // 0-100
  byDimension: Record<ScorecardDimension, number>; // 0-100 per dimension
  stage: Stage;
  observations: string[];
  nextStep: string;
};

export function dimensionScore(answers: ScorecardAnswers, dimension: ScorecardDimension): number {
  const qs = SCORECARD_QUESTIONS.filter((q) => q.dimension === dimension);
  if (qs.length === 0) return 0;
  let sum = 0;
  for (const q of qs) {
    const a = answers[q.id] ?? 0;
    sum += a;
  }
  // Each question max is 3; normalize to 0-100.
  return Math.round((sum / (qs.length * 3)) * 100);
}

export function overallScore(answers: ScorecardAnswers): number {
  const perDim = SCORECARD_DIMENSIONS.map((d) => dimensionScore(answers, d.key));
  const avg = perDim.reduce((acc, n) => acc + n, 0) / perDim.length;
  return Math.round(avg);
}

export function stageFor(score: number): Stage {
  if (score >= 80) return STAGES[4];
  if (score >= 60) return STAGES[3];
  if (score >= 40) return STAGES[2];
  if (score >= 20) return STAGES[1];
  return STAGES[0];
}

export function generateObservations(byDim: Record<ScorecardDimension, number>): string[] {
  const observations: string[] = [];
  const sorted = (Object.entries(byDim) as [ScorecardDimension, number][]).sort((a, b) => a[1] - b[1]);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const lowestLabel = SCORECARD_DIMENSIONS.find((d) => d.key === lowest[0])!.label;
  const highestLabel = SCORECARD_DIMENSIONS.find((d) => d.key === highest[0])!.label;

  observations.push(
    `Your weakest dimension is **${lowestLabel}** (${lowest[1]}/100). This is the constraint that will throttle every other initiative until it moves.`,
  );
  observations.push(
    `Your strongest dimension is **${highestLabel}** (${highest[1]}/100). Lean on this when prioritizing your first agent — pick a workflow that lives close to this strength.`,
  );

  if (byDim.governance < 40 && byDim.toolAdoption >= 50) {
    observations.push(
      "Tool adoption is outpacing governance. Pause and ship an HITL policy + audit log before scope expands.",
    );
  } else if (byDim.dataReadiness < 40 && byDim.leadership >= 60) {
    observations.push(
      "Leadership wants to move, but data isn't ready. Spend the first 30 days on instrumentation, not models.",
    );
  } else if (byDim.processDocumentation < 40) {
    observations.push(
      "Process documentation is thin. An agent inherits whatever clarity the SOP has — fix this first.",
    );
  } else {
    observations.push(
      "No single dimension is broken. Your bottleneck will be picking the right first workflow — high leverage, low blast radius.",
    );
  }
  return observations;
}

export function nextStepFor(stage: Stage): string {
  switch (stage.id) {
    case 1:
      return "Run a 1-week instrumentation sprint on one process and book a 30-minute scoping call to pick your first agent.";
    case 2:
      return "Promote your most-used pilot to assisted mode and set up an HITL queue. Then book a readiness review.";
    case 3:
      return "Audit the 3 production agents for drift + cost. Pick one to graduate to autonomous on low-risk cases.";
    case 4:
      return "Codify the agent kernel: a shared library of skills, evals, and HITL patterns reused across functions.";
    case 5:
      return "You're operating. Externalize what you've built — start a community of practice or a partner program to compound the advantage.";
  }
}

export function scoreScorecard(answers: ScorecardAnswers): ScorecardResult {
  const byDimension = {
    dataReadiness: dimensionScore(answers, "dataReadiness"),
    processDocumentation: dimensionScore(answers, "processDocumentation"),
    toolAdoption: dimensionScore(answers, "toolAdoption"),
    governance: dimensionScore(answers, "governance"),
    leadership: dimensionScore(answers, "leadership"),
  };
  const overall = overallScore(answers);
  const stage = stageFor(overall);
  return {
    overall,
    byDimension,
    stage,
    observations: generateObservations(byDimension),
    nextStep: nextStepFor(stage),
  };
}

export function radarData(byDim: Record<ScorecardDimension, number>) {
  return SCORECARD_DIMENSIONS.map((d) => ({
    dimension: d.label.replace(/^Data\b/, "Data").replace(/^AI Tool /, "Tool "),
    score: byDim[d.key],
    fullMark: 100,
  }));
}
