import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { SCORECARD_QUESTIONS, type ScorecardAnswer, type ScorecardAnswers } from "@/lib/scorecard";
import { encodeState } from "@/lib/share-link";

export default function ScorecardQuiz() {
  const [, setLocation] = useLocation();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ScorecardAnswers>({});
  const total = SCORECARD_QUESTIONS.length;
  const question = SCORECARD_QUESTIONS[index];

  function pick(answer: ScorecardAnswer) {
    const next: ScorecardAnswers = { ...answers, [question.id]: answer };
    setAnswers(next);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      const token = encodeState(next);
      setLocation(`/scorecard/results?s=${token}`);
    }
  }

  function back() {
    if (index > 0) setIndex(index - 1);
  }

  const current = answers[question.id];

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3 font-mono text-xs text-muted-foreground">
          <span>Question {index + 1} of {total}</span>
          <span className="capitalize">{question.dimension.replace(/([A-Z])/g, " $1")}</span>
        </div>
        <Progress value={((index + 1) / total) * 100} data-testid="progress-quiz" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8" data-testid="text-question">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt, i) => {
              const selected = current === i;
              return (
                <Card
                  key={i}
                  className={`cursor-pointer transition-all hover-elevate ${
                    selected ? "border-primary ring-2 ring-primary/30" : ""
                  }`}
                  onClick={() => pick(i as ScorecardAnswer)}
                  data-testid={`option-${i}`}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div
                      className={`h-7 w-7 rounded-full border-2 flex items-center justify-center font-mono text-xs ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-base">{opt}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-10">
        <Button variant="ghost" onClick={back} disabled={index === 0} data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <span className="text-xs text-muted-foreground font-mono self-center">
          Click an answer to continue <ArrowRight className="inline h-3 w-3 ml-1" />
        </span>
      </div>
    </div>
  );
}
