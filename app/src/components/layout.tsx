import { Link, useLocation } from "wouter";
import { Hexagon } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "ROI Generator" },
  { href: "/scorecard", label: "Scorecard" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/" || location.startsWith("/intake") || location.startsWith("/report");
    return location.startsWith(href);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
            <Hexagon className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="font-mono font-bold tracking-tight">solidcage</span>
            <span className="font-mono text-xs text-muted-foreground hidden sm:inline">/ tools</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-testid={`nav-${link.href.replace("/", "") || "home"}`}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button asChild variant="default" size="sm" className="font-mono">
              <a href="https://crm.solidcage.com/widget/bookings/filip-szalewicz-fractional-cto-calendar-vfs0lblxh" target="_blank" rel="noreferrer" data-testid="button-book-header">
                Book Session
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="border-t border-border/40 bg-card/30 mt-auto">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground font-mono">
            <a
              href="https://solidcage.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built by Filip Szalewicz · solidcage.com
            </a>
          </div>
          <div className="flex gap-4 text-sm font-mono">
            <a
              href="https://github.com/fszale/agent-roi-generator"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              source
            </a>
            <a
              href="https://github.com/fszale/agent-kernel"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              kernel
            </a>
            <a
              href="https://crm.solidcage.com/widget/bookings/filip-szalewicz-fractional-cto-calendar-vfs0lblxh"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              book
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
