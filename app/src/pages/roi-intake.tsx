import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IntakeData } from "@/lib/scoring";
import {
  validateStep,
  INDUSTRIES,
  DATA_READINESS_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TIMELINE_OPTIONS,
  type IntakeStep,
  type StepError,
} from "@/lib/validation";
import { encodeState } from "@/lib/share-link";

const TOTAL_STEPS: IntakeStep = 5;

const EMPTY: IntakeData = {
  companyName: "",
  industry: "Manufacturing",
  processName: "",
  processDescription: "",
  currentMetric: "",
  targetMetric: "",
  dataReadiness: "Some structured systems",
  teamSize: "11-50",
  bottleneck: "",
  timeline: "30-90 days",
};

export default function RoiIntake() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<IntakeStep>(1);
  const [intake, setIntake] = useState<IntakeData>(EMPTY);
  const [errors, setErrors] = useState<StepError[]>([]);
  const [generating, setGenerating] = useState(false);

  function next() {
    const stepErrors = validateStep(step, intake);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors([]);
    if (step < TOTAL_STEPS) {
      setStep((s) => (s + 1) as IntakeStep);
    } else {
      setGenerating(true);
      // Encode and navigate.
      setTimeout(() => {
        const token = encodeState(intake);
        setLocation(`/report?s=${token}`);
      }, 700);
    }
  }

  function back() {
    setErrors([]);
    if (step > 1) setStep((s) => (s - 1) as IntakeStep);
  }

  function update<K extends keyof IntakeData>(key: K, value: IntakeData[K]) {
    setIntake((prev) => ({ ...prev, [key]: value }));
  }

  const errorFor = (field: string) => errors.find((e) => e.field === field)?.message;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3 font-mono text-xs text-muted-foreground">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} data-testid="progress-intake" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {step === 1 && (
            <>
              <Header
                eyebrow="Step 1 — Context"
                title="Tell me about the company"
                body="One short answer each. Used to anchor the report."
              />
              <Field label="Company name" htmlFor="companyName" error={errorFor("companyName")}>
                <Input
                  id="companyName"
                  data-testid="input-company-name"
                  value={intake.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Acme Robotics"
                />
              </Field>
              <Field label="Industry" htmlFor="industry" error={errorFor("industry")}>
                <Select
                  value={intake.industry}
                  onValueChange={(v) => update("industry", v as IntakeData["industry"])}
                >
                  <SelectTrigger id="industry" data-testid="select-industry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Header
                eyebrow="Step 2 — Process"
                title="Which process are we scoring?"
                body="A short name and a paragraph. Steps and handoffs are gold here."
              />
              <Field label="Process name" htmlFor="processName" error={errorFor("processName")}>
                <Input
                  id="processName"
                  data-testid="input-process-name"
                  value={intake.processName}
                  onChange={(e) => update("processName", e.target.value)}
                  placeholder="Inbound RFQ triage"
                />
              </Field>
              <Field
                label="Process description"
                htmlFor="processDescription"
                error={errorFor("processDescription")}
                hint="Describe the actual steps, the systems involved, and where humans hand off."
              >
                <Textarea
                  id="processDescription"
                  data-testid="textarea-process-description"
                  rows={6}
                  value={intake.processDescription}
                  onChange={(e) => update("processDescription", e.target.value)}
                  placeholder="An RFQ comes in by email. AE forwards to ops, who manually checks inventory in SAP, then..."
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Header
                eyebrow="Step 3 — Metric"
                title="What's the metric, and where do you want it?"
                body="Use the same units. The leverage between the two drives the score."
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Current metric" htmlFor="currentMetric" error={errorFor("currentMetric")}>
                  <Input
                    id="currentMetric"
                    data-testid="input-current-metric"
                    value={intake.currentMetric}
                    onChange={(e) => update("currentMetric", e.target.value)}
                    placeholder="48 hours"
                  />
                </Field>
                <Field label="Target metric" htmlFor="targetMetric" error={errorFor("targetMetric")}>
                  <Input
                    id="targetMetric"
                    data-testid="input-target-metric"
                    value={intake.targetMetric}
                    onChange={(e) => update("targetMetric", e.target.value)}
                    placeholder="6 hours"
                  />
                </Field>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <Header
                eyebrow="Step 4 — Foundation"
                title="What's your foundation?"
                body="Your data and team realities, no judgment."
              />
              <Field label="Data readiness" htmlFor="dataReadiness" error={errorFor("dataReadiness")}>
                <Select
                  value={intake.dataReadiness}
                  onValueChange={(v) => update("dataReadiness", v as IntakeData["dataReadiness"])}
                >
                  <SelectTrigger id="dataReadiness" data-testid="select-data-readiness">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_READINESS_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Team size" htmlFor="teamSize" error={errorFor("teamSize")}>
                <Select
                  value={intake.teamSize}
                  onValueChange={(v) => update("teamSize", v as IntakeData["teamSize"])}
                >
                  <SelectTrigger id="teamSize" data-testid="select-team-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_SIZE_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}

          {step === 5 && (
            <>
              <Header
                eyebrow="Step 5 — Constraints"
                title="What's the bottleneck and the timeline?"
                body="Honesty here changes the recommendation more than anything else."
              />
              <Field
                label="Biggest bottleneck"
                htmlFor="bottleneck"
                error={errorFor("bottleneck")}
                hint="What's the thing that, if removed, would unlock everything else?"
              >
                <Textarea
                  id="bottleneck"
                  data-testid="textarea-bottleneck"
                  rows={4}
                  value={intake.bottleneck}
                  onChange={(e) => update("bottleneck", e.target.value)}
                  placeholder="The AE has to wait for ops to manually price, which can take a day."
                />
              </Field>
              <Field label="Desired timeline" htmlFor="timeline" error={errorFor("timeline")}>
                <Select
                  value={intake.timeline}
                  onValueChange={(v) => update("timeline", v as IntakeData["timeline"])}
                >
                  <SelectTrigger id="timeline" data-testid="select-timeline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-10">
        <Button variant="ghost" onClick={back} disabled={step === 1 || generating} data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={next}
          disabled={generating}
          className="font-mono min-w-[180px]"
          data-testid="button-next"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating report...
            </>
          ) : step === TOTAL_STEPS ? (
            <>
              Generate report <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Header({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-mono text-xs text-primary mb-2">{eyebrow}</div>
      <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{body}</p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p className="text-xs text-destructive font-mono" data-testid={`error-${htmlFor}`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
