import config from "./scoring-config.json";

export type Industry =
  | "Manufacturing"
  | "Logistics"
  | "Financial Services"
  | "Healthcare"
  | "Professional Services"
  | "Retail / E-commerce"
  | "Software / SaaS"
  | "Other";

export type DataReadiness = "Mostly manual" | "Some structured systems" | "Modern data stack" | "Real-time pipelines";
export type TeamSize = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";
export type Timeline = "<30 days" | "30-90 days" | "3-6 months" | "6-12 months" | ">12 months";
export type ComplexityRating = "Low" | "Medium" | "High" | "Very High";

export type IntakeData = {
  companyName: string;
  industry: Industry;
  processName: string;
  processDescription: string;
  currentMetric: string;
  targetMetric: string;
  dataReadiness: DataReadiness;
  teamSize: TeamSize;
  bottleneck: string;
  timeline: Timeline;
};

export type DimensionKey =
  | "processClarity"
  | "dataReadiness"
  | "metricLeverage"
  | "teamCapacity"
  | "complexity"
  | "timelinePressure";

export type DimensionScores = Record<DimensionKey, number>;

export type ScoringConfig = {
  dimensions: Record<
    DimensionKey,
    { label: string; weight: number; description: string; inverted?: boolean }
  >;
  stageThresholds: { high: number; medium: number; low: number };
  complexityMap: Record<ComplexityRating, number>;
};

export const SCORING_CONFIG = config as ScoringConfig;

export type ROIScoreResult = {
  dimensions: DimensionScores;
  compositeScore: number;
  stage: "Strong AI candidate" | "Promising — needs scoping" | "Pilot first" | "Not ready yet";
  expectedComplexity: ComplexityRating;
  hitlRequired: "Light" | "Heavy" | "Continuous";
  topRisks: string[];
  recommendedWorkflow: string;
  expectedMetric: { day30: string; day60: string; day90: string };
};

const clamp = (n: number, min = 0, max = 10) => Math.max(min, Math.min(max, n));

function scoreProcessClarity(intake: IntakeData): number {
  const description = intake.processDescription.trim();
  const length = description.length;
  // Length proxy for clarity, then check for steps language.
  let score = 0;
  if (length >= 400) score = 9;
  else if (length >= 250) score = 8;
  else if (length >= 150) score = 6;
  else if (length >= 80) score = 4;
  else if (length >= 30) score = 2;
  else score = 1;

  // Bonus for clear step language.
  const stepLanguage = /step\s*\d|first[, ]|then[, ]|finally[, ]|\bnext\b|\d+\.\s/gi;
  const matches = description.match(stepLanguage);
  if (matches && matches.length >= 2) score = clamp(score + 1);
  return clamp(score);
}

function scoreDataReadiness(intake: IntakeData): number {
  switch (intake.dataReadiness) {
    case "Mostly manual":
      return 2;
    case "Some structured systems":
      return 5;
    case "Modern data stack":
      return 8;
    case "Real-time pipelines":
      return 10;
  }
}

function scoreMetricLeverage(intake: IntakeData): number {
  const cur = parseMetric(intake.currentMetric);
  const tgt = parseMetric(intake.targetMetric);
  if (cur === null || tgt === null || cur === 0) {
    // Fall back to "they at least specified something"
    if (intake.currentMetric.trim() && intake.targetMetric.trim()) return 5;
    return 2;
  }
  const delta = Math.abs(tgt - cur) / Math.max(Math.abs(cur), 1);
  if (delta >= 0.5) return 10;
  if (delta >= 0.3) return 8;
  if (delta >= 0.15) return 6;
  if (delta >= 0.05) return 4;
  return 2;
}

function scoreTeamCapacity(intake: IntakeData): number {
  switch (intake.teamSize) {
    case "1-10":
      return 4;
    case "11-50":
      return 7;
    case "51-200":
      return 9;
    case "201-1000":
      return 8;
    case "1000+":
      return 6;
  }
}

