import { describe, it, expect } from "vitest";
import { generateRoadmap } from "../roadmap";
import { scoreIntake, type IntakeData } from "../scoring";

const intake: IntakeData = {
  companyName: "Acme",
  industry: "Software / SaaS",
  processName: "Inbound triage",
  processDescription:
    "Step 1: ticket arrives. Step 2: classify. Step 3: route. Step 4: draft response. Step 5: human approves and sends.",
  currentMetric: "8 hours",
  targetMetric: "1 hour",
  dataReadiness: "Modern data stack",
  teamSize: "51-200",
  bottleneck: "Manual classification of inbound tickets blocks every other team.",
  timeline: "30-90 days",
};

describe("generateRoadmap", () => {
  it("always returns three milestones in order", () => {
    const score = scoreIntake(intake);
    const roadmap = generateRoadmap(intake, score);
    expect(roadmap).toHaveLength(3);
    expect(roadmap[0].window).toBe("Days 1–30");
    expect(roadmap[1].window).toBe("Days 31–60");
    expect(roadmap[2].window).toBe("Days 61–90");
  });

  it("each milestone has a non-empty theme, deliverables, and exit criteria", () => {
    const score = scoreIntake(intake);
    const roadmap = generateRoadmap(intake, score);
    for (const ms of roadmap) {
      expect(ms.theme).toBeTruthy();
      expect(ms.deliverables.length).toBeGreaterThanOrEqual(2);
      expect(ms.exitCriteria.length).toBeGreaterThan(10);
    }
  });

  it("uses the autonomy theme for high-scoring intakes", () => {
    const strong = scoreIntake({
      ...intake,
      dataReadiness: "Real-time pipelines",
      timeline: "6-12 months",
    });
    const ms = generateRoadmap(intake, strong);
    expect(ms[2].theme.toLowerCase()).toContain("autonomy");
  });

  it("uses the harden+decide theme for low-scoring intakes", () => {
    const weak = scoreIntake({
      ...intake,
      dataReadiness: "Mostly manual",
      currentMetric: "",
      targetMetric: "",
      processDescription: "tiny",
      timeline: "<30 days",
    });
    const ms = generateRoadmap(intake, weak);
    expect(ms[2].theme.toLowerCase()).toMatch(/harden|decide/);
  });

  it("specializes day-31-60 deliverables for heavy HITL", () => {
    const regulated = scoreIntake({
      ...intake,
      industry: "Healthcare",
      processDescription:
        "Step 1: PHI lands. Step 2: HIPAA-regulated processing. Step 3: audit-trail review. Step 4: ship.",
    });
    const ms = generateRoadmap(intake, regulated);
    const dayTwo = ms[1].deliverables.join(" ").toLowerCase();
    expect(dayTwo).toContain("hitl");
  });
});
