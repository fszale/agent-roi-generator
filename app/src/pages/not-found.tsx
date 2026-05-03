import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-6 py-16 bg-cream text-navy">
      <div className="max-w-xl w-full text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-orange mb-4">
          404 — page not found
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
          That page isn't here.
        </h1>
        <p className="text-base text-navy/70 mb-8">
          You may have followed a stale link, or trimmed the URL by hand. Both
          tools are one click away.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-orange text-cream hover:bg-orange/90 font-mono">
              Run an ROI report
            </Button>
          </Link>
          <Link href="/scorecard">
            <Button
              variant="outline"
              className="border-navy text-navy hover:bg-navy hover:text-cream font-mono"
            >
              Take the readiness scorecard
            </Button>
          </Link>
        </div>
        <p className="mt-10 font-mono text-xs text-navy/50">
          Built by Filip Szalewicz · solidcage.com
        </p>
      </div>
    </div>
  );
}
