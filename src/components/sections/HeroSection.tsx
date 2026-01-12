import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section id="hero" className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Image with Parallax - Fills entire screen */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={heroBg}
          alt="Maasai Mara savanna landscape"
          className="w-full h-full object-cover animate-parallax-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 animate-gradient-shift" />
      </div>

      {/* Floating particles/glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-float-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float-glow-delayed" />
      </div>

      {/* Floating Hero Card - Responsive container that adapts to screen size */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 pt-32 sm:pt-36 pb-20 sm:pb-24">
        {/* Added backdrop-blur-3xl for glass effect and removed h-full constraint for better centering */}
        <div className="w-full max-w-5xl bg-card/80 backdrop-blur-2xl rounded-[2.5rem] shadow-float-lg border border-white/20 p-6 sm:p-10 md:p-16 animate-hero-entrance relative overflow-hidden">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-0 animate-border-glow pointer-events-none" />

          {/* Content Container - Flex layout adapts to screen size */}
          <div className="flex flex-col justify-center">
            {/* Badge with enhanced animation */}
            <div className="flex justify-center mb-4 sm:mb-5 md:mb-6 lg:mb-8 animate-slide-down">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs md:text-sm font-medium animate-badge-glow relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-shimmer" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent animate-pulse relative z-10" />
                <span className="relative z-10 whitespace-nowrap">Empowering Maasai Women Since 2015</span>
              </div>
            </div>

            {/* Headline with text reveal animation - Responsive sizing */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground text-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight animate-text-reveal px-2">
              Transform Lives, <br className="hidden sm:block" />
              <span className="text-gradient animate-gradient-text">Empower Women</span>
            </h1>

            {/* Subheadline with fade and slide - Responsive sizing */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-6 sm:mb-7 md:mb-8 lg:mb-10 animate-fade-slide-up px-2 leading-relaxed">
              Your donation creates lasting change — from rescue and healthcare to education and
              economic empowerment. Join us in building a brighter future.
            </p>

            {/* CTA Buttons with enhanced hover effects - Responsive layout */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 animate-scale-in-delayed px-2">
              <Button
                variant="donate"
                size="lg"
                className="w-full sm:w-auto group relative overflow-hidden min-h-[44px] sm:min-h-[48px] md:min-h-[56px] text-sm sm:text-base"
                onClick={() => window.location.href = '/campaigns'}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_100%] animate-shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity" />
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 animate-heartbeat" />
                <span className="relative z-10 whitespace-nowrap">Support a Woman Today</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto group relative min-h-[44px] sm:min-h-[48px] md:min-h-[56px] text-sm sm:text-base"
                onClick={() => window.location.href = '/impact'}
              >
                <span className="relative z-10 whitespace-nowrap">Explore Our Impact</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-2 group-hover:scale-110 relative z-10" />
              </Button>
            </div>

            {/* Quick Stats with staggered animations - Responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {[
                { value: "2,500+", label: "Women Empowered" },
                { value: "$1.2M", label: "Funds Raised" },
                { value: "150+", label: "Businesses Started" },
                { value: "98%", label: "Funds to Programs" },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 bg-muted/50 border border-border/50 text-center hover:bg-muted/70 hover:border-border transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-float-lg animate-stat-card relative overflow-hidden group"
                  style={{ animationDelay: `${0.5 + index * 0.15}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary relative z-10 animate-count-up">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-1 relative z-10 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


    </section>
  );
}
