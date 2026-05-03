import type { IntakeData, ROIScoreResult } from "./scoring";

export type RoadmapMilestone = {
  window: "Days 1–30" | "Days 31–60" | "Days 61–90";
  theme: string;
  deliverables: string[];
  exitCriteria: string;
};

export function generateRoadmap(intake: IntakeData, score: ROIScoreResult): RoadmapMilestone[] {
  const processName = intake.processName?.trim() || "the workflow";
  const isHeavyHitl = score.hitlRequired === "Heavy" || score.hitlRequired === "Continuous";

  const day30: RoadmapMilestone = {
    window: "Days 1–30",
    theme: "Instrument & shadow",
    deliverables: [
      `Write a step-by-step SOP for ${processName} with a named operator.`,
      "Stand up logging on every input/output of the current process.",
      "Deploy a shadow agent that produces drafts but takes no actions.",
    ],
    exitCriteria: "Shadow agent has produced ≥50 draft outputs alongside the human; quality scored.",
  };

  const day60: RoadmapMilestone = {
    window: "Days 31–60",
    theme: "Assisted mode + HITL gate",
    deliverables: [
      `Promote the agent to assisted mode for ${processName} (operator one-click approves).`,
      isHeavyHitl
        ? "Build a dedicated HITL review queue with reason codes and rejection reasons."
        : "Wire a lightweight Slack approval flow for borderline cases.",
      "Define the rollback path and the kill-switch.",
    ],
    exitCriteria: `Assisted mode covers ${score.compositeScore >= 70 ? "≥75%" : "≥40%"} of volume with <10% rejection rate.`,
  };

  const day90: RoadmapMilestone = {
    window: "Days 61–90",
    theme: score.compositeScore >= 70 ? "Autonomy + scale" : "Harden + decide",
    deliverables:
      score.compositeScore >= 70
        ? [
            `Graduate ${processName} to autonomous mode for low-risk cases (with HITL on exceptions).`,
            "Document the runbook + on-call rotation; hand off ownership to the line operator.",
            "Plan the second workflow using the same kernel pattern.",
          ]
        : [
            "Fix the top three failure modes seen in assisted mode.",
            "Run a go/no-go review with the executive sponsor.",
            "Either expand to full autonomy on a narrower slice OR park the project and reuse the SOP.",
          ],
    exitCriteria:
      score.compositeScore >= 70
        ? `Metric closes ${score.expectedMetric.day90}.`
        : "Decision made on whether to invest in autonomy or absorb the assisted workflow.",
  };

  return [day30, day60, day90];
}
