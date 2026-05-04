import { Container } from "@/components/container";
import { MainRoutes } from "@/lib/helper";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background">
      <Container>
        <div className="grid gap-8 py-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">PrepGenius</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              AI-assisted interview practice for creating targeted mock sessions, reviewing feedback, and improving with your own progress data.
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {MainRoutes.map((route) => (
              <Link key={route.href} to={route.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {route.label}
              </Link>
            ))}
            <Link to="/generate" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80">
              Start practicing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
};
