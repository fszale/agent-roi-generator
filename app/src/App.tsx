import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import RoiIntake from "@/pages/roi-intake";
import RoiReport from "@/pages/roi-report";
import ScorecardLanding from "@/pages/scorecard-landing";
import ScorecardQuiz from "@/pages/scorecard-quiz";
import ScorecardResults from "@/pages/scorecard-results";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/intake" component={RoiIntake} />
        <Route path="/report" component={RoiReport} />
        <Route path="/scorecard" component={ScorecardLanding} />
        <Route path="/scorecard/quiz" component={ScorecardQuiz} />
        <Route path="/scorecard/results" component={ScorecardResults} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
