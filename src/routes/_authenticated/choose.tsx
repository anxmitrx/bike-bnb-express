import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProfile } from "@/lib/profile";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/_authenticated/choose")({
  head: () => ({ meta: [{ title: "Rent or list? — Velocité" }, { name: "description", content: "Choose whether to rent a bike or give yours for rent." }] }),
  component: Choose,
});

function Choose() {
  const navigate = useNavigate();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchMyProfile });

  async function pick(role: "renter" | "owner") {
    if (profile) await supabase.from("profiles").update({ role }).eq("id", profile.id);
    navigate({ to: role === "renter" ? "/bikes" : "/list-bike" });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Hi{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}. What brings you here?
        </h1>
        <p className="mt-3 text-muted-foreground">You can switch any time from the top menu.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button onClick={() => pick("renter")} className="rounded-[18px] bg-brand p-8 text-left text-frost ring-1 ring-brand/40 transition-transform hover:-translate-y-1">
            <span className="block font-display text-2xl font-semibold">I want to rent</span>
            <span className="mt-1 block text-sm text-frost/85">See bikes available in {profile?.location || "your area"}</span>
          </button>
          <button onClick={() => pick("owner")} className="glass rounded-[18px] p-8 text-left transition-transform hover:-translate-y-1">
            <span className="block font-display text-2xl font-semibold">I'll give for rent</span>
            <span className="mt-1 block text-sm text-muted-foreground">List your bike — live after admin approval</span>
          </button>
        </div>
      </section>
    </div>
  );
}
