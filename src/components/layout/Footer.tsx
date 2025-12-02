import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const quickLinks = [
  { label: "Mission", href: "#mission" },
  { label: "Programs", href: "#programs" },
  { label: "Campaigns", href: "#campaigns" },
  { label: "Impact", href: "#impact" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Finances", href: "/finances" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-foreground">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 lg:gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Inua Mama Initiative" 
              className="h-10 w-auto rounded-xl object-contain"
              style={{ 
                filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.2)) brightness(1.4) contrast(1.2) saturate(1.15)' 
              }}
            />
            <div>
              <h3 className="font-display font-semibold text-card text-sm sm:text-base">Inua Mama</h3>
              <p className="text-[10px] sm:text-xs text-card/60">Initiative</p>
            </div>
          </div>

          {/* Links - Desktop */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <nav className="flex items-center gap-4 lg:gap-6">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-card/70 hover:text-card transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="w-px h-4 bg-card/20" />
            <nav className="flex items-center gap-4 lg:gap-6">
              {legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-card/50 hover:text-card/70 transition-colors text-xs"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Links - Mobile */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 md:hidden">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-card/70 hover:text-card transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-card/10 flex items-center justify-center hover:bg-card/20 transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px]"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-card" />
              </a>
            ))}
          </div>
        </div>

        {/* Contact Row */}
        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-card/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-card/60">
            <a href="mailto:info@maasaimarawomen.org" className="flex items-center gap-1.5 hover:text-card/80 transition-colors min-h-[44px]">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden min-[375px]:inline break-all">info@maasaimarawomen.org</span>
              <span className="min-[375px]:hidden">Email</span>
            </a>
            <a href="tel:+254700000000" className="flex items-center gap-1.5 hover:text-card/80 transition-colors min-h-[44px]">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">+254 700 000 000</span>
            </a>
            <span className="flex items-center gap-1.5 min-h-[44px]">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Narok, Kenya</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <p className="text-card/40 text-xs">
              © {new Date().getFullYear()} Maasai Mara Women Empowerment Initiative
            </p>
          </div>
        </div>

        {/* Mobile Legal Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 md:hidden">
          {legalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-card/40 hover:text-card/60 transition-colors text-xs"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