function scoreComplexity(intake: IntakeData): number {
  // Heuristic: process description length + bottleneck mentions of integrations.
  const desc = intake.processDescription.toLowerCase();
  const bottleneck = intake.bottleneck.toLowerCase();
  let raw = 4;
  if (/integrat|legacy|sap|salesforce|erp/.test(desc + " " + bottleneck)) raw += 2;
  if (/regulator|compliance|audit|hipaa|gdpr|pii|phi/.test(desc + " " + bottleneck)) raw += 2;
  if (/manual handoff|spreadsheet|excel|email/.test(desc + " " + bottleneck)) raw += 1;
  if (/real[- ]time|sub[- ]second|low latency/.test(desc + " " + bottleneck)) raw += 1;
  return clamp(raw);
}

function scoreTimelinePressure(intake: IntakeData): number {
  // Inverted: returning higher = more pressure (worse).
  switch (intake.timeline) {
    case "<30 days":
      return 9;
    case "30-90 days":
      return 5;
    case "3-6 months":
      return 2;
    case "6-12 months":
      return 1;
    case ">12 months":
      return 1;
  }
}

function parseMetric(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,%]/g, "").trim();
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

export function scoreDimensions(intake: IntakeData): DimensionScores {
  return {
    processClarity: scoreProcessClarity(intake),
    dataReadiness: scoreDataReadiness(intake),
    metricLeverage: scoreMetricLeverage(intake),
    teamCapacity: scoreTeamCapacity(intake),
    complexity: scoreComplexity(intake),
    timelinePressure: scoreTimelinePressure(intake),
  };
}

export function compositeScore(dims: DimensionScores, cfg: ScoringConfig = SCORING_CONFIG): number {
  let weightedSum = 0;
  let weightTotal = 0;
  for (const key of Object.keys(cfg.dimensions) as DimensionKey[]) {
    const def = cfg.dimensions[key];
    const raw = dims[key];
    const adjusted = def.inverted ? 10 - raw : raw;
    weightedSum += adjusted * def.weight;
    weightTotal += def.weight * 10;
  }
  return Math.round((weightedSum / weightTotal) * 100);
}

function stageFor(score: number, cfg: ScoringConfig): ROIScoreResult["stage"] {
  if (score >= cfg.stageThresholds.high) return "Strong AI candidate";
  if (score >= cfg.stageThresholds.medium) return "Promising — needs scoping";
  if (score >= cfg.stageThresholds.low) return "Pilot first";
  return "Not ready yet";
}

function complexityRating(complexityScore: number): ComplexityRating {
  if (complexityScore <= 3) return "Low";
  if (complexityScore <= 5) return "Medium";
  if (complexityScore <= 7) return "High";
  return "Very High";
}

function hitlFor(intake: IntakeData, complexity: ComplexityRating): ROIScoreResult["hitlRequired"] {
  const isRegulated =
    /regulator|compliance|audit|hipaa|gdpr|finance|health/.test(
      (intake.processDescription + " " + intake.bottleneck + " " + intake.industry).toLowerCase(),
    );
  if (isRegulated) return "Continuous";
  if (complexity === "High" || complexity === "Very High") return "Heavy";
  return "Light";
}

