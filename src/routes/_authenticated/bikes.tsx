import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProfile, bikeImage, inr } from "@/lib/profile";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/bikes")({
  head: () => ({ meta: [{ title: "Bikes near you — Velocité" }, { name: "description", content: "Browse and book approved bikes in your location." }] }),
  component: Bikes,
});

type Bike = { id: string; model: string; owner_name: string; price_per_day: number; location: string };

function Bikes() {
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: fetchMyProfile });
  const [showAll, setShowAll] = useState(false);
  const [booking, setBooking] = useState<Bike | null>(null);

  const { data: bikes = [], isLoading } = useQuery({
    queryKey: ["bikes", profile?.location, showAll],
    enabled: !!profile,
    queryFn: async () => {
      let q = supabase.from("bikes").select("id, model, owner_name, price_per_day, location").eq("status", "approved").order("created_at", { ascending: false });
      if (!showAll && profile?.location) q = q.ilike("location", `%${profile.location}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data as Bike[];
    },
  });

  const { data: myBookings = [], refetch } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("id, start_date, days, total_price, bikes(model, location)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-brand" />
              {showAll ? "All locations" : profile?.location || "Your location"}
            </span>
            <h1 className="mt-3 text-3xl font-semibold">Available near you</h1>
            <p className="mt-1 text-sm text-muted-foreground">Only approved bikes show here. Prices are per day.</p>
          </div>
          <Button variant="outline" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show my location only" : "Show all locations"}
          </Button>
        </div>

        {isLoading ? (
          <p className="mt-10 text-muted-foreground">Loading bikes…</p>
        ) : bikes.length === 0 ? (
          <div className="glass mt-8 rounded-2xl p-10 text-center">
            <h3 className="text-lg font-semibold">No bikes here yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try showing all locations, or check back soon.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bikes.map((b) => (
              <article key={b.id} className="glass overflow-hidden rounded-2xl">
                <img src={bikeImage(b.id)} alt={b.model} loading="lazy" width={992} height={672} className="aspect-[16/10] w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">Verified</span>
                    <span className="text-xs font-medium text-muted-foreground">{b.location}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{b.model}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">Owner: {b.owner_name}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display text-xl font-semibold">
                      {inr(b.price_per_day)}<span className="text-sm font-medium text-muted-foreground">/day</span>
                    </span>
                    <Button variant="secondary" onClick={() => setBooking(b)}>Book</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {myBookings.length > 0 && (
          <div className="glass mt-12 rounded-[18px] p-6">
            <h2 className="text-lg font-semibold">My bookings</h2>
            <div className="mt-3 divide-y divide-border">
              {myBookings.map((bk) => (
                <div key={bk.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span className="font-semibold">{bk.bikes?.model} <span className="font-normal text-muted-foreground">· {bk.bikes?.location}</span></span>
                  <span className="text-muted-foreground">{bk.start_date} · {bk.days} day(s) · <span className="font-semibold text-foreground">{inr(bk.total_price)}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <BookDialog bike={booking} onClose={() => setBooking(null)} onBooked={() => refetch()} />
      <SiteFooter />
    </div>
  );
}

function BookDialog({ bike, onClose, onBooked }: { bike: Bike | null; onClose: () => void; onBooked: () => void }) {
  const [days, setDays] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function confirm() {
    if (!bike) return;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("bookings").insert({
      bike_id: bike.id,
      renter_id: u.user!.id,
      start_date: date,
      days,
      total_price: days * Number(bike.price_per_day),
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Booked ${bike.model}!`);
    onBooked();
    onClose();
  }

  return (
    <Dialog open={!!bike} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-[18px]">
        <DialogHeader>
          <DialogTitle className="font-display">Book {bike?.model}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Start date</Label>
            <Input id="date" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="days">Number of days</Label>
            <Input id="days" type="number" min={1} max={60} value={days} onChange={(e) => setDays(Math.max(1, Math.min(60, Number(e.target.value) || 1)))} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted p-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-semibold">{inr(days * Number(bike?.price_per_day ?? 0))}</span>
          </div>
          <Button size="lg" className="w-full" onClick={confirm} disabled={saving}>
            {saving ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
