import { useState, useEffect, useRef } from "react";
import { Menu, Heart, X, ChevronUp, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";

import { useTheme } from "next-themes";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useDonationStore } from "@/stores/donationStore";
import { usePWA } from "@/hooks/usePWA";
import { LogIn, Download, LogOut, LayoutDashboard, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const navLinks = [
  { label: "Home", href: "/", sectionId: "hero" },
  { label: "Our Mission", href: "#mission", sectionId: "mission" },
  { label: "Programs", href: "#programs", sectionId: "programs" },
  { label: "Campaigns", href: "/campaigns", sectionId: "campaigns" },
  { label: "Impact", href: "/impact", sectionId: "impact" },
];

const sectionTitles: Record<string, string> = {
  hero: "Home",
  mission: "Our Mission",
  programs: "Our Programs",
  campaigns: "Active Campaigns",
  impact: "Our Impact",
  stories: "Success Stories",
  donate: "Make a Donation",
};

// Section order for scroll detection
const sectionOrder = ["hero", "mission", "programs", "campaigns", "impact", "stories", "donate"];

export function DynamicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { openDonationModal } = useDonationStore();
  const { isInstallable, installApp, isInstalled } = usePWA();

  const { isAuthenticated, user, logout: storeLogout } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'chief_admin';

  useEffect(() => {
    // Sync state if needed, though useAuthStore handles most of it
  }, [location.pathname]);

  const handleLogout = () => {
    storeLogout();
    localStorage.removeItem('mara_bloom_auth_token');
    localStorage.removeItem('mara_bloom_refresh_token');
    localStorage.removeItem('user_data');
    navigate('/');
    setIsMobileMenuOpen(false);
  };


  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle navigation clicks
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // If it's a direct page route (starts with /)
    if (href.startsWith('/') && !href.startsWith('/#')) {
      if (href === '/' && location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(href);
      }
      return;
    }

    const hashMatch = href.match(/#(.+)/);
    const targetId = hashMatch ? hashMatch[1] : null;

    // If we're not on the homepage, navigate there first for hash links
    if (location.pathname !== '/') {
      navigate('/' + (href.startsWith('#') ? href : ''));
      if (targetId) {
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    } else {
      // Already on homepage, just scroll
      const targetElement = targetId ? document.getElementById(targetId) : null;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      } else if (href === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Enhanced scroll and section detection
  useEffect(() => {
    const detectCurrentSection = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewportCenter = scrollY + windowHeight / 2;

      setIsScrolled(scrollY > 100);
      setShowFloatingButton(scrollY > 300);

      // Get all sections with IDs
      const sections = Array.from(document.querySelectorAll("section[id]")) as HTMLElement[];

      // Also check for hero section (might not have id)
      const heroSection = document.querySelector("section:first-of-type");
      if (heroSection && !heroSection.id) {
        heroSection.id = "hero";
      }

      if (sections.length === 0) return;

      // Find the section closest to the viewport center
      let closestSection: HTMLElement | null = null;
      let closestDistance = Infinity;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = scrollY + rect.top;
        const sectionBottom = sectionTop + rect.height;
        const sectionCenter = sectionTop + rect.height / 2;

        // Calculate distance from viewport center to section center
        const distance = Math.abs(viewportCenter - sectionCenter);

        // Check if section is in viewport (at least partially visible)
        const isInViewport =
          (sectionTop <= scrollY + windowHeight && sectionBottom >= scrollY) ||
          (rect.top < windowHeight / 2 && rect.bottom > windowHeight / 2);

        if (isInViewport && distance < closestDistance) {
          closestDistance = distance;
          closestSection = section;
        }
      });

      // If no section is in viewport, find the closest one by scroll position
      if (!closestSection && sections.length > 0) {
        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const sectionTop = scrollY + rect.top;
          const distance = Math.abs(scrollY - sectionTop);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
          }
        });
      }

      // Set current section
      if (closestSection?.id) {
        setCurrentSection(closestSection.id);
      } else if (scrollY < 100) {
        // At the top, show hero
        setCurrentSection("hero");
      }
    };

    // Throttled scroll handler for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          detectCurrentSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial detection
    detectCurrentSection();

    // Intersection Observer as backup for more accurate detection
    const observerOptions = {
      root: null,
      rootMargin: "-10% 0px -10% 0px", // More sensitive margins
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // Multiple thresholds for better detection
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the section with the highest intersection ratio
      let maxRatio = 0;
      let activeSection: string | null = null;

      entries.forEach((entry) => {
        if (entry.intersectionRatio > maxRatio && entry.isIntersecting) {
          maxRatio = entry.intersectionRatio;
          const sectionId = entry.target.id;
          if (sectionId) {
            activeSection = sectionId;
          }
        }
      });

      if (activeSection) {
        setCurrentSection(activeSection);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections including hero
    const allSections = document.querySelectorAll("section");
    allSections.forEach((section) => {
      if (!section.id && section === document.querySelector("section:first-of-type")) {
        section.id = "hero";
      }
      observer.observe(section);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
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
          "fixed top-[calc(0.75rem+env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 transition-all duration-700 overflow-hidden rounded-full",
          isScrolled
            ? isExpanded
              ? "w-[92vw] max-w-4xl h-11"
              : "w-[132px] h-10"
            : "w-[92vw] max-w-4xl h-11"
        )}
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          background: theme === 'dark'
            ? 'rgba(0, 0, 0, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          border: theme === 'dark'
            ? '1px solid rgba(255,255,255,0.15)'
            : '1px solid rgba(0,0,0,0.1)',
          boxShadow: 'none',
          borderRadius: "9999px",
        }}
        onMouseEnter={() => isScrolled && setIsExpanded(true)}
        onMouseLeave={() => isScrolled && setIsExpanded(false)}
        onClick={() => isScrolled && !isExpanded && setIsExpanded(true)}
      >
        {/* Liquid glass morphism effect removed */}

        {/* Animated border glow - removed to eliminate sharp corners */}

        <div
          className={cn(
            "relative h-full flex items-center transition-all duration-700 overflow-hidden",
            isScrolled && !isExpanded ? "justify-center px-4" : "justify-between px-4 sm:px-6 md:px-8"
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Logo and Name - Always visible but scales */}
          <div
            className={cn(
              "flex items-center gap-2 sm:gap-3 transition-all duration-700 flex-shrink-1 min-w-0 mr-2",
              isScrolled && !isExpanded ? "opacity-0 w-0 overflow-hidden pointer-events-none" : "opacity-100 w-auto"
            )}
          >
            <img
              src="/logo.png"
              alt="Nkineji Initiative"
              className={cn(
                "rounded-lg object-contain transition-all duration-700 flex-shrink-0",
                isScrolled && isExpanded ? "h-8 w-auto" : isScrolled ? "h-0 w-0" : "h-10 w-auto"
              )}
              style={{
                display: isScrolled && !isExpanded ? "none" : "block",
              }}
            />
            <div className={cn("min-w-0 flex-1", isScrolled && !isExpanded && "hidden")}>
              <h1 className="font-display font-semibold text-sm text-foreground leading-tight truncate">Nkineji Initiative</h1>
              <p className="text-[10px] text-muted-foreground leading-tight truncate">Kenya</p>
            </div>
          </div>



          {/* Section Title - Shows in island mode with smooth animation */}
          {isScrolled && currentTitle && (
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2 flex items-center gap-2 transition-all duration-300",
                isExpanded ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
              )}
              style={{
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              key={currentSection}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
              <span className="font-display font-semibold text-sm text-foreground whitespace-nowrap drop-shadow-sm animate-fade-in">
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
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-700 flex-shrink-0 ml-auto",
              isScrolled && !isExpanded ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
            )}
          >
            {!isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:flex"
              >
                <a href="/login">Login</a>
              </Button>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 outline-none group">
                      <Avatar className="w-8 h-8 border border-primary/20 transition-all group-hover:border-primary/50">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline font-semibold text-sm mr-1">Profile</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <DropdownMenuLabel className="font-display font-bold px-3 py-2">Account Control</DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl px-3 py-2.5 cursor-pointer gap-3">
                      <User className="w-4 h-4 text-primary" /> Profile Settings
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-xl px-3 py-2.5 cursor-pointer gap-3">
                        <LayoutDashboard className="w-4 h-4 text-primary" /> Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    {isInstallable && !isInstalled && (
                      <DropdownMenuItem onClick={() => installApp()} className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 text-primary">
                        <Download className="w-4 h-4" /> Install App
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-3 py-2.5 cursor-pointer gap-3 text-destructive hover:text-destructive hover:bg-destructive/5 font-medium">
                      <LogOut className="w-4 h-4" /> Logout Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <Button
              variant="donate"
              size="sm"
              className="hidden sm:flex text-xs px-3 min-h-[36px] bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={openDonationModal}
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Donate</span>
            </Button>

            {/* Theme Toggle - Before hamburger menu */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={cn(
                  "p-2 rounded-lg backdrop-blur-sm transition-all min-w-[36px] min-h-[36px] flex items-center justify-center",
                  "bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20",
                  "text-foreground hover:scale-110 active:scale-95",
                  isScrolled && !isExpanded && "opacity-0 w-0 overflow-hidden"
                )}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-foreground" />
                ) : (
                  <Moon className="w-5 h-5 text-foreground" />
                )}
              </button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
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
                className="w-[85vw] max-w-[320px] p-0 border-none bg-transparent shadow-none [&>button]:hidden inset-y-0 right-0 h-full"
              >
                <SheetTitle className="sr-only">Main Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Quick access to all sections of the Nkineji Initiative website and donation options.
                </SheetDescription>
                <div

                  className={cn(
                    "flex flex-col h-full p-6 border-l rounded-l-[2rem] overflow-hidden",
                    theme === 'dark'
                      ? "bg-[#09090b] border-white/10"
                      : "bg-background border-border",
                    "pt-[env(safe-area-inset-top)]" // Added this class
                  )}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <img
                        src="/logo.png"
                        alt="Nkineji Community Initiative"
                        className="h-10 w-auto rounded-xl object-contain"
                      />
                      <div>
                        <h2 className="font-display font-semibold text-foreground">Menu</h2>
                        <p className="text-xs text-muted-foreground">Nkineji Initiative</p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <button className={cn(
                        "p-2 rounded-xl transition-colors",
                        theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-white" : "bg-muted/50 hover:bg-muted text-foreground"
                      )}>
                        <X className="w-5 h-5" />
                      </button>
                    </SheetClose>
                  </div>

                  <nav className="flex flex-col gap-2 flex-1">
                    {navLinks.map((link, index) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => {
                          handleNavClick(e, link.href);
                          setIsMobileMenuOpen(false);
                        }}
                        className="px-4 py-3.5 rounded-xl text-base font-medium text-foreground hover:bg-muted/70 transition-all duration-300 cursor-pointer"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>

                  <div className="pt-6 border-t border-border/50 flex flex-col gap-3">

                    {/* Theme Toggle in Sidebar */}
                    <div className="flex items-center justify-between px-1 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                        <button
                          onClick={() => setTheme("light")}
                          className={cn(
                            "p-1.5 rounded-md transition-all",
                            theme === "light" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Sun className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "p-1.5 rounded-md transition-all",
                            theme === "dark" ? "bg-black/90 shadow-sm text-white" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Moon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {!isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-10 rounded-xl"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate('/login');
                        }}
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-muted/50"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate('/profile');
                          }}
                        >
                          <User className="w-4 h-4" />
                          My Profile & History
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-muted/50"
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              navigate('/admin');
                            }}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Admin Dashboard
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </Button>
                      </>
                    )}

                    {isInstallable && !isInstalled && (
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-12 rounded-xl text-primary border-primary/20 hover:bg-primary/5"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          installApp();
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Install App
                      </Button>
                    )}

                    <Button
                      variant="donate"
                      className="w-full h-10 rounded-xl"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openDonationModal();
                      }}
                    >
                      <Heart className="w-4 h-4" />
                      Donate Now
                    </Button>
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
            "transition-all duration-500",
            theme === 'dark'
              ? "bg-background hover:bg-background border-none"
              : "bg-background border border-border",
            "hover:scale-110 active:scale-95",
            "animate-float-button"
          )}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: 'none',
          }}
          aria-label="Scroll to top and show navbar"
        >
          <ChevronUp className="w-6 h-6 text-foreground transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      )}
    </>
  );
}

