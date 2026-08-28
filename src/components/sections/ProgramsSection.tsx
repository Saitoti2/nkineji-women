import { Shield, GraduationCap, Stethoscope, Briefcase, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const programs = [
  {
    icon: Shield,
    title: "Rescue & Safe House",
    description: "Emergency rescue, shelter, and rehabilitation for girls fleeing harmful practices. 24/7 support with trauma counseling and legal aid.",
    color: "bg-primary",
  },
  {
    icon: GraduationCap,
    title: "Education & Sponsorship",
    description: "Full school sponsorships from primary through university. Includes fees, uniforms, supplies, and mentorship programs.",
    color: "bg-primary",
  },
  {
    icon: Stethoscope,
    title: "Women's Health",
    description: "Maternal care, cancer & fistula screening, mobile clinics, and health vouchers for specialized treatment.",
    color: "bg-primary",
  },
  {
    icon: Briefcase,
    title: "Micro-Enterprise",
    description: "Business training, seed capital, and market linkages to help women start and grow sustainable businesses.",
    color: "bg-primary",
  },
  {
    icon: Landmark,
    title: "Savings & Loans",
    description: "Women's savings groups (ROSCAs), micro-loans with fair terms, and financial literacy training.",
    color: "bg-primary",
  },
  {
    icon: Users,
    title: "Community Empowerment",
    description: "Leadership training, advocacy, conservation education, and community governance participation.",
    color: "bg-primary",
  },
];

export function ProgramsSection() {
  const navigate = useNavigate();
  return (
    <section id="programs" className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3">
            Our Programs
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
            Holistic Support for <span className="text-primary">Women & Girls</span>
          </h2>
          <p className="text-foreground/90 font-medium text-base sm:text-lg">
            Rescue, healthcare, education, and economic independence for women in the Mara.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {programs.map((program, index) => (
            <div
              key={program.title}
              className="float-card p-6 border border-border/70 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${program.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                <program.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {program.title}
              </h3>
              <p className="text-foreground/80 font-medium text-xs leading-relaxed">
                {program.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
