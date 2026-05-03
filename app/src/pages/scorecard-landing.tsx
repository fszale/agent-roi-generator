import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCORECARD_DIMENSIONS } from "@/lib/scorecard";

export default function ScorecardLanding() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card font-mono text-xs text-muted-foreground mb-6">
          <ClipboardCheck className="h-3 w-3 text-accent" />
          12 questions · 2 minutes · stateless
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Where does your organization sit on the agentic readiness curve?
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          12 questions across 5 dimensions. You'll get an overall score, a stage label, a per-dimension radar, and
          two or three specific observations you can act on this week.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-10">
          {SCORECARD_DIMENSIONS.map((d) => (
            <div key={d.key} className="border border-border/60 bg-card rounded-lg p-4">
              <div className="font-mono text-xs text-accent mb-1">{d.label}</div>
              <p className="text-sm text-muted-foreground">{d.description}</p>
            </div>
          ))}
        </div>

        <Button asChild size="lg" className="font-mono" data-testid="button-start-quiz">
          <Link href="/scorecard/quiz">
            Start the scorecard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
