import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardCheck, Gauge, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card font-mono text-xs text-muted-foreground mb-6">
          <Sparkles className="h-3 w-3 text-primary" />
          Two free tools from solidcage.com
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Score your AI use case.{" "}
          <span className="text-primary">Get a 30/60/90 plan.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Built for operators who are tired of vague AI strategy decks. Two stateless tools — no signup, no email
          required. Take five minutes, get a real plan.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full flex flex-col" data-testid="card-roi">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">~5 minutes</span>
              </div>
              <CardTitle className="text-2xl">ROI Report Generator</CardTitle>
              <CardDescription className="text-base">
                A 5-step intake. Get an opportunity score, recommended workflow, expected metric trajectory, complexity
                rating, top 3 risks, and a 30/60/90 roadmap. Export the report as PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button asChild size="lg" className="w-full font-mono" data-testid="button-start-roi">
                <Link href="/intake">
                  Start ROI assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full flex flex-col" data-testid="card-scorecard">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-accent" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">~2 minutes</span>
              </div>
              <CardTitle className="text-2xl">Agentic Readiness Scorecard</CardTitle>
              <CardDescription className="text-base">
                12 questions across 5 dimensions: Data, Process, Tool Adoption, Governance, and Leadership. See where
                your organization stands on the agentic readiness curve. Shareable.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full font-mono"
                data-testid="button-start-scorecard"
              >
                <Link href="/scorecard">
                  Take the scorecard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6 text-sm">
        <Pillar
          title="Stateless by design"
          body="No accounts. No data sent to a server. Your inputs live in your browser only — share via a compressed link if you want."
        />
        <Pillar
          title="Rule-based scoring"
          body="No black-box LLM grading. Every dimension and weight is configurable JSON. Audit it, fork it, change it."
        />
        <Pillar
          title="Built for the call"
          body="The output is the artifact you bring to the strategy session. Either with us, or with whoever helps you ship."
        />
      </div>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-border/60 bg-card rounded-lg p-5">
      <div className="font-mono text-xs text-primary mb-2">{title}</div>
      <p className="text-muted-foreground">{body}</p>
    </div>
  );
}
