import { describe, it, expect } from "vitest";
import { validateStep } from "../validation";
import type { IntakeData } from "../scoring";

const validIntake: IntakeData = {
  companyName: "Acme",
  industry: "Manufacturing",
  processName: "RFQ Triage",
  processDescription:
    "Step 1: RFQ comes in. Step 2: AE classifies. Step 3: ops prices. Step 4: AE replies. Step 5: deal closes.",
  currentMetric: "48 hours",
  targetMetric: "6 hours",
  dataReadiness: "Modern data stack",
  teamSize: "51-200",
  bottleneck: "Manual price lookup in SAP and a slow email handoff between teams.",
  timeline: "30-90 days",
};

describe("validateStep", () => {
  it("passes a fully filled intake on every step", () => {
    for (const step of [1, 2, 3, 4, 5] as const) {
      expect(validateStep(step, validIntake)).toEqual([]);
    }
  });

  it("step 1 requires companyName", () => {
    const errs = validateStep(1, { ...validIntake, companyName: "" });
    expect(errs.find((e) => e.field === "companyName")).toBeTruthy();
  });

  it("step 2 requires processDescription >= 30 chars", () => {
    const errs = validateStep(2, { ...validIntake, processDescription: "too short" });
    expect(errs.find((e) => e.field === "processDescription")).toBeTruthy();
  });

  it("step 3 requires both metrics", () => {
    const errs = validateStep(3, { ...validIntake, currentMetric: "", targetMetric: "" });
    expect(errs.length).toBe(2);
  });

  it("step 5 requires bottleneck >= 10 chars", () => {
    const errs = validateStep(5, { ...validIntake, bottleneck: "short" });
    expect(errs.find((e) => e.field === "bottleneck")).toBeTruthy();
  });
});
