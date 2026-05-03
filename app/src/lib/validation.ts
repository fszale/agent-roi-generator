import type { IntakeData, Industry, DataReadiness, TeamSize, Timeline } from "./scoring";

export type IntakeStep = 1 | 2 | 3 | 4 | 5;

export type StepError = { field: string; message: string };

export function validateStep(step: IntakeStep, intake: Partial<IntakeData>): StepError[] {
  const errors: StepError[] = [];
  switch (step) {
    case 1:
      if (!intake.companyName?.trim()) errors.push({ field: "companyName", message: "Company name is required." });
      if (!intake.industry) errors.push({ field: "industry", message: "Pick the closest industry." });
      break;
    case 2:
      if (!intake.processName?.trim()) errors.push({ field: "processName", message: "Give the process a short name." });
      if (!intake.processDescription?.trim() || intake.processDescription.trim().length < 30) {
        errors.push({
          field: "processDescription",
          message: "Describe the process in at least one full sentence (30+ characters).",
        });
      }
      break;
    case 3:
      if (!intake.currentMetric?.trim()) errors.push({ field: "currentMetric", message: "What's the metric today?" });
      if (!intake.targetMetric?.trim()) errors.push({ field: "targetMetric", message: "What's the target?" });
      break;
    case 4:
      if (!intake.dataReadiness) errors.push({ field: "dataReadiness", message: "Pick a data-readiness level." });
      if (!intake.teamSize) errors.push({ field: "teamSize", message: "Pick a team size." });
      break;
    case 5:
      if (!intake.bottleneck?.trim() || intake.bottleneck.trim().length < 10) {
        errors.push({
          field: "bottleneck",
          message: "Describe the bottleneck in a sentence (10+ characters).",
        });
      }
      if (!intake.timeline) errors.push({ field: "timeline", message: "Pick a timeline." });
      break;
  }
  return errors;
}

export const INDUSTRIES: Industry[] = [
  "Manufacturing",
  "Logistics",
  "Financial Services",
  "Healthcare",
  "Professional Services",
  "Retail / E-commerce",
  "Software / SaaS",
  "Other",
];

export const DATA_READINESS_OPTIONS: DataReadiness[] = [
  "Mostly manual",
  "Some structured systems",
  "Modern data stack",
  "Real-time pipelines",
];

export const TEAM_SIZE_OPTIONS: TeamSize[] = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

export const TIMELINE_OPTIONS: Timeline[] = [
  "<30 days",
  "30-90 days",
  "3-6 months",
  "6-12 months",
  ">12 months",
];
