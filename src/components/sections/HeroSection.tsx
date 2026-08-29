import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicStats, fmtStat, fmtMoney } from "@/hooks/usePublicStats";

export function HeroSection() {
  const { data: stats } = usePublicStats();

  return (
    <section
      id="hero"
      className="relative flex flex-col justify-between overflow-hidden bg-background"
      style={{ minHeight: "100svh" }}
    >
      {/* ── Video Background ─────────────────────────────────────────────── */}
      <video
        src="/vid1.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          zIndex: 0,
          opacity: 0.48,
          objectPosition: "center center",
          /* ensure video fills on iOS Safari */
          minWidth: "100%",
          minHeight: "100%",
        }}
      />

      {/* ── Light-mode gradient overlay ──────────────────────────────────── */}
      <div
        className="absolute inset-0 dark:hidden pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.45) 55%, rgba(255,255,255,0.98) 100%)",
        }}
      />
      {/* ── Dark-mode gradient overlay ───────────────────────────────────── */}
      <div
        className="absolute inset-0 hidden dark:block pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.50) 55%, rgba(0,0,0,0.98) 100%)",
        }}
      />

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 pt-28 sm:pt-36 pb-10"
        style={{ zIndex: 2 }}
      >
        {/* Badge */}
        <div className="mb-5 animate-slide-down">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold tracking-wide uppercase">
            Nkineji Community Initiative
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight max-w-4xl">
          Empowering the Heart{" "}
          <br className="hidden sm:block" />
          <span className="text-primary">of the Maasai Woman</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-foreground/80 font-medium max-w-xl mx-auto mb-9 leading-relaxed">
          GirlChild Education &amp; Maternal Healthcare for marginalized women
          and girls in Kenya.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="donate"
            size="lg"
            className="px-7 rounded-full"
            onClick={() => (window.location.href = "/campaigns")}
          >
            <Heart className="w-4 h-4 mr-1" />
            Support a Woman Today
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-7 rounded-full border-foreground/25 text-foreground hover:bg-foreground/5"
            onClick={() => (window.location.href = "/impact")}
          >
            Explore Our Impact
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div
        className="relative px-4 sm:px-6 md:px-12 py-6 border-t border-border/40"
        style={{ zIndex: 2 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-5xl mx-auto">
          {[
            { value: fmtStat(stats?.beneficiaries), label: "Women Empowered" },
            { value: fmtMoney(stats?.totalRaised), label: "Funds Raised" },
            { value: fmtStat(stats?.donations), label: "Donations Made" },
            { value: fmtStat(stats?.impactStories), label: "Stories Shared" },
          ].map((stat) => (
            <div key={stat.label} className="py-2">
              <div className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground/70 tracking-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Founder Badge — Mobile: compact pill ─────────────────────────── */}
      <div
        className="md:hidden absolute bottom-[5.5rem] left-3"
        style={{ zIndex: 10 }}
      >
        <div className="flex items-center gap-2.5 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/60 shadow-lg">
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            <img
              src="/Founder-Nkineji.png"
              alt="Veronicah .S. Nchorira - Founder"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left pr-1">
            <p className="font-display font-bold text-[11px] text-foreground leading-tight">
              Veronicah .S. Nchorira
            </p>
            <p className="text-[10px] font-bold text-primary tracking-wide uppercase">
              Founder
            </p>
          </div>
        </div>
      </div>

      {/* ── Founder Badge — Desktop: prominent circle ─────────────────────── */}
      <div
        className="hidden md:flex absolute bottom-8 left-8 flex-col items-center text-center group"
        style={{ zIndex: 10 }}
      >
        <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden shadow-2xl border-2 border-primary/20 bg-background transition-transform duration-300 group-hover:scale-105">
          <img
            src="/Founder-Nkineji.png"
            alt="Veronicah .S. Nchorira - Founder"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-2.5 bg-background/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-border/50 shadow-md">
          <p className="font-display font-bold text-sm lg:text-base text-foreground leading-tight whitespace-nowrap">
            Veronicah .S. Nchorira
          </p>
          <p className="text-xs font-bold text-primary tracking-wide uppercase mt-0.5">
            Founder
          </p>
        </div>
      </div>
    </section>
  );
}
