import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Maasai Mara savanna landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/10 backdrop-blur-sm border border-card/20 text-card text-sm font-medium mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Empowering Maasai Women Since 2015
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-card mb-6 leading-tight animate-fade-up stagger-1">
            Transform Lives, <br />
            <span className="text-accent">Empower Women</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-card/90 max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
            Your donation creates lasting change — from rescue and healthcare to education and 
            economic empowerment. Join us in building a brighter future for Maasai women and girls.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up stagger-3">
            <Button variant="hero" size="xl">
              <Heart className="w-5 h-5" />
              Support a Woman Today
            </Button>
            <Button variant="hero-outline" size="xl">
              Explore Our Impact
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up stagger-4">
            {[
              { value: "2,500+", label: "Women Empowered" },
              { value: "$1.2M", label: "Funds Raised" },
              { value: "150+", label: "Businesses Started" },
              { value: "98%", label: "Funds to Programs" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 sm:p-6 bg-foreground/70 backdrop-blur-md border border-card/10"
              >
                <div className="font-display text-2xl sm:text-3xl font-bold text-card">{stat.value}</div>
                <div className="text-sm text-card/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-card/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-card/70" />
        </div>
      </div>
    </section>
  );
}
