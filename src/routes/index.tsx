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
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground shadow-sm transition-all hover:scale-105 hover:bg-white/40">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-brand"></span>
              </span>
              Bikes from your neighbours
            </span>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-[4rem] lg:text-[4.5rem] bg-gradient-to-br from-ink via-ink/90 to-brand/80 bg-clip-text text-transparent drop-shadow-sm">
              The bike you need, <br className="hidden sm:block" />parked on your street.
            </h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
              Rent a vetted ride by the day, or list your own bike and let your neighborhood do the renting. Every listing is checked before it ever hits the board.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link to="/bikes" className="group relative flex flex-col justify-center rounded-2xl bg-brand px-6 py-4 text-frost shadow-lg shadow-brand/25 ring-1 ring-brand/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-brand/40">
                <span className="block font-display text-xl font-bold tracking-tight group-hover:text-white">Rent a bike</span>
                <span className="mt-1 block text-sm text-frost/90 transition-colors group-hover:text-frost">Browse rides near you &rarr;</span>
              </Link>
              <Link to="/list-bike" className="glass group relative flex flex-col justify-center rounded-2xl px-6 py-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-md">
                <span className="block font-display text-xl font-bold tracking-tight text-ink">List my bike</span>
                <span className="mt-1 block text-sm text-muted-foreground group-hover:text-ink/80">Earn from your spare ride</span>
              </Link>
            </div>
          </div>
          <div className="relative mt-8 lg:mt-0 transition-transform duration-700 hover:scale-[1.02]">
            <img src={hero} alt="Bikes parked along a sunlit wall" width={1024} height={1280} className="aspect-[4/5] w-full rounded-[24px] object-cover shadow-2xl" />
            <div className="glass absolute -bottom-6 -left-6 rounded-2xl px-5 py-4 shadow-xl backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-ink">Verified listings only</div>
                  <div className="text-xs font-medium text-muted-foreground">Checked & approved by our team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">Three simple steps to start riding or earning.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="glass group relative overflow-hidden rounded-3xl p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/5">
              <div className="absolute -right-4 -top-4 size-24 rounded-full bg-brand/5 transition-transform group-hover:scale-[2.5] group-hover:bg-brand/10"></div>
              <span className="relative inline-flex size-12 items-center justify-center rounded-2xl bg-frost font-display text-lg font-bold text-brand shadow-sm">{s.n}</span>
              <h3 className="relative mt-6 text-xl font-bold text-ink">{s.t}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
