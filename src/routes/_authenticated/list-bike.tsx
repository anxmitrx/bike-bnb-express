import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProfile, inr } from "@/lib/profile";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/list-bike")({
  head: () => ({ meta: [{ title: "List your bike — Velocité" }, { name: "description", content: "Submit your bike for rent. It goes live after admin approval." }] }),
  component: ListBike,
});

const statusStyle: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-accent text-accent-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

function ListBike() {
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchMyProfile });
  const [saving, setSaving] = useState(false);
  const { data: mine = [], refetch } = useQuery({
    queryKey: ["my-bikes", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase.from("bikes").select("*").eq("owner_id", profile!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    setSaving(true);
    const { error } = await supabase.from("bikes").insert({
      owner_id: profile.id,
      owner_name: String(f.get("owner_name")).trim(),
      model: String(f.get("model")).trim(),
      price_per_day: Number(f.get("price")),
      location: String(f.get("location")).trim(),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Request sent! Your bike goes live once the admin approves it.");
    form.reset();
    refetch();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_1fr]">
        <div className="glass rounded-[18px] p-6 sm:p-8">
          <h1 className="text-3xl font-semibold">Give your bike for rent</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your request goes to our admin. Once accepted, it shows up for renters.</p>
          {profile && (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <F name="owner_name" label="Your name" defaultValue={profile.full_name} required />
              <F name="model" label="Bike model" placeholder="e.g. Honda Activa 6G" required />
              <F name="price" label="Price per day (₹)" type="number" min={1} required />
              <F name="location" label="Location" defaultValue={profile.location} required />
              <Button type="submit" size="lg" className="w-full" disabled={saving}>
                {saving ? "Sending…" : "Send for approval"}
              </Button>
            </form>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold">My listings</h2>
          {mine.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No listings yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {mine.map((b) => (
                <div key={b.id} className="glass flex items-center justify-between rounded-2xl p-4">
                  <div>
                    <div className="font-display font-semibold">{b.model}</div>
                    <div className="text-xs text-muted-foreground">{b.location} · {inr(b.price_per_day)}/day</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function F({ name, label, ...p }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="h-11 rounded-xl bg-frost/80" {...p} />
    </div>
  );
}
