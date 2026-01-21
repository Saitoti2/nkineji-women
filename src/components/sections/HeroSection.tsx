import { ArrowRight, Heart, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDonationStore } from "@/stores/donationStore";
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
        {/* Dark mode friendly gradient overlay - significantly darker */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-foreground/80 dark:from-black/90 dark:via-black/70 dark:to-black/80" />
        {/* Animated gradient overlay - reduced opacity and removed color burn for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 dark:from-primary/10 dark:to-secondary/10 dark:opacity-20 animate-gradient-shift" />
      </div>

      {/* Floating particles/glow effects - REMOVED for dark mode comfort */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 dark:opacity-0">
        {/* Particles hidden to reduce visual noise */}
      </div>

      {/* Floating Hero Card - Responsive container that adapts to screen size */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 pt-32 sm:pt-36 pb-20 sm:pb-24">
        {/* Added backdrop-blur-3xl for glass effect and removed h-full constraint for better centering */}
        <div className="w-full max-w-5xl bg-card/80 backdrop-blur-2xl rounded-[2.5rem] shadow-float-lg border border-white/20 dark:border-white/5 dark:bg-card/90 p-6 sm:p-10 md:p-16 animate-hero-entrance relative overflow-hidden">
          {/* Animated border glow - REMOVED for dark mode */}
          <div className="hidden" />

          {/* Content Container - Flex layout adapts to screen size */}
          <div className="flex flex-col justify-center">
            {/* Badge with enhanced animation */}
            <div className="flex justify-center mb-4 sm:mb-5 md:mb-6 lg:mb-8 animate-slide-down">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs md:text-sm font-medium animate-badge-glow relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-shimmer" />
                <span className="relative z-10">
                  Nkineji Community Initiative CBO
                </span>
              </div>
            </div>

            {/* Headline with text reveal animation - Responsive sizing */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground text-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight animate-text-reveal px-2">
              Empowering the Heart <br className="hidden sm:block" />
              <span className="text-accent">of the Maasai Mara</span>
            </h1>

            {/* Subheadline with fade and slide - Responsive sizing */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-center mb-6 sm:mb-7 md:mb-8 lg:mb-10 animate-fade-slide-up px-2 leading-relaxed">
              Nkineji Community Initiative is dedicated to GirlChild Education and Maternal Healthcare for the marginalized women and girls of the Mara.
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
