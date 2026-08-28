import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicStats, fmtStat, fmtMoney } from "@/hooks/usePublicStats";

export function HeroSection() {
  const { data: stats } = usePublicStats();

  return (
    <section
      id="hero"
      style={{ position: "relative", minHeight: "92vh", overflow: "hidden" }}
      className="flex flex-col justify-between pt-32 pb-16 px-4 sm:px-6 md:px-12"
    >
      {/* ── Video Layer ─────────────────────────────────────────── */}
      <video
        src="/vid1.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.45,
        }}
      />

      {/* ── Gradient Overlay: fades to white at bottom ──────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(250,250,250,0.15) 0%, rgba(250,250,250,0.5) 60%, rgba(250,250,250,1) 100%)",
        }}
        className="dark:hidden"
      />
      {/* Dark mode overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,1) 100%)",
        }}
        className="hidden dark:block"
      />

      {/* ── Content ─────────────────────────────────────────────── */}
      <div
        style={{ position: "relative", zIndex: 2 }}
        className="flex-1 flex flex-col items-center justify-center my-auto max-w-4xl mx-auto w-full text-center"
      >
        {/* Badge */}
        <div className="mb-6 animate-slide-down">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold tracking-wide uppercase">
            Nkineji Community Initiative
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
          Empowering the Heart <br />
          <span className="text-primary">of the Maasai Woman</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-foreground/80 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
          GirlChild Education &amp; Maternal Healthcare for marginalized women and girls in Kenya.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Button
            variant="donate"
            size="lg"
            className="px-7 rounded-full"
            onClick={() => (window.location.href = "/campaigns")}
          >
            <Heart className="w-4 h-4" />
            Support a Woman Today
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-7 rounded-full border-foreground/25 text-foreground hover:bg-foreground/5"
            onClick={() => (window.location.href = "/impact")}
          >
            Explore Our Impact
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 2 }} className="max-w-5xl mx-auto w-full pt-8 border-t border-border/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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

      {/* ── Founder Badge (Bottom Left) ─────────────────────────────────── */}
      <div
        style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem", zIndex: 10 }}
        className="flex items-center gap-3 bg-background/85 backdrop-blur-md px-3.5 py-2 rounded-full border border-border/60 shadow-lg transition-transform hover:scale-105"
      >
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
          <img
            src="/Founder-Nkineji.png"
            alt="Veronicah .S. Nchorira - Founder"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="text-left pr-1.5">
          <p className="font-display font-bold text-xs sm:text-sm text-foreground leading-tight">
            Veronicah .S. Nchorira
          </p>
          <p className="text-[10px] sm:text-xs font-semibold text-primary">
            Founder
          </p>
        </div>
      </div>
    </section>
  );
}
