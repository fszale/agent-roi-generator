import { describe, it, expect } from "vitest";
import {
  compositeScore,
  scoreDimensions,
  scoreIntake,
  SCORING_CONFIG,
  type IntakeData,
} from "../scoring";

const baseIntake: IntakeData = {
  companyName: "Acme",
  industry: "Manufacturing",
  processName: "RFQ Triage",
  processDescription:
    "Step 1: An RFQ comes in by email to sales@. Step 2: AE forwards to ops. Step 3: Ops checks inventory in SAP. Step 4: Ops returns the price. Step 5: AE replies to customer with the quote.",
  currentMetric: "48 hours",
  targetMetric: "6 hours",
  dataReadiness: "Modern data stack",
  teamSize: "51-200",
  bottleneck: "Manual price lookup in SAP and a slow email handoff between teams.",
  timeline: "30-90 days",
};

describe("scoreDimensions", () => {
  it("returns all 6 dimensions in [0,10]", () => {
    const d = scoreDimensions(baseIntake);
    const keys = Object.keys(d);
    expect(keys).toHaveLength(6);
    for (const k of keys) {
      const v = (d as Record<string, number>)[k];
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it("processClarity rewards step language and length", () => {
    const empty = scoreDimensions({ ...baseIntake, processDescription: "" });
    const short = scoreDimensions({ ...baseIntake, processDescription: "We do a thing." });
    const long = scoreDimensions(baseIntake);
    expect(empty.processClarity).toBeLessThanOrEqual(short.processClarity);
    expect(short.processClarity).toBeLessThan(long.processClarity);
  });

  it("dataReadiness maps cleanly to four buckets", () => {
    expect(scoreDimensions({ ...baseIntake, dataReadiness: "Mostly manual" }).dataReadiness).toBe(2);
    expect(scoreDimensions({ ...baseIntake, dataReadiness: "Some structured systems" }).dataReadiness).toBe(5);
    expect(scoreDimensions({ ...baseIntake, dataReadiness: "Modern data stack" }).dataReadiness).toBe(8);
    expect(scoreDimensions({ ...baseIntake, dataReadiness: "Real-time pipelines" }).dataReadiness).toBe(10);
  });

  it("metricLeverage rewards a bigger gap", () => {
    const small = scoreDimensions({ ...baseIntake, currentMetric: "100", targetMetric: "98" });
    const large = scoreDimensions({ ...baseIntake, currentMetric: "100", targetMetric: "20" });
    expect(small.metricLeverage).toBeLessThan(large.metricLeverage);
  });

  it("metricLeverage falls back when metrics aren't numeric", () => {
    const result = scoreDimensions({
      ...baseIntake,
      currentMetric: "slow",
      targetMetric: "fast",
    });
    expect(result.metricLeverage).toBeGreaterThan(0);
    expect(result.metricLeverage).toBeLessThanOrEqual(10);
  });

  it("teamCapacity peaks in the mid-range", () => {
    const tiny = scoreDimensions({ ...baseIntake, teamSize: "1-10" });
    const mid = scoreDimensions({ ...baseIntake, teamSize: "51-200" });
    const huge = scoreDimensions({ ...baseIntake, teamSize: "1000+" });
    expect(mid.teamCapacity).toBeGreaterThan(tiny.teamCapacity);
    expect(mid.teamCapacity).toBeGreaterThan(huge.teamCapacity);
  });

  it("complexity surfaces for legacy + compliance + integration mentions", () => {
    const simple = scoreDimensions({
      ...baseIntake,
      processDescription: "Send a daily summary email.",
      bottleneck: "manual copy paste",
    });
    const hard = scoreDimensions({
      ...baseIntake,
      processDescription: "Integrate SAP with legacy ERP and meet HIPAA compliance for PII.",
      bottleneck: "regulatory audit logs and real-time low latency",
    });
    expect(hard.complexity).toBeGreaterThan(simple.complexity);
  });

  it("timelinePressure scores aggressive timelines as high pressure", () => {
    const urgent = scoreDimensions({ ...baseIntake, timeline: "<30 days" });
    const relaxed = scoreDimensions({ ...baseIntake, timeline: ">12 months" });
    expect(urgent.timelinePressure).toBeGreaterThan(relaxed.timelinePressure);
  });

  it("respects boundary edge cases for empty input", () => {
    const blank: IntakeData = {
      ...baseIntake,
      processName: "",
      processDescription: "",
      currentMetric: "",
      targetMetric: "",
      bottleneck: "",
    };
    const d = scoreDimensions(blank);
    for (const v of Object.values(d)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
});

describe("compositeScore", () => {
  it("returns 100 for a perfect input", () => {
    const perfect = {
      processClarity: 10,
      dataReadiness: 10,
      metricLeverage: 10,
      teamCapacity: 10,
      complexity: 0, // inverted: 0 raw = 10 contribution
      timelinePressure: 0, // inverted
    };
    expect(compositeScore(perfect)).toBe(100);
  });

  it("returns 0 for a zero input across the board", () => {
    const zero = {
      processClarity: 0,
      dataReadiness: 0,
      metricLeverage: 0,
      teamCapacity: 0,
      complexity: 10, // inverted: 10 raw = 0 contribution
      timelinePressure: 10, // inverted
    };
    expect(compositeScore(zero)).toBe(0);
  });

  it("respects weight changes from the JSON config", () => {
    const dims = scoreDimensions(baseIntake);
    const customCfg = {
      ...SCORING_CONFIG,
      dimensions: {
        ...SCORING_CONFIG.dimensions,
        dataReadiness: { ...SCORING_CONFIG.dimensions.dataReadiness, weight: 10 },
      },
    };
    const baseline = compositeScore(dims);
    const reweighted = compositeScore(dims, customCfg);
    expect(reweighted).not.toBe(baseline);
  });
});

describe("scoreIntake", () => {
  it("produces a coherent end-to-end report", () => {
    const r = scoreIntake(baseIntake);
    expect(r.compositeScore).toBeGreaterThan(0);
    expect(r.compositeScore).toBeLessThanOrEqual(100);
    expect(["Strong AI candidate", "Promising — needs scoping", "Pilot first", "Not ready yet"]).toContain(r.stage);
    expect(["Low", "Medium", "High", "Very High"]).toContain(r.expectedComplexity);
    expect(["Light", "Heavy", "Continuous"]).toContain(r.hitlRequired);
    expect(r.topRisks).toHaveLength(3);
    expect(r.recommendedWorkflow.length).toBeGreaterThan(20);
    expect(r.expectedMetric.day30).toBeTruthy();
    expect(r.expectedMetric.day60).toBeTruthy();
    expect(r.expectedMetric.day90).toBeTruthy();
  });

  it("classifies a strong-candidate intake correctly", () => {
    const r = scoreIntake({
      ...baseIntake,
      dataReadiness: "Real-time pipelines",
      teamSize: "51-200",
      timeline: "3-6 months",
      processDescription:
        "Step 1: data lands in warehouse. Step 2: agent reads. Step 3: agent drafts. Step 4: human approves. Step 5: ship. " +
        "Step 6: monitor. Step 7: iterate. Step 8: snapshot. Step 9: review weekly. Step 10: scale.",
      currentMetric: "100",
      targetMetric: "20",
    });
    expect(r.compositeScore).toBeGreaterThanOrEqual(70);
    expect(r.stage).toBe("Strong AI candidate");
  });

  it("classifies a not-ready intake correctly", () => {
    const r = scoreIntake({
      ...baseIntake,
      dataReadiness: "Mostly manual",
      teamSize: "1-10",
      timeline: "<30 days",
      processName: "",
      processDescription: "",
      currentMetric: "",
      targetMetric: "",
      bottleneck: "everything is manual and we have HIPAA compliance and legacy SAP",
    });
    expect(r.compositeScore).toBeLessThanOrEqual(50);
  });

  it("forecasts metric trajectory using parsed numbers when available", () => {
    const r = scoreIntake({
      ...baseIntake,
      currentMetric: "100 hours",
      targetMetric: "20 hours",
    });
    expect(r.expectedMetric.day30).toMatch(/\d/);
    expect(r.expectedMetric.day90).toMatch(/% of target gap closed/);
  });

  it("flags continuous HITL for regulated industries", () => {
    const r = scoreIntake({
      ...baseIntake,
      industry: "Healthcare",
      processDescription:
        "We process PII for HIPAA-regulated patient onboarding with audit and compliance review.",
    });
    expect(r.hitlRequired).toBe("Continuous");
  });
});
