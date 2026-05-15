import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  ClipboardList,
  Clock3,
  ConciergeBell,
  Eye,
  House,
  Layers3,
  KeyRound,
  MapPinned,
  MessageSquareMore,
  Navigation,
  ShieldCheck,
  Smartphone,
  Stars,
  Sparkles,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const valueCards = [
  {
    title: "Arrival instructions",
    description: "Turn parking, gate, lockbox, and entry directions into a structured guest flow instead of a wall of text.",
    icon: KeyRound,
    accent: "from-emerald-100 to-white",
    detail: "Entry flows",
  },
  {
    title: "Location clarity",
    description: "Pin the property, parking, and step-by-step map points so guests stop calling when they arrive.",
    icon: MapPinned,
    accent: "from-sky-100 to-white",
    detail: "Map guidance",
  },
  {
    title: "Stay essentials",
    description: "Surface WiFi, check-in, check-out, rules, and amenity notes in a format guests can scan fast on mobile.",
    icon: Wifi,
    accent: "from-amber-100 to-white",
    detail: "Core details",
  },
  {
    title: "Phone-first guide",
    description: "The guest page is designed for a person standing outside the property with luggage and low patience.",
    icon: Smartphone,
    accent: "from-rose-100 to-white",
    detail: "Mobile use",
  },
];

const steps = [
  {
    title: "Create the property guide",
    description: "Set the property name, guest link, welcome text, and the key details every guest asks for.",
    icon: ClipboardList,
  },
  {
    title: "Add arrival and stay info",
    description: "Capture WiFi, timings, house rules, amenities, and extra notes in one place.",
    icon: Clock3,
  },
  {
    title: "Publish one clean link",
    description: "Share a dedicated guest page instead of retyping the same instructions every booking.",
    icon: Layers3,
  },
];

const bullets = [
  { label: "Step-by-step lockbox and parking guidance", icon: CarFront },
  { label: "Map search and property pinning with Leaflet", icon: Navigation },
  { label: "Multi-property dashboard for hosts", icon: House },
  { label: "Mobile-friendly guest guide tabs", icon: Smartphone },
  { label: "Preview before publishing", icon: Eye },
  { label: "One app for frontend and backend", icon: ConciergeBell },
];

const quickFacts = [
  {
    title: "Less arrival confusion",
    description: "Guests can follow one clear guide instead of juggling multiple messages and screenshots.",
    icon: MapPinned,
  },
  {
    title: "Fewer repetitive questions",
    description: "Hosts stop resending the same parking, check-in, and WiFi instructions every booking.",
    icon: MessageSquareMore,
  },
  {
    title: "Stronger guest confidence",
    description: "A polished welcome page feels more trustworthy than a rushed pre-arrival text.",
    icon: BadgeCheck,
  },
  {
    title: "Better for mobile arrivals",
    description: "Everything important stays readable on a phone while guests are outside the property.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="space-y-8 pb-8 sm:space-y-10">
      <section>
        <Card className="relative overflow-hidden border-white/60 bg-[linear-gradient(135deg,#12332d_0%,#0f766e_45%,#f4efe2_160%)] p-6 text-white sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
              <Stars className="h-4 w-4 text-amber-300" />
              Short-stay guest experience
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Replace messy arrival messages with one clean guest guide.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                HostMate gives hosts one place to package check-in steps, maps, WiFi, parking, house rules, and guest notes into a shareable page that actually looks professional.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/sign-up">
                <Button className="w-full bg-slate-950 text-white hover:bg-black sm:w-auto">
                  Create your first property
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/property/harbour-view-suite">
                <Button variant="secondary" className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
                  View demo guide
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Built for</div>
                <div className="mt-2 text-lg font-semibold">Airbnb-style hosts</div>
              </div>
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Delivery</div>
                <div className="mt-2 text-lg font-semibold">One public guest link</div>
              </div>
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Experience</div>
                <div className="mt-2 text-lg font-semibold">Mobile first</div>
              </div>
            </div>
            <div className="grid gap-3 border-t border-white/15 pt-6 sm:grid-cols-3">
              <div className="rounded-[1.4rem] bg-white/10 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Guests get</div>
                <div className="mt-2 text-base font-semibold">A clean arrival flow</div>
                <div className="mt-2 text-sm leading-6 text-white/75">Parking, entry, WiFi, and stay information in one place.</div>
              </div>
              <div className="rounded-[1.4rem] bg-white/10 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Hosts get</div>
                <div className="mt-2 text-base font-semibold">Fewer repeat questions</div>
                <div className="mt-2 text-sm leading-6 text-white/75">Stop resending the same instructions for every booking.</div>
              </div>
              <div className="rounded-[1.4rem] bg-white/10 px-4 py-4 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Result</div>
                <div className="mt-2 text-base font-semibold">A better first impression</div>
                <div className="mt-2 text-sm leading-6 text-white/75">The stay starts with something that feels deliberate and premium.</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {valueCards.map((item) => (
          <Card key={item.title} className="overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.98))] p-0">
            <div className={`bg-gradient-to-br ${item.accent} px-5 py-5`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{item.detail}</div>
                  <div className="mt-3 inline-flex rounded-[1rem] bg-white/90 p-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                    <item.icon className="h-6 w-6 text-slate-900" />
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <div className="px-5 pb-5 pt-4">
              <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">How it works</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Built for hosts who want fewer repetitive guest questions.</h2>
          </div>
          <div className="grid gap-3">
            {steps.map((item, index) => (
              <div key={item.title} className="flex gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white/85 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">0{index + 1}</div>
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <item.icon className="h-4 w-4 text-[var(--accent)]" />
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="grid h-full lg:grid-cols-[1.02fr_0.98fr]">
            <div className="bg-slate-950 p-6 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Host outcome</div>
              <h2 className="mt-3 text-3xl font-semibold leading-tight">Your instructions stop living in scattered notes, messages, and screenshots.</h2>
              <p className="mt-4 text-sm leading-7 text-white/72">
                Instead of retyping arrival steps for every booking, you update one property guide and share one destination that guests can actually use.
              </p>
            </div>
            <div className="bg-[linear-gradient(180deg,#f8fafc,#fff7ec)] p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Included now</div>
              <div className="mt-4 grid gap-3">
                {bullets.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-900">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(229,245,241,0.96))]">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Guest experience</div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Make the first 10 minutes of arrival feel calm instead of chaotic.</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Guests do not want a PDF, a long message thread, and three screenshots from WhatsApp. They want one link that tells them where to park, how to get in, what the WiFi is, and what matters during their stay.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button className="w-full sm:w-auto">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/property/harbour-view-suite">
              <Button variant="secondary" className="w-full sm:w-auto">
                Open demo page
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="space-y-4 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0.98))]">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Quick facts</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickFacts.map((item) => (
              <div key={item.title} className="rounded-[1.35rem] border border-[var(--line)] bg-white/90 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2.5 text-slate-900">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                </div>
                <div className="mt-3 text-sm text-slate-500">{item.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}