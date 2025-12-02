import { useState, useEffect, useRef } from "react";
import { Menu, Heart, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Our Mission", href: "#mission", sectionId: "mission" },
  { label: "Programs", href: "#programs", sectionId: "programs" },
  { label: "Campaigns", href: "#campaigns", sectionId: "campaigns" },
  { label: "Impact", href: "#impact", sectionId: "impact" },
  { label: "Stories", href: "#stories", sectionId: "stories" },
];

const sectionTitles: Record<string, string> = {
  mission: "Our Mission",
  programs: "Our Programs",
  campaigns: "Active Campaigns",
  impact: "Our Impact",
  stories: "Success Stories",
  donate: "Make a Donation",
};

export function DynamicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Detect scroll and sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 100);
      setShowFloatingButton(scrollY > 300);
    };

    // Intersection Observer for section detection
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0.3,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId) {
            setCurrentSection(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsExpanded(false);
  };

  const currentTitle = currentSection ? sectionTitles[currentSection] || "" : "";

  return (
    <>
      {/* Dynamic Island Navbar */}
      <div
        ref={navbarRef}
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-700",
          isScrolled
            ? isExpanded
              ? "w-[95vw] max-w-6xl h-16 rounded-2xl"
              : "w-[140px] h-12 rounded-full"
            : "w-[95vw] max-w-6xl h-16 rounded-2xl"
        )}
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        style={{
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          background: isScrolled
            ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%), rgba(255,255,255,0.8)"
            : "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%), rgba(255,255,255,0.85)",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: isScrolled
            ? "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 60px rgba(16,65,45,0.1)"
            : "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 80px rgba(16,65,45,0.15)",
        }}
        onMouseEnter={() => isScrolled && setIsExpanded(true)}
        onMouseLeave={() => isScrolled && setIsExpanded(false)}
        onClick={() => isScrolled && !isExpanded && setIsExpanded(true)}
      >
        {/* Liquid glass morphism effect */}
        <div
          className="absolute inset-0 rounded-inherit opacity-50"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)",
            filter: "blur(1px)",
          }}
        />

        {/* Animated border glow */}
        <div
          className="absolute inset-0 rounded-inherit opacity-0 transition-opacity duration-700"
          style={{
            background: "linear-gradient(135deg, rgba(196,85,37,0.3), rgba(74,124,89,0.3), rgba(196,85,37,0.3))",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 3s ease infinite",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />

        <div
          className={cn(
            "relative h-full flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
            isScrolled && !isExpanded ? "justify-center px-4" : "px-4 sm:px-6 md:px-8"
          )}
        >
          {/* Logo - Always visible but scales */}
          <div
            className={cn(
              "flex items-center gap-2 sm:gap-3 transition-all duration-700 flex-shrink-0",
              isScrolled && !isExpanded ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}
          >
            <img
              src="/logo.png"
              alt="Maasai Mara Women Empowerment Initiative"
              className={cn(
                "rounded-lg object-contain transition-all duration-700",
                isScrolled ? "h-8 w-auto" : "h-10 w-auto"
              )}
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) contrast(1.15) brightness(0.95) saturate(1.1)",
                mixBlendMode: "multiply",
              }}
            />
            <div className="hidden sm:block">
              <h1 className="font-display font-semibold text-sm text-foreground leading-tight">Maasai Mara</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Women Empowerment</p>
            </div>
          </div>

          {/* Section Title - Shows in island mode with smooth animation */}
          {isScrolled && currentTitle && (
            <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 flex items-center gap-2 transition-all duration-500",
            isExpanded ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
              key={currentSection}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <span className="font-display font-semibold text-sm text-foreground whitespace-nowrap drop-shadow-sm">
                {currentTitle}
              </span>
            </div>
          )}

          {/* Desktop Navigation - Hidden in island mode */}
          <nav
            className={cn(
              "hidden lg:flex items-center gap-1 transition-all duration-700",
              isScrolled && !isExpanded ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
            )}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/30 rounded-lg transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-700",
              isScrolled && !isExpanded ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
            )}
          >
            <Button
              variant="donate"
              size="sm"
              className="hidden sm:flex text-xs px-3 min-h-[36px] backdrop-blur-sm bg-primary/90 hover:bg-primary"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Donate</span>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[85vw] max-w-[320px] bg-card/95 backdrop-blur-xl border-l-0 rounded-l-3xl p-0 shadow-float-xl [&>button]:hidden"
              >
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <img
                        src="/logo.png"
                        alt="Maasai Mara Women Empowerment Initiative"
                        className="h-10 w-auto rounded-xl object-contain"
                        style={{
                          filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) contrast(1.15) brightness(0.95) saturate(1.1)",
                          mixBlendMode: "multiply",
                        }}
                      />
                      <div>
                        <h2 className="font-display font-semibold text-foreground">Menu</h2>
                        <p className="text-xs text-muted-foreground">Navigation</p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <button className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <X className="w-5 h-5 text-foreground" />
                      </button>
                    </SheetClose>
                  </div>

                  <nav className="flex flex-col gap-2 flex-1">
                    {navLinks.map((link, index) => (
                      <SheetClose asChild key={link.label}>
                        <a
                          href={link.href}
                          className="px-4 py-3.5 rounded-xl text-base font-medium text-foreground hover:bg-muted/70 transition-all duration-300"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {link.label}
                        </a>
                      </SheetClose>
                    ))}
                  </nav>

                  <div className="pt-6 border-t border-border/50">
                    <SheetClose asChild>
                      <Button variant="donate" className="w-full" size="lg">
                        <Heart className="w-4 h-4" />
                        Donate Now
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Bottom Center with smooth entrance */}
      {showFloatingButton && (
        <button
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-14 h-14 rounded-full",
            "flex items-center justify-center",
            "backdrop-blur-xl bg-white/80 hover:bg-white/90",
            "border border-white/30 shadow-float-lg",
            "transition-all duration-500",
            "hover:scale-110 active:scale-95",
            "animate-float-button"
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          style={{
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 40px rgba(16,65,45,0.2)",
          }}
          aria-label="Scroll to top and show navbar"
        >
          <ChevronUp className="w-6 h-6 text-foreground transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      )}
    </>
  );
}

