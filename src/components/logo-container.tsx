import { Link } from "react-router-dom";

export const LogoContainer = () => {
  return (
    <Link to={"/"} className="flex items-center gap-2">
      <img
        src="/svg/logo.svg"
        alt="Logo"
        className="min-w-8 min-h-8 object-contain"
      />
      <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
        Prep<span className="text-primary">Genius</span>
      </span>
    </Link>
  );
};
