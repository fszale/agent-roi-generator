import { jsPDF } from "jspdf";
import type { IntakeData, ROIScoreResult, DimensionKey } from "./scoring";
import { dimensionLabel } from "./scoring";
import { generateRoadmap } from "./roadmap";

export type PdfSection =
  | "header"
  | "company"
  | "score"
  | "workflow"
  | "metricForecast"
  | "complexity"
  | "hitl"
  | "risks"
  | "roadmap"
  | "footer";

export type PdfRenderResult = {
  doc: jsPDF;
  sections: PdfSection[];
};

const NAVY = "#0E1320";
const ORANGE = "#EB6928";
const BLUE = "#387CBD";
const MUTED = "#6B7280";

export function renderRoiPdf(intake: IntakeData, score: ROIScoreResult): PdfRenderResult {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const sections: PdfSection[] = [];
  const margin = 48;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  // Header
  doc.setFillColor(NAVY);
  doc.rect(0, 0, pageWidth, 84, "F");
  doc.setTextColor("#F4F1EC");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Agent ROI Report", margin, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("solidcage.com — by Filip Szalewicz", margin, 56);
  doc.setTextColor(ORANGE);
  doc.setFont("helvetica", "bold");
  doc.text(new Date().toLocaleDateString(), pageWidth - margin, 38, { align: "right" });
  y = 110;
  sections.push("header");

  // Company block
  doc.setTextColor(NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(intake.companyName || "Company", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text(`${intake.industry} · ${intake.processName}`, margin, y);
  y += 22;
  sections.push("company");

  // Score badge
  doc.setFillColor("#FFFFFF");
  doc.setDrawColor(NAVY);
  doc.roundedRect(margin, y, contentWidth, 64, 6, 6, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(ORANGE);
  doc.text(`${score.compositeScore}`, margin + 16, y + 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text("Opportunity score (0–100)", margin + 70, y + 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(NAVY);
  doc.text(score.stage, margin + 70, y + 46);
  y += 80;
  sections.push("score");

  // Recommended workflow
  y = sectionHeading(doc, "Recommended first workflow", y, margin);
  y = paragraph(doc, score.recommendedWorkflow, y, margin, contentWidth);
  sections.push("workflow");

  // Metric forecast
  y = sectionHeading(doc, "Expected metric trajectory", y + 6, margin);
  y = bullet(doc, `30 days: ${score.expectedMetric.day30}`, y, margin, contentWidth);
  y = bullet(doc, `60 days: ${score.expectedMetric.day60}`, y, margin, contentWidth);
  y = bullet(doc, `90 days: ${score.expectedMetric.day90}`, y, margin, contentWidth);
  sections.push("metricForecast");

  // Complexity & HITL
  y = sectionHeading(doc, "Implementation profile", y + 6, margin);
  y = paragraph(
    doc,
    `Complexity: ${score.expectedComplexity}.   Human-in-the-loop: ${score.hitlRequired}.`,
    y,
    margin,
    contentWidth,
  );
  sections.push("complexity");
  sections.push("hitl");

  // Dimensions
  y = sectionHeading(doc, "Dimension breakdown", y + 6, margin);
  for (const key of Object.keys(score.dimensions) as DimensionKey[]) {
    const v = score.dimensions[key];
    y = bullet(doc, `${dimensionLabel(key)}: ${v}/10`, y, margin, contentWidth);
  }

  // Risks
  y = ensureRoom(doc, y, 80, margin);
  y = sectionHeading(doc, "Top 3 risks", y + 6, margin);
  for (const risk of score.topRisks) {
    y = bullet(doc, risk, y, margin, contentWidth);
  }
  sections.push("risks");

  // Roadmap
  y = ensureRoom(doc, y, 160, margin);
  y = sectionHeading(doc, "30 / 60 / 90-day roadmap", y + 6, margin);
  for (const ms of generateRoadmap(intake, score)) {
    y = ensureRoom(doc, y, 90, margin);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BLUE);
    doc.text(`${ms.window} — ${ms.theme}`, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(NAVY);
    for (const d of ms.deliverables) {
      y = bullet(doc, d, y, margin, contentWidth);
    }
    doc.setFont("helvetica", "italic");
    doc.setTextColor(MUTED);
    y = paragraph(doc, `Exit: ${ms.exitCriteria}`, y, margin, contentWidth);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(NAVY);
    y += 4;
  }
  sections.push("roadmap");

  // Footer CTA
  y = ensureRoom(doc, y, 60, margin);
  doc.setFillColor("#0E1320");
  doc.rect(0, doc.internal.pageSize.getHeight() - 56, pageWidth, 56, "F");
  doc.setTextColor("#F4F1EC");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Book a Strategy Session with Filip", margin, doc.internal.pageSize.getHeight() - 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(ORANGE);
  doc.text("crm.solidcage.com/book", margin, doc.internal.pageSize.getHeight() - 16);
  sections.push("footer");

  return { doc, sections };
}

function sectionHeading(doc: jsPDF, text: string, y: number, margin: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(NAVY);
  doc.text(text, margin, y);
  doc.setDrawColor("#E2DFD8");
  doc.line(margin, y + 4, doc.internal.pageSize.getWidth() - margin, y + 4);
  return y + 18;
}

function paragraph(doc: jsPDF, text: string, y: number, margin: number, width: number): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(NAVY);
  const lines = doc.splitTextToSize(text, width);
  for (const line of lines) {
    y = ensureRoom(doc, y, 14, margin);
    doc.text(line, margin, y);
    y += 13;
  }
  return y;
}

function bullet(doc: jsPDF, text: string, y: number, margin: number, width: number): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(NAVY);
  const lines = doc.splitTextToSize(text, width - 14);
  let first = true;
  for (const line of lines) {
    y = ensureRoom(doc, y, 14, margin);
    if (first) {
      doc.setTextColor(ORANGE);
      doc.text("•", margin, y);
      doc.setTextColor(NAVY);
      first = false;
    }
    doc.text(line, margin + 12, y);
    y += 13;
  }
  return y;
}

function ensureRoom(doc: jsPDF, y: number, needed: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - margin) {
    doc.addPage();
    return margin;
  }
  return y;
}

export function downloadPdf(intake: IntakeData, score: ROIScoreResult): PdfRenderResult {
  const result = renderRoiPdf(intake, score);
  const safeName = (intake.companyName || "company").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  result.doc.save(`agent-roi-${safeName}.pdf`);
  return result;
}
