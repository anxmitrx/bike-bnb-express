import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { adminListBikes, adminSetStatus } from "@/lib/admin.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inr } from "@/lib/profile";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Velocité" },
      { name: "description", content: "Review and approve bike listing requests." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Bike = Awaited<ReturnType<typeof adminListBikes>>[number];

function Admin() {
  const list = useServerFn(adminListBikes);
  const setStatus = useServerFn(adminSetStatus);
  const [creds, setCreds] = useState<{ id: string; pass: string } | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(c: { id: string; pass: string }) {
    setLoading(true);
    try {
      const rows = await list({ data: c });
      setBikes(rows);
      setCreds(c);
    } catch {
      toast.error("Wrong admin ID or password");
    } finally {
      setLoading(false);
    }
  }

  async function act(bikeId: string, status: "approved" | "rejected") {
    if (!creds) return;
    try {
      await setStatus({ data: { ...creds, bikeId, status } });
      toast.success(status === "approved" ? "Bike is now live" : "Request rejected");
      load(creds);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!creds) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="flex justify-center px-6 py-20">
          <form
            className="glass w-full max-w-sm space-y-4 rounded-[18px] p-8"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              load({ id: String(f.get("id")), pass: String(f.get("pass")) });
            }}
          >
            <h1 className="text-2xl font-semibold">Admin access</h1>
            <div className="space-y-1.5">
              <Label htmlFor="id">Admin ID</Label>
              <Input id="id" name="id" required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pass">Password</Label>
              <Input id="pass" name="pass" type="password" required className="h-11 rounded-xl" />
            </div>
            <Button size="lg" className="w-full" disabled={loading}>{loading ? "Checking…" : "Enter panel"}</Button>
          </form>
        </div>
      </div>
    );
  }

  const pending = bikes.filter((b) => b.status === "pending");
  const others = bikes.filter((b) => b.status !== "pending");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="glass rounded-[18px] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-ink text-xs font-bold text-frost">A</span>
              <h1 className="text-lg font-semibold">Admin approvals</h1>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">{pending.length} pending</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCreds(null)}>Lock panel</Button>
          </div>
          <div className="mt-4 divide-y divide-border">
            {pending.length === 0 && <p className="py-6 text-sm text-muted-foreground">No pending requests.</p>}
            {pending.map((b) => (
              <Row key={b.id} b={b}>
                <Button variant="secondary" size="sm" onClick={() => act(b.id, "approved")}>Accept</Button>
                <Button variant="outline" size="sm" onClick={() => act(b.id, "rejected")}>Reject</Button>
              </Row>
            ))}
          </div>
        </div>

        <div className="glass mt-8 rounded-[18px] p-5 sm:p-6">
          <h2 className="text-lg font-semibold">All listings</h2>
          <div className="mt-4 divide-y divide-border">
            {others.length === 0 && <p className="py-6 text-sm text-muted-foreground">Nothing reviewed yet.</p>}
            {others.map((b) => (
              <Row key={b.id} b={b}>
                <span className="text-xs font-semibold capitalize text-muted-foreground">{b.status}</span>
                <Button variant="outline" size="sm" onClick={() => act(b.id, b.status === "approved" ? "rejected" : "approved")}>
                  {b.status === "approved" ? "Take down" : "Approve"}
                </Button>
              </Row>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ b, children }: { b: Bike; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3">
      <div className="min-w-[10ch] flex-1">
        <div className="font-display text-sm font-semibold">{b.model}</div>
        <div className="text-xs text-muted-foreground">{b.owner_name} · {b.location} · {inr(b.price_per_day)}/day</div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
