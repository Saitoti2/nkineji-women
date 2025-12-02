import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 pt-24 sm:p-6 sm:pt-28 md:p-8 md:pt-32">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Maasai Mara savanna landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
      </div>

      {/* Floating Hero Card */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="bg-card/90 backdrop-blur-xl rounded-3xl shadow-float-xl border border-border/30 p-6 sm:p-8 md:p-12 lg:p-16 animate-scale-in">
          {/* Badge */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Empowering Maasai Women Since 2015
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-center mb-4 sm:mb-6 leading-tight animate-fade-up stagger-1">
            Transform Lives, <br className="hidden sm:block" />
            <span className="text-gradient">Empower Women</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-8 sm:mb-10 animate-fade-up stagger-2">
            Your donation creates lasting change — from rescue and healthcare to education and 
            economic empowerment. Join us in building a brighter future.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-up stagger-3">
            <Button variant="donate" size="lg" className="w-full sm:w-auto">
              <Heart className="w-5 h-5" />
              Support a Woman Today
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto group">
              Explore Our Impact
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-up stagger-4">
            {[
              { value: "2,500+", label: "Women Empowered" },
              { value: "$1.2M", label: "Funds Raised" },
              { value: "150+", label: "Businesses Started" },
              { value: "98%", label: "Funds to Programs" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 sm:p-5 bg-muted/50 border border-border/50 text-center hover:bg-muted/70 hover:border-border transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-card/50 flex items-start justify-center p-2 bg-card/20 backdrop-blur-sm">
          <div className="w-1.5 h-3 rounded-full bg-card/70" />
        </div>
      </div>
    </section>
  );
}
