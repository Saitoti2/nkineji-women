import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, ChevronUp, Download } from "lucide-react";
import { useState } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";


const quickLinks = [
  { label: "Mission", href: "/#mission" },
  { label: "Programs", href: "/#programs" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "Impact", href: "/impact" },
];

const legalLinks = [
  { label: "Privacy", href: "/#contact" },
  { label: "Terms", href: "/#contact" },
  { label: "Finances", href: "/#contact" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isInstallable, installApp, isInstalled } = usePWA();


  return (
    <footer className="bg-foreground">
      {/* Mobile: Collapsible Thin Footer */}
      <div className="md:hidden">
        {/* Thin One-Line Footer - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between border-t border-white/10"
        >
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Nkineji Community Development Initiative"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <div className="text-left">
              <p className="text-xs font-semibold text-white">Nkineji Community</p>
              <p className="text-[10px] text-gray-400">© {new Date().getFullYear()}</p>
            </div>
          </div>
          <div
            className="transition-transform duration-300"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <ChevronUp size={20} className="text-gray-400" />
          </div>
        </button>

        {/* Expanded Content - Collapsible */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: isExpanded ? '1000px' : '0' }}
        >
          <div className="px-4 py-6 space-y-6">
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-xs text-gray-400">
              <a href="mailto:info@nkineji.org" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span>info@nkineji.org</span>
              </a>
              <a href="tel:+254712345678" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span>+254 712 345 678</span>
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Narok, Kenya</span>
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>

            {isInstallable && !isInstalled && (
              <Button
                variant="outline"
                className="w-full justify-center gap-2 text-white border-white/20 bg-white/5 hover:bg-white/10"
                onClick={installApp}
              >
                <Download className="w-4 h-4" />
                Install App
              </Button>
            )}


            {/* Legal Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-4 border-t border-white/10">
              {legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Full Footer */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-16">
          {/* Main Footer Content */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Nkineji Community Development Initiative"
                className="w-10 h-10 rounded-xl object-contain"
              />
              <div>
                <h3 className="font-display font-semibold text-white text-sm sm:text-base">Nkineji Community</h3>
                <p className="text-[10px] sm:text-xs text-gray-400">Development Initiative</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 lg:gap-8">
              <nav className="flex items-center gap-4 lg:gap-6">
                {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="w-px h-4 bg-white/20" />
              <nav className="flex items-center gap-4 lg:gap-6">
                {legalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-gray-400 hover:text-gray-200 transition-colors text-xs"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Social Links and Install */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>

              {isInstallable && !isInstalled && (
                <Button
                  variant="outline"
                  className="text-white border-white/20 bg-white/5 hover:bg-white/10 gap-2"
                  onClick={installApp}
                >
                  <Download className="w-4 h-4" />
                  Install App
                </Button>
              )}
            </div>

          </div>

          {/* Contact Row */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs sm:text-sm text-gray-400">
              <a href="mailto:info@nkineji.org" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">info@nkineji.org</span>
              </a>
              <a href="tel:+254712345678" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">+254 712 345 678</span>
              </a>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Narok, Kenya</span>
              </span>
            </div>

            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Nkineji Community Development Initiative
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
