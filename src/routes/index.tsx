import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Velocité — Rent or list a bike near you" },
      { name: "description", content: "Sign up, see verified bikes in your area and book by the day — or list your own bike for rent." },
      { property: "og:title", content: "Velocité — Rent or list a bike near you" },
      { property: "og:description", content: "Verified bike rentals in your neighborhood." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const steps = [
  { n: "01", t: "Sign up", d: "Tell us your name, location and phone number." },
  { n: "02", t: "Choose your side", d: "Rent a bike, or give yours for rent." },
  { n: "03", t: "Ride or earn", d: "Book bikes near you. Listings go live after admin approval." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-14 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-[30ch]">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-brand" />
              Bikes from your neighbours
            </span>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.95] sm:text-6xl">
              The bike you need, parked on your street.
            </h1>
            <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-muted-foreground">
              Rent a vetted ride by the day, or list your own bike and let your neighborhood do the renting. Every listing is checked before it ever hits the board.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link to="/bikes" className="rounded-[14px] bg-brand px-5 py-4 text-frost ring-1 ring-brand/40 transition-transform hover:-translate-y-0.5">
                <span className="block font-display text-lg font-semibold">Rent a bike</span>
                <span className="mt-0.5 block text-sm text-frost/85">Browse rides near you</span>
              </Link>
              <Link to="/list-bike" className="glass rounded-[14px] px-5 py-4 transition-transform hover:-translate-y-0.5">
                <span className="block font-display text-lg font-semibold">List my bike</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">Earn from your spare ride</span>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="Bikes parked along a sunlit wall" width={1024} height={1280} className="aspect-[4/5] w-full rounded-[18px] object-cover" />
            <div className="glass absolute -bottom-5 -left-5 rounded-[14px] px-4 py-3">
              <div className="text-sm font-semibold">Verified listings only</div>
              <div className="text-xs text-muted-foreground">Every bike approved by our team</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="glass rounded-2xl p-5">
              <span className="font-display text-sm font-bold text-brand">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
