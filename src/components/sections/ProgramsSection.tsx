import { Shield, GraduationCap, Stethoscope, Briefcase, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    color: "bg-secondary",
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
    color: "bg-accent",
  },
  {
    icon: Landmark,
    title: "Savings & Loans",
    description: "Women's savings groups (ROSCAs), micro-loans with fair terms, and financial literacy training.",
    color: "bg-secondary",
  },
  {
    icon: Users,
    title: "Community Empowerment",
    description: "Leadership training, advocacy, conservation education, and community governance participation.",
    color: "bg-primary",
  },
];

export function ProgramsSection() {
  return (
    <section id="programs" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 float-card p-5 sm:p-6 md:p-8 lg:p-10">
          <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Our Programs
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Holistic Support for <span className="text-primary">Women & Girls</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
            Our interconnected programs address every aspect of a woman's journey — from rescue and healing to education, economic independence, and community leadership.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {programs.map((program, index) => (
            <div
              key={program.title}
              className="float-card p-4 sm:p-5 md:p-6 lg:p-8 group cursor-pointer min-h-[200px] sm:min-h-[220px]"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${program.color} flex items-center justify-center mb-4 sm:mb-5 md:mb-6 transition-transform group-hover:scale-110`}>
                <program.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-card" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
                {program.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {program.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <Button variant="default" size="lg" className="min-h-[48px] sm:min-h-[56px] text-sm sm:text-base">
            Learn More About Our Work
          </Button>
        </div>
      </div>
    </section>
  );
}
