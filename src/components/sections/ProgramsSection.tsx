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
    <section id="programs" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Programs
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Holistic Support for <span className="text-primary">Women & Girls</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our interconnected programs address every aspect of a woman's journey — from rescue and healing to education, economic independence, and community leadership.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, index) => (
            <div
              key={program.title}
              className="float-card p-6 sm:p-8 group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl ${program.color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                <program.icon className="w-7 h-7 text-card" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {program.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {program.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button variant="default" size="lg">
            Learn More About Our Work
          </Button>
        </div>
      </div>
    </section>
  );
}
