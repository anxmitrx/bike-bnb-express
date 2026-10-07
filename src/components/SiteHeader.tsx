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
    <header className="sticky top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-5xl rounded-2xl border border-white/20 bg-frost/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center justify-between px-5 py-3 sm:px-6 sm:py-3.5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground sm:flex">
          <Link to="/bikes" className="transition-colors hover:text-brand" activeProps={{ className: "text-foreground" }}>
            Browse bikes
          </Link>
          <Link to="/list-bike" className="transition-colors hover:text-brand" activeProps={{ className: "text-foreground" }}>
            List my bike
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
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/admin" className="transition-colors hover:text-brand">Admin access</Link>
          <span>© 2026 Velocité. Every listing verified before it goes live.</span>
        </div>
      </div>
    </footer>
  );
}
