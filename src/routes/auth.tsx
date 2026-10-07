import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign up or sign in — Velocité" },
      { name: "description", content: "Create your Velocité account with your name, location and phone number." },
      { property: "og:title", content: "Join Velocité" },
      { property: "og:description", content: "Sign up to rent or list bikes near you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/choose",
          data: {
            full_name: String(f.get("name")).trim(),
            location: String(f.get("location")).trim(),
            phone: String(f.get("phone")).trim(),
          },
        },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      if (data.session) navigate({ to: "/choose" });
      else setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/choose" });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-8"><Logo /></div>
      <div className="glass w-full max-w-md rounded-[18px] p-6 sm:p-8">
        {sent ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">We sent you a confirmation link. Click it to finish signing up.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup" ? "We'll show bikes available in your location." : "Sign in to continue."}
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <>
                  <Field name="name" label="Full name" required />
                  <Field name="location" label="Location (city)" placeholder="e.g. Kolkata" required />
                  <Field name="phone" label="Phone number" type="tel" pattern="[0-9+\- ]{7,15}" required />
                </>
              )}
              <Field name="email" label="Email" type="email" required />
              <Field name="password" label="Password" type="password" minLength={6} required />
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-brand"
            >
              {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ name, label, ...props }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="h-11 rounded-xl bg-frost/80" {...props} />
    </div>
  );
}
