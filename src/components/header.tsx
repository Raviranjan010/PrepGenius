import { cn } from "@/lib/utils";
import { Container } from "./container";
import { MainRoutes } from "@/lib/helper";
import { NavLink, Link } from "react-router-dom";
import { ProfileContainer } from "@/containers/profile-container";
import { ToggleContainer } from "@/containers/toggle-container";
import { useAuth } from "@clerk/clerk-react";
import { Sparkles } from "lucide-react";

export const Header = () => {
  const { userId } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3">
      <Container className="py-0">
        <div className="cream-panel flex h-16 items-center justify-between gap-4 rounded-2xl px-4 md:px-7">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111118] shadow-lg shadow-black/10">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Prep<span className="text-primary">Genius</span>
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {MainRoutes.map((route) => (
                <HeaderNavLink key={route.href} to={route.href}>
                  {route.label}
                </HeaderNavLink>
              ))}

              {userId && (
                <>
                  <HeaderNavLink to="/generate">Dashboard</HeaderNavLink>
                  <HeaderNavLink to="/generate/stats">Intelligence</HeaderNavLink>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Auth/Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-border/60">
              <ProfileContainer />
              <ToggleContainer />
            </div>
            
            {!userId && (
              <Link
                to="/sign-in"
                className="hidden md:inline-flex h-10 items-center justify-center rounded-xl border border-white/70 bg-white/55 px-5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-white active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};

function HeaderNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "relative px-4 py-2 text-sm font-medium transition-all hover:text-primary",
          isActive ? "text-foreground" : "text-muted-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
          )}
        </>
      )}
    </NavLink>
  );
}
