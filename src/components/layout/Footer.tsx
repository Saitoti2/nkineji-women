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
      <div className="container mx-auto px-4 py-8 sm:py-10">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">MM</span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-card text-sm sm:text-base">Maasai Mara Women</h3>
              <p className="text-[10px] sm:text-xs text-card/60">Empowerment Initiative</p>
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
                className="w-8 h-8 rounded-lg bg-card/10 flex items-center justify-center hover:bg-card/20 transition-all duration-300 hover:scale-110"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 text-card" />
              </a>
            ))}
          </div>
        </div>

        {/* Contact Row */}
        <div className="mt-6 pt-6 border-t border-card/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-card/60">
            <a href="mailto:info@maasaimarawomen.org" className="flex items-center gap-1.5 hover:text-card/80 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">info@maasaimarawomen.org</span>
              <span className="xs:hidden">Email</span>
            </a>
            <a href="tel:+254700000000" className="flex items-center gap-1.5 hover:text-card/80 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>+254 700 000 000</span>
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Narok, Kenya</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <p className="text-card/40 text-xs">
              © {new Date().getFullYear()} MMWEI
            </p>
            <div className="flex items-center gap-1 text-card/40 text-xs">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-primary fill-primary" />
            </div>
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
