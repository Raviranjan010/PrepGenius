import { cn } from "@/lib/utils";
import { Container } from "./container";
import { MainRoutes } from "@/lib/helper";
import { NavLink, Link } from "react-router-dom";
import { ProfileContainer } from "@/containers/profile-container";
import { ToggleContainer } from "@/containers/toggle-container";
import { useAuth } from "@clerk/clerk-react";
import { Zap } from "lucide-react";

export const Header = () => {
  const { userId } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl transition-all duration-300"
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10">
                <Zap className="h-5 w-5 text-primary fill-primary/20 group-hover:fill-primary transition-all" />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground uppercase">
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
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <ProfileContainer />
              <ToggleContainer />
            </div>
            
            {!userId && (
              <Link
                to="/sign-in"
                className="hidden md:inline-flex h-9 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
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
          "relative px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          )}
        </>
      )}
    </NavLink>
  );
}