function risksFor(intake: IntakeData, dims: DimensionScores): string[] {
  const risks: string[] = [];
  if (dims.dataReadiness < 5) {
    risks.push(
      "Data is not yet structured enough for an agent to act on. Plan a 2-week instrumentation sprint before the pilot.",
    );
  }
  if (dims.processClarity < 5) {
    risks.push(
      "The process description is too thin. Run a 60-minute walkthrough with the operator and write a step-by-step SOP first.",
    );
  }
  if (dims.complexity >= 7) {
    risks.push(
      "Complexity is high. Reduce blast radius by shipping a shadow-mode agent before any write actions.",
    );
  }
  if (dims.timelinePressure >= 7) {
    risks.push(
      "Timeline is aggressive. Cut scope to a single sub-step (read-only summarization) for week one.",
    );
  }
  if (dims.metricLeverage < 5) {
    risks.push(
      "Metric improvement target is small. Confirm the executive sponsor cares about this number before investing.",
    );
  }
  if (dims.teamCapacity < 5) {
    risks.push(
      "Team is small. Allocate one named operator to babysit the agent for the first 30 days or it will quietly drift.",
    );
  }
  // Always have at least 3.
  const fallback = [
    "Hidden edge cases in production data will appear in week 2 — keep a HITL queue.",
    "Tool/API costs can creep — set per-run budget caps from day one.",
    "Internal adoption beats model quality — appoint a champion before rollout.",
  ];
  for (const f of fallback) {
    if (risks.length >= 3) break;
    if (!risks.includes(f)) risks.push(f);
  }
  return risks.slice(0, 3);
}

function recommendedWorkflowFor(intake: IntakeData): string {
  const desc = intake.processDescription.toLowerCase();
  if (/triag|ticket|intake|inbound/.test(desc)) {
    return "Inbound triage agent: classify, route, and draft a response for human approval.";
  }
  if (/report|summar|brief|digest/.test(desc)) {
    return "Daily-digest agent: read source systems and produce an editable Markdown brief in Slack.";
  }
  if (/quot|estimat|propos/.test(desc)) {
    return "Quote-builder agent: pull line items from CRM + price book, generate a draft PDF, route to AE for approval.";
  }
  if (/qa|test|defect|inspection/.test(desc)) {
    return "QA-screening agent: pre-screen artifacts against a checklist, flag exceptions for a human reviewer.";
  }
  if (/onboard|kyc|compliance/.test(desc)) {
    return "Onboarding agent: verify documents against rule set, prepare exception report for compliance officer.";
  }
  return `${intake.processName || "Process"} co-pilot agent: shadow the operator for two weeks, then graduate to drafting outputs for review.`;
}

function metricForecast(intake: IntakeData, score: number): ROIScoreResult["expectedMetric"] {
  const cur = parseMetric(intake.currentMetric);
  const tgt = parseMetric(intake.targetMetric);
  if (cur === null || tgt === null) {
    return {
      day30: "Baseline captured + first qualitative signal",
      day60: "Pilot covers ~50% of volume in shadow mode",
      day90: "Move from shadow to assisted; track first metric movement",
    };
  }
  const delta = tgt - cur;
  const pct = (n: number) => `${(cur + delta * n).toFixed(1)}`;
  // Higher score = faster realization.
  const fast = score >= 70;
  const day30 = fast ? 0.2 : 0.05;
  const day60 = fast ? 0.55 : 0.25;
  const day90 = fast ? 0.85 : 0.55;
  return {
    day30: `${pct(day30)} (${formatProgress(day30)})`,
    day60: `${pct(day60)} (${formatProgress(day60)})`,
    day90: `${pct(day90)} (${formatProgress(day90)})`,
  };
}

function formatProgress(frac: number): string {
  return `${Math.round(frac * 100)}% of target gap closed`;
}

export function scoreIntake(intake: IntakeData, cfg: ScoringConfig = SCORING_CONFIG): ROIScoreResult {
  const dimensions = scoreDimensions(intake);
  const composite = compositeScore(dimensions, cfg);
  const complexity = complexityRating(dimensions.complexity);
  return {
    dimensions,
    compositeScore: composite,
    stage: stageFor(composite, cfg),
    expectedComplexity: complexity,
    hitlRequired: hitlFor(intake, complexity),
    topRisks: risksFor(intake, dimensions),
    recommendedWorkflow: recommendedWorkflowFor(intake),
    expectedMetric: metricForecast(intake, composite),
  };
}

export function dimensionLabel(key: DimensionKey): string {
  return SCORING_CONFIG.dimensions[key].label;
}
