import { useState, useEffect } from "react";
import { Menu, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const navLinks = [
  { label: "Our Mission", href: "#mission" },
  { label: "Programs", href: "#programs" },
  { label: "Campaigns", href: "#campaigns" },
  { label: "Impact", href: "#impact" },
  { label: "Stories", href: "#stories" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Always show navbar at the top
      if (scrollY < 50) {
        setIsVisible(true);
        setScrolled(false);
        setLastScrollY(scrollY);
        return;
      }
      
      // Determine scroll direction
      const scrollingDown = scrollY > lastScrollY;
      const scrollingUp = scrollY < lastScrollY;
      
      // Hide when scrolling down, show when scrolling up
      if (scrollingDown && scrollY > 100) {
        setIsVisible(false);
      } else if (scrollingUp) {
        setIsVisible(true);
      }
      
      // Update scrolled state for styling
      setScrolled(scrollY > 20);
      setLastScrollY(scrollY);
    };
    
    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", throttledScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`fixed top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-50 transition-all duration-300 ease-out rounded-xl sm:rounded-2xl ${
        scrolled 
          ? "bg-card/95 backdrop-blur-xl shadow-float-lg border border-border/50 py-1" 
          : "bg-card/80 backdrop-blur-lg border border-border/30 py-0"
      } ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-12 sm:h-14 md:h-16' : 'h-14 sm:h-16 md:h-18'
        }`}>
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <img 
              src="/logo.png" 
              alt="Inua Mama Initiative" 
              className={`w-auto rounded-lg sm:rounded-xl object-contain transition-all duration-300 group-hover:scale-105 flex-shrink-0 ${
                scrolled ? 'h-8 sm:h-9 md:h-10' : 'h-9 sm:h-10 md:h-11'
              }`}
              style={{ 
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) contrast(1.15) brightness(0.95) saturate(1.1)',
                mixBlendMode: 'multiply',
                backgroundColor: 'transparent'
              }}
            />
            <div className={`hidden min-[375px]:block min-w-0 transition-all duration-300 ${
              scrolled ? 'opacity-90' : 'opacity-100'
            }`}>
              <h1 className={`font-display font-semibold text-foreground leading-tight truncate transition-all duration-300 ${
                scrolled ? 'text-xs sm:text-sm md:text-base' : 'text-sm sm:text-base md:text-lg'
              }`}>Inua Mama</h1>
              <p className={`text-muted-foreground truncate transition-all duration-300 ${
                scrolled ? 'text-[8px] sm:text-[9px] md:text-[10px]' : 'text-[9px] sm:text-[10px] md:text-xs'
              }`}>Initiative</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center gap-1 transition-all duration-300 ${
            scrolled ? 'opacity-90' : 'opacity-100'
          }`}>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`px-4 py-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300 ${
                  scrolled ? 'text-xs py-1.5' : 'text-sm py-2'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="donate" size="sm" className="hidden sm:flex text-xs sm:text-sm px-3 sm:px-4 min-h-[44px]">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Donate Now</span>
              <span className="md:hidden">Donate</span>
            </Button>
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50 hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[85vw] max-w-[320px] bg-card/95 backdrop-blur-xl border-l-0 rounded-l-3xl p-0 shadow-float-xl [&>button]:hidden"
              >
                <div className="flex flex-col h-full p-6">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <img 
                        src="/logo.png" 
                        alt="Inua Mama Initiative" 
                        className="h-10 w-auto rounded-xl object-contain"
                        style={{ 
                          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) contrast(1.15) brightness(0.95) saturate(1.1)',
                          mixBlendMode: 'multiply',
                          backgroundColor: 'transparent'
                        }}
                      />
                      <div>
                        <h2 className="font-display font-semibold text-foreground">Inua Mama</h2>
                        <p className="text-xs text-muted-foreground">Initiative</p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <button className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <X className="w-5 h-5 text-foreground" />
                      </button>
                    </SheetClose>
                  </div>

                  {/* Mobile Nav Links */}
                  <nav className="flex flex-col gap-2 flex-1">
                    {navLinks.map((link, index) => (
                      <SheetClose asChild key={link.label}>
                        <a
                          href={link.href}
                          className="px-4 py-3.5 rounded-xl text-base font-medium text-foreground hover:bg-muted/70 transition-all duration-300 animate-fade-up"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          {link.label}
                        </a>
                      </SheetClose>
                    ))}
                  </nav>

                  {/* Mobile CTA */}
                  <div className="pt-6 border-t border-border/50">
                    <SheetClose asChild>
                      <Button variant="donate" className="w-full" size="lg">
                        <Heart className="w-4 h-4" />
                        Donate Now
                      </Button>
                    </SheetClose>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      100% goes to empowering women
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
