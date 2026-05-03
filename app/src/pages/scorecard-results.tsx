import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Copy, ExternalLink, FileText, RotateCcw } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SCORECARD_DIMENSIONS, scoreScorecard, radarData, type ScorecardAnswers } from "@/lib/scorecard";
import { buildShareUrl, readStateFromQuery } from "@/lib/share-link";

function renderObservation(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const match = /^\*\*(.+)\*\*$/.exec(part);
    if (match) return <strong key={i}>{match[1]}</strong>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function ScorecardResults() {
  const [location] = useLocation();
  const [answers, setAnswers] = useState<ScorecardAnswers | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const decoded = readStateFromQuery<ScorecardAnswers>(search);
    setAnswers(decoded);
  }, [location]);

  const result = useMemo(() => (answers ? scoreScorecard(answers) : null), [answers]);

  if (!answers || !result) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-3">No scorecard results found</h2>
        <p className="text-muted-foreground mb-6">The shareable link is missing or expired.</p>
        <Button asChild>
          <Link href="/scorecard">Take the scorecard</Link>
        </Button>
      </div>
    );
  }

  const data = radarData(result.byDimension);

  function copyShareLink() {
    if (!answers) return;
    const url = buildShareUrl("scorecard/results", answers);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="font-mono text-xs text-primary mb-2">AGENTIC READINESS SCORECARD</div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3">{result.stage.label}</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">{result.stage.summary}</p>
      </motion.div>

      {/* Score + Radar */}
      <div className="grid md:grid-cols-[280px_1fr] gap-6 mb-10">
        <Card className="overflow-hidden">
          <CardContent className="p-0 h-full">
            <div className="bg-foreground text-background p-6 flex flex-col items-center justify-center h-full">
              <div className="font-mono text-xs uppercase tracking-wider text-background/60">Overall</div>
              <div className="text-7xl font-bold text-primary leading-none my-2" data-testid="text-overall-score">
                {result.overall}
              </div>
              <div className="font-mono text-xs text-background/60">/ 100</div>
              <Badge variant="default" className="mt-4 font-mono" data-testid="badge-stage">
                {result.stage.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-mono">Dimension radar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]" data-testid="chart-radar">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-dimension breakdown */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-base font-mono">Per-dimension scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SCORECARD_DIMENSIONS.map((d) => (
            <div key={d.key} className="space-y-1.5" data-testid={`dim-${d.key}`}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{d.label}</span>
                <span className="font-mono text-muted-foreground">{result.byDimension[d.key]}/100</span>
              </div>
              <Progress value={result.byDimension[d.key]} />
              <p className="text-xs text-muted-foreground">{d.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Observations */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="text-base font-mono">What this means for you</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.observations.map((obs, i) => (
              <li key={i} className="flex gap-3 text-sm" data-testid={`observation-${i}`}>
                <span className="font-mono text-primary">{i + 1}.</span>
                <span>{renderObservation(obs)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-border/40 pt-4">
            <div className="font-mono text-xs text-primary mb-2">RECOMMENDED NEXT STEP</div>
            <p className="text-base" data-testid="text-next-step">
              {result.nextStep}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-12">
        <Button variant="outline" onClick={copyShareLink} className="font-mono" data-testid="button-copy-share">
          <Copy className="mr-2 h-4 w-4" /> {copied ? "Copied!" : "Copy shareable link"}
        </Button>
        <Button asChild variant="outline" className="font-mono">
          <Link href="/scorecard/quiz">
            <RotateCcw className="mr-2 h-4 w-4" /> Re-take
          </Link>
        </Button>
      </div>

      {/* Footer CTA */}
      <Card className="bg-foreground text-background">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Want a deeper plan?</h3>
          <p className="text-background/70 mb-6">
            The scorecard tells you where you are. The ROI generator tells you what to ship first.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="font-mono" data-testid="button-roi-cta">
              <Link href="/intake">
                <FileText className="mr-2 h-4 w-4" /> Generate the full ROI report
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-mono bg-transparent border-background/30 text-background hover:bg-background/10 hover:text-background"
            >
              <a href="https://solidcage.com/book" target="_blank" rel="noreferrer">
                Book a Readiness Review <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
