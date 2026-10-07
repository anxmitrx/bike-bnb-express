import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-[10px] bg-ink font-display text-sm font-bold text-frost">V</span>
      <span className="font-display text-lg font-semibold tracking-tight">Velocité</span>
    </Link>
  );
}

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-frost/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground sm:flex">
          <Link to="/bikes" className="transition-colors hover:text-brand" activeProps={{ className: "text-foreground" }}>
            Browse bikes
          </Link>
          <Link to="/list-bike" className="transition-colors hover:text-brand" activeProps={{ className: "text-foreground" }}>
            List my bike
          </Link>
          <Link to="/admin" className="transition-colors hover:text-brand" activeProps={{ className: "text-foreground" }}>
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {signedIn ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Get started</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-frost/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 sm:flex-row sm:items-center">
        <span className="text-sm font-medium text-muted-foreground">Velocité — ride the neighborhood.</span>
        <p className="text-xs text-muted-foreground">© 2026 Velocité. Every listing verified before it goes live.</p>
      </div>
    </footer>
  );
}
