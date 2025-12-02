import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const quickLinks = [
  { label: "Our Mission", href: "#mission" },
  { label: "Programs", href: "#programs" },
  { label: "Campaigns", href: "#campaigns" },
  { label: "Impact Reports", href: "#impact" },
  { label: "Stories", href: "#stories" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Financial Reports", href: "/finances" },
  { label: "Donor Rights", href: "/donor-rights" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-card">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">MM</span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg">Maasai Mara</h3>
                <p className="text-xs text-card/70">Women Empowerment Initiative</p>
              </div>
            </div>
            <p className="text-card/70 text-sm leading-relaxed mb-6">
              Transforming lives through rescue, education, healthcare, and economic empowerment 
              of Maasai women and girls in Kenya.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-card/10 flex items-center justify-center hover:bg-card/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-card/70 hover:text-card transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Transparency</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-card/70 hover:text-card transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-card/70 text-sm">
                  Maasai Mara, Narok County<br />Kenya, East Africa
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+254700000000" className="text-card/70 hover:text-card text-sm">
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:info@maasaimarawomen.org" className="text-card/70 hover:text-card text-sm">
                  info@maasaimarawomen.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-card/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-card/50 text-sm">
            © {new Date().getFullYear()} Maasai Mara Women Empowerment Initiative. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-card/50 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span>for Maasai women</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
