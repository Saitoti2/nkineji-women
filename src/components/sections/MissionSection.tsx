import { Heart, Leaf, BookOpen, Users } from "lucide-react";
import mission1 from "@/assets/mission-1.png";
import mission2 from "@/assets/mission-2.png";
import mission3 from "@/assets/mission-3.png";
import mission4 from "@/assets/mission-4.png";

const pillars = [
  {
    icon: Heart,
    title: "Women First",
    description: "Every program, every decision, every dollar prioritizes the safety, dignity, and empowerment of Maasai women and girls.",
  },
  {
    icon: Leaf,
    title: "Conservation",
    description: "Protecting the Maasai Mara ecosystem through community-led conservation that provides sustainable livelihoods.",
  },
  {
    icon: BookOpen,
    title: "Education",
    description: "Breaking the cycle of poverty through quality education, from primary school to university and vocational training.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building strong, self-sustaining communities where women lead, participate, and benefit equally.",
  },
];

export function MissionSection() {
  return (
    <section id="mission" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="float-card p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12">
            <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Our Mission
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-5 md:mb-6 leading-tight">
              Transforming the Maasai Mara, <span className="text-primary">One Woman at a Time</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-7 md:mb-8">
              We are a community-based organization dedicated to empowering Maasai women and girls
              through holistic support — from emergency rescue and healthcare to education,
              economic independence, and community leadership. Your donations fuel every aspect
              of this transformation.
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <pillar.icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-1">{pillar.title}</h4>
                    <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="float-card overflow-hidden h-32 sm:h-40 md:h-48 lg:h-56 group">
                <img
                  src={mission1}
                  alt="Maasai women in traditional dress working together in community"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="float-card overflow-hidden h-24 sm:h-32 md:h-40 group">
                <img
                  src={mission2}
                  alt="Maasai girls learning in classroom"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 md:space-y-4 pt-4 sm:pt-6 md:pt-8">
              <div className="float-card overflow-hidden h-24 sm:h-32 md:h-40 group">
                <img
                  src={mission3}
                  alt="Maasai women and children in community gathering"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="float-card overflow-hidden h-32 sm:h-40 md:h-48 lg:h-56 group">
                <img
                  src={mission4}
                  alt="Maasai women receiving maternal healthcare support"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
