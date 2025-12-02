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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 rounded-2xl ${
        scrolled 
          ? "bg-card/95 backdrop-blur-xl shadow-float border border-border/50" 
          : "bg-card/80 backdrop-blur-lg border border-border/30"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <span className="text-primary-foreground font-display font-bold text-lg sm:text-xl">MM</span>
            </div>
            <div className="hidden xs:block">
              <h1 className="font-display font-semibold text-base sm:text-lg text-foreground leading-tight">Maasai Mara</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Women Empowerment</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="donate" size="sm" className="hidden sm:flex text-xs sm:text-sm px-3 sm:px-4">
              <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Donate Now</span>
              <span className="md:hidden">Donate</span>
            </Button>
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[85vw] max-w-[320px] bg-card/95 backdrop-blur-xl border-l-0 rounded-l-3xl p-0 shadow-float-xl"
              >
                <div className="flex flex-col h-full p-6">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-display font-bold text-lg">MM</span>
                      </div>
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
