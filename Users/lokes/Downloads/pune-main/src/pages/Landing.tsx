import { useNavigate } from "react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Leaf,
  Building2,
  ShieldCheck,
  Map,
  Wallet,
  Zap,
  ChevronDown,
  Star,
  Gauge,
  BarChart3,
  Smartphone,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7 },
};

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true },
};

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ==================== NAV ==================== */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">Pune RidePulse</span>
          </div>
          <div className="flex items-center gap-3">
              <>
                <Button
                  size="sm"
                  className="rounded-lg text-xs h-8"
                  onClick={() => navigate("/board")}
                >
                  Get Started <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </>
          </div>
        </div>
      </motion.nav>

      {/* ==================== HERO ==================== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-14 overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] via-transparent to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(#18181b 1px, transparent 1px), linear-gradient(90deg, #18181b 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-6">
                  <Zap className="w-3 h-3" />
                  Pune's First Hyperlocal Ride Aggregator
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
              >
                Every Ride in{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  Pune
                </span>
                , Compared.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-4 text-base text-muted-foreground max-w-lg leading-relaxed"
              >
                Compare real-time fares from Uber, Ola, and verified 100% electric local fleets.
                One tap to book the best ride across Pune, Pimpri-Chinchwad, and PMRDA.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-3 mt-8"
              >
                <Button
                  size="lg"
                  className="rounded-xl text-sm h-11 px-6 shadow-sm"
                  onClick={() => navigate("/board")}
                >
                  Start Comparing
                  <BarChart3 className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap items-center gap-6 mt-10 text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Live API Verified
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  100% EV Options
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  RTO Tariff Verified
                </div>
              </motion.div>
            </div>

            {/* Right: Mock UI */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative mx-auto max-w-sm">
                {/* Phone frame */}
                <div className="relative aspect-[9/19] rounded-[2.5rem] border-[3px] border-foreground/10 bg-background shadow-2xl overflow-hidden">
                  {/* Status bar */}
                  <div className="h-7 bg-background flex items-center justify-between px-6 text-[10px] text-muted-foreground font-medium">
                    <span>9:41</span>
                    <span>🔋</span>
                  </div>
                  {/* App content */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold">RidePulse</span>
                    </div>
                    {/* Pickup */}
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-muted-foreground">Shivajinagar</span>
                    </div>
                    {/* Swap */}
                    <div className="flex justify-center -my-1">
                      <div className="w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center">
                        <ArrowRight className="w-2 h-2 text-muted-foreground" />
                      </div>
                    </div>
                    {/* Dropoff */}
                    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-[10px] text-muted-foreground">Hinjawadi Phase 2</span>
                    </div>
                    {/* Results */}
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 rounded-lg px-2.5 py-2">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-blue-500" />
                          <span className="text-[9px] font-medium">Uber Go</span>
                        </div>
                        <span className="text-[11px] font-bold">₹285</span>
                      </div>
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-2.5 py-2 border border-emerald-200/50">
                        <div className="flex items-center gap-1.5">
                          <Leaf className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-medium">GrEL Tigor EV</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-emerald-600">₹249</span>
                          <span className="text-[8px] text-emerald-500 block">Zero surge</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 rounded-lg px-2.5 py-2">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3 h-3 text-amber-500" />
                          <span className="text-[9px] font-medium">Ola Auto</span>
                        </div>
                        <span className="text-[11px] font-bold">₹198</span>
                      </div>
                    </div>
                    {/* CTA */}
                    <div className="mt-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold text-center py-2">
                      Compare 12 options
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-2 -right-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Save 40% with EV
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground animate-bounce" />
        </motion.div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border/50 text-xs font-medium text-muted-foreground mb-4">
              <Star className="w-3 h-3" />
              Why RidePulse
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Compare. Choose.{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                Ride Smarter.
              </span>
            </h2>
          </motion.div>

          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== DUAL FILTER EXPLAINED ==================== */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Dual-Filter Transport
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every ride, intelligently segmented by provider tier.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Category A */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-border/50 bg-white dark:bg-neutral-900 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Category A</h3>
                  <p className="text-xs text-muted-foreground">The Tech Giants</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Uber — Go, XL, Auto, Sedan</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Ola — Mini, Sedan, SUV, Auto</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Two-wheelers <span className="text-muted-foreground">(excluded)</span></span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Live API-verified pricing</span>
                </li>
              </ul>
            </motion.div>

            {/* Category B */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl border border-emerald-200/70 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Category B</h3>
                  <p className="text-xs text-muted-foreground">100% EV Local Fleets</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>GrEL Cabs — Tata Tigor EV, MG Windsor EV</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Cab-E — Mahindra Treo e-Auto, Tiago EV</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>GreenEV Cabs — BYD e6</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Leaf className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Zero-surge · RTO tariff verified</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== COVERAGE ==================== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Total Pune Coverage
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every zone. Every corridor. Every kilometer.
            </p>
          </motion.div>

          <motion.div {...stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {coverageAreas.map((area) => (
              <motion.div
                key={area.name}
                variants={{
                  initial: { opacity: 0, y: 12 },
                  whileInView: { opacity: 1, y: 0 },
                }}
                className="rounded-xl border border-border/50 bg-white dark:bg-neutral-900 p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  {area.icon}
                  <h3 className="text-sm font-semibold">{area.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{area.locations}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-background" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Ride Smarter?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Compare, choose, and book — all in one place.
            </p>
            <Button
              size="lg"
              className="mt-8 rounded-xl text-sm h-12 px-8 shadow-lg"
              onClick={() => navigate("/board")}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-emerald-500" />
            Pune RidePulse
          </div>
          <p>© 2026 Pune RidePulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ==================== DATA ====================

const features = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Side-by-Side Comparison",
    description: "View Uber, Ola, and local EV fares in a single, scrollable feed. Sort by price, ETA, or provider.",
  },
  {
    icon: <Map className="w-5 h-5" />,
    title: "Interactive Route Map",
    description: "Visualize your route with real-time price pins. See the lowest fare and fastest EV options on the map.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Trust Indicators",
    description: "Every ride displays verification badges — Live API, RTO Tariff, KYC, or 100% EV Zero-Surge Verified.",
  },
  {
    icon: <Leaf className="w-5 h-5" />,
    title: "EV-First Booking",
    description: "Discover Pune's local EV fleets with zero-surge pricing. Book via WhatsApp or direct call to verified drivers.",
  },
  {
    icon: <Gauge className="w-5 h-5" />,
    title: "Real-Time Data",
    description: "Fares update in real-time from Uber/Ola APIs and verified RTO tariff databases.",
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: "One-Tap Booking",
    description: "Tap to deep-link into Uber/Ola apps, or WhatsApp/call local EV operators instantly.",
  },
];

const coverageAreas = [
  { name: "Core Hubs", locations: "Shivajinagar · Kothrud · Camp · Deccan · FC Road · JM Road · Swargate · Aundh", icon: <Map className="w-4 h-4 text-blue-500" /> },
  { name: "PCMC", locations: "Pimpri · Chinchwad · Nigdi · Akurdi · Bhosari · Alandi · Moshi", icon: <Building2 className="w-4 h-4 text-purple-500" /> },
  { name: "Suburban East", locations: "Wagholi · Lohegaon · Viman Nagar · Kharadi · Hadapsar", icon: <Map className="w-4 h-4 text-amber-500" /> },
  { name: "Suburban West", locations: "Baner · Pashan · Hinjawadi Phases 1-3 · Wakad", icon: <Map className="w-4 h-4 text-rose-500" /> },
  { name: "Suburban South", locations: "Katraj · Dhayari · Undri · Ambegaon", icon: <Map className="w-4 h-4 text-cyan-500" /> },
  { name: "Commercial Belts", locations: "Hinjawadi IT · Kharadi EON · Magarpatta · Chakan MIDC", icon: <BarChart3 className="w-4 h-4 text-indigo-500" /> },
];

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
      }}
      className="rounded-xl border border-border/50 bg-white dark:bg-neutral-900 p-5 hover:shadow-sm hover:border-primary/20 transition-all duration-200"
    >
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-3 text-foreground">
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
