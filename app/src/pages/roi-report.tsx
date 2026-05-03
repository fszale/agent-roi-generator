import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Copy, Download, ExternalLink, FileText, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DimensionKey, IntakeData } from "@/lib/scoring";
import { dimensionLabel, scoreIntake } from "@/lib/scoring";
import { generateRoadmap } from "@/lib/roadmap";
import { downloadPdf } from "@/lib/pdf";
import { readStateFromQuery, buildShareUrl } from "@/lib/share-link";

export default function RoiReport() {
  const [location] = useLocation();
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const decoded = readStateFromQuery<IntakeData>(search);
    setIntake(decoded);
  }, [location]);

  const result = useMemo(() => (intake ? scoreIntake(intake) : null), [intake]);
  const roadmap = useMemo(
    () => (intake && result ? generateRoadmap(intake, result) : []),
    [intake, result],
  );

  if (!intake || !result) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-3">No report data found</h2>
        <p className="text-muted-foreground mb-6">
          The shareable link is missing or expired. Run the assessment again.
        </p>
        <Button asChild>
          <Link href="/intake">Start a new ROI report</Link>
        </Button>
      </div>
    );
  }

  function copyShareLink() {
    if (!intake) return;
    const url = buildShareUrl("report", intake);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const dimensions = Object.keys(result.dimensions) as DimensionKey[];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="font-mono text-xs text-primary mb-2">ROI REPORT · {new Date().toLocaleDateString()}</div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3" data-testid="text-company">
          {intake.companyName}
        </h1>
        <p className="text-muted-foreground mb-8">
          {intake.industry} · {intake.processName}
        </p>
      </motion.div>

      {/* Score badge */}
      <Card className="mb-10 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-[200px_1fr] items-stretch">
            <div className="bg-foreground text-background p-6 flex flex-col items-center justify-center">
              <div className="font-mono text-xs uppercase tracking-wider text-background/60">Opportunity</div>
              <div className="text-6xl font-bold text-primary leading-none my-2" data-testid="text-score">
                {result.compositeScore}
              </div>
              <div className="font-mono text-xs text-background/60">/ 100</div>
            </div>
            <div className="p-6 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="font-mono" data-testid="badge-stage">
                  {result.stage}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  Complexity: {result.expectedComplexity}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  HITL: {result.hitlRequired}
                </Badge>
              </div>
              <div className="text-lg font-medium" data-testid="text-recommended-workflow">
                {result.recommendedWorkflow}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-mono">Dimension breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dimensions.map((key) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{dimensionLabel(key)}</span>
                  <span className="font-mono text-muted-foreground">{result.dimensions[key]}/10</span>
                </div>
                <Progress value={result.dimensions[key] * 10} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-mono">Expected metric trajectory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Trajectory window="30 days" value={result.expectedMetric.day30} />
            <Trajectory window="60 days" value={result.expectedMetric.day60} />
            <Trajectory window="90 days" value={result.expectedMetric.day90} />
          </CardContent>
        </Card>
      </div>

      {/* Risks */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-base font-mono flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" /> Top 3 risks to manage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.topRisks.map((risk, i) => (
              <li key={i} className="flex gap-3 text-sm" data-testid={`risk-${i}`}>
                <span className="font-mono text-primary">{i + 1}.</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-base font-mono flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> 30 / 60 / 90-day roadmap
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Window</TableHead>
                <TableHead className="w-[200px]">Theme</TableHead>
                <TableHead>Deliverables</TableHead>
                <TableHead className="w-[260px]">Exit criteria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roadmap.map((ms) => (
                <TableRow key={ms.window} data-testid={`roadmap-row-${ms.window}`}>
                  <TableCell className="font-mono text-sm">{ms.window}</TableCell>
                  <TableCell className="font-medium text-sm">{ms.theme}</TableCell>
                  <TableCell>
                    <ul className="space-y-1 text-sm">
                      {ms.deliverables.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground italic">{ms.exitCriteria}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-12">
        <Button onClick={() => downloadPdf(intake, result)} className="font-mono" data-testid="button-download-pdf">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
        <Button variant="outline" onClick={copyShareLink} className="font-mono" data-testid="button-copy-share">
          <Copy className="mr-2 h-4 w-4" /> {copied ? "Copied!" : "Copy shareable link"}
        </Button>
        <Button asChild variant="outline" className="font-mono">
          <Link href="/intake">
            <FileText className="mr-2 h-4 w-4" /> Re-run intake
          </Link>
        </Button>
      </div>

      {/* Footer CTA */}
      <Card className="bg-foreground text-background">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to actually ship this?</h3>
          <p className="text-background/70 mb-6">
            Bring this report to a 30-minute strategy session with Filip. We'll pressure-test the plan and decide
            scope.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="font-mono" data-testid="button-book-cta">
              <a href="https://solidcage.com/book" target="_blank" rel="noreferrer">
                Book a Strategy Session <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-mono bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/scorecard">Take the readiness scorecard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Trajectory({ window, value }: { window: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 pb-2 last:border-0">
      <span className="font-mono text-muted-foreground min-w-[80px]">{window}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
