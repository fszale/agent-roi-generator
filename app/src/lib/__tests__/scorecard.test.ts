import { describe, it, expect } from "vitest";
import {
  SCORECARD_QUESTIONS,
  SCORECARD_DIMENSIONS,
  STAGES,
  scoreScorecard,
  dimensionScore,
  overallScore,
  stageFor,
  generateObservations,
  nextStepFor,
  radarData,
  type ScorecardAnswer,
  type ScorecardAnswers,
} from "../scorecard";

function answersOf(answer: ScorecardAnswer): ScorecardAnswers {
  const out: ScorecardAnswers = {};
  for (const q of SCORECARD_QUESTIONS) out[q.id] = answer;
  return out;
}

describe("scorecard structure", () => {
  it("has exactly 12 questions", () => {
    expect(SCORECARD_QUESTIONS).toHaveLength(12);
  });

  it("covers all 5 dimensions", () => {
    const dims = new Set(SCORECARD_QUESTIONS.map((q) => q.dimension));
    expect(dims.size).toBe(5);
    for (const d of SCORECARD_DIMENSIONS) {
      expect(dims.has(d.key)).toBe(true);
    }
  });

  it("every question has 4 options", () => {
    for (const q of SCORECARD_QUESTIONS) {
      expect(q.options).toHaveLength(4);
    }
  });
});

describe("dimensionScore + overallScore", () => {
  it("returns 0 when all answers are 'not started'", () => {
    const all0 = answersOf(0);
    expect(overallScore(all0)).toBe(0);
    for (const d of SCORECARD_DIMENSIONS) {
      expect(dimensionScore(all0, d.key)).toBe(0);
    }
  });

  it("returns 100 when all answers are 'in production'", () => {
    const all3 = answersOf(3);
    expect(overallScore(all3)).toBe(100);
    for (const d of SCORECARD_DIMENSIONS) {
      expect(dimensionScore(all3, d.key)).toBe(100);
    }
  });

  it("treats missing answers as 0", () => {
    expect(overallScore({})).toBe(0);
  });

  it("scales linearly", () => {
    expect(overallScore(answersOf(1))).toBeGreaterThan(0);
    expect(overallScore(answersOf(2))).toBeGreaterThan(overallScore(answersOf(1)));
  });
});

describe("stageFor — all 5 stages", () => {
  it("Stage 1 (Exploring) at score 0", () => {
    expect(stageFor(0).id).toBe(1);
    expect(stageFor(19).id).toBe(1);
  });
  it("Stage 2 (Piloting) at score 20", () => {
    expect(stageFor(20).id).toBe(2);
    expect(stageFor(39).id).toBe(2);
  });
  it("Stage 3 (Scaling) at score 40", () => {
    expect(stageFor(40).id).toBe(3);
    expect(stageFor(59).id).toBe(3);
  });
  it("Stage 4 (Optimizing) at score 60", () => {
    expect(stageFor(60).id).toBe(4);
    expect(stageFor(79).id).toBe(4);
  });
  it("Stage 5 (Operating) at score 80+", () => {
    expect(stageFor(80).id).toBe(5);
    expect(stageFor(100).id).toBe(5);
    expect(stageFor(80).label).toContain("Operating");
  });
  it("nextStepFor returns a non-empty hint for every stage", () => {
    for (const s of STAGES) {
      expect(nextStepFor(s).length).toBeGreaterThan(20);
    }
  });
});

describe("generateObservations", () => {
  it("flags lowest and highest dimension", () => {
    const byDim = {
      dataReadiness: 90,
      processDocumentation: 10,
      toolAdoption: 50,
      governance: 60,
      leadership: 70,
    };
    const obs = generateObservations(byDim);
    expect(obs.length).toBeGreaterThanOrEqual(3);
    const joined = obs.join(" ");
    expect(joined).toContain("Process Documentation");
    expect(joined).toContain("Data Readiness");
  });

  it("flags governance lag when tools outpace governance", () => {
    const byDim = {
      dataReadiness: 80,
      processDocumentation: 80,
      toolAdoption: 80,
      governance: 20,
      leadership: 80,
    };
    const obs = generateObservations(byDim).join(" ").toLowerCase();
    expect(obs).toMatch(/govern/);
  });

  it("returns at least 3 observations", () => {
    const byDim = {
      dataReadiness: 50,
      processDocumentation: 50,
      toolAdoption: 50,
      governance: 50,
      leadership: 50,
    };
    expect(generateObservations(byDim).length).toBeGreaterThanOrEqual(3);
  });
});

describe("scoreScorecard", () => {
  it("returns a fully-populated result", () => {
    const r = scoreScorecard(answersOf(2));
    expect(r.overall).toBeGreaterThan(0);
    expect(r.stage).toBeTruthy();
    expect(r.observations.length).toBeGreaterThanOrEqual(3);
    expect(r.nextStep.length).toBeGreaterThan(20);
    expect(Object.keys(r.byDimension)).toHaveLength(5);
  });
});

describe("radarData", () => {
  it("returns 5 entries with score and fullMark", () => {
    const r = scoreScorecard(answersOf(2));
    const data = radarData(r.byDimension);
    expect(data).toHaveLength(5);
    for (const d of data) {
      expect(d.dimension).toBeTruthy();
      expect(d.score).toBe(r.byDimension[
        SCORECARD_DIMENSIONS.find((s) => d.dimension === s.label.replace(/^Data\b/, "Data").replace(/^AI Tool /, "Tool "))!.key
      ]);
      expect(d.fullMark).toBe(100);
    }
  });
});
