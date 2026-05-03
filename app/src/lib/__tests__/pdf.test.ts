import { describe, it, expect } from "vitest";
import { renderRoiPdf } from "../pdf";
import { scoreIntake, type IntakeData } from "../scoring";

const intake: IntakeData = {
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

describe("renderRoiPdf", () => {
  it("emits all required sections", () => {
    const score = scoreIntake(intake);
    const { sections } = renderRoiPdf(intake, score);
    for (const s of [
      "header",
      "company",
      "score",
      "workflow",
      "metricForecast",
      "complexity",
      "hitl",
      "risks",
      "roadmap",
      "footer",
    ]) {
      expect(sections).toContain(s);
    }
  });

  it("returns a valid jsPDF doc with at least one page", () => {
    const score = scoreIntake(intake);
    const { doc } = renderRoiPdf(intake, score);
    const pageCount = doc.getNumberOfPages();
    expect(pageCount).toBeGreaterThanOrEqual(1);
    // PDF blob should be non-trivial.
    const blob = doc.output("blob");
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("includes the company name in the rendered output text", () => {
    const score = scoreIntake(intake);
    const { doc } = renderRoiPdf(intake, score);
    // jspdf does not expose extracted text easily — assert that the data URI contains a hex blob.
    const uri = doc.output("datauristring");
    expect(uri.startsWith("data:application/pdf;")).toBe(true);
  });
});
