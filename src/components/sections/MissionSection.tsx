import { Heart, Leaf, BookOpen, Users } from "lucide-react";

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
    <section id="mission" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Mission
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Transforming the Maasai Mara, <span className="text-primary">One Woman at a Time</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              We are a community-based organization dedicated to empowering Maasai women and girls 
              through holistic support — from emergency rescue and healthcare to education, 
              economic independence, and community leadership. Your donations fuel every aspect 
              of this transformation.
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-2 gap-4">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <pillar.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">{pillar.title}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="float-card-static overflow-hidden h-48 sm:h-56">
                <img
                  src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=300&fit=crop"
                  alt="Maasai women in traditional dress"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="float-card-static overflow-hidden h-32 sm:h-40">
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop"
                  alt="Children in classroom"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="float-card-static overflow-hidden h-32 sm:h-40">
                <img
                  src="https://images.unsplash.com/photo-1504159506876-f8338247a14a?w=400&h=250&fit=crop"
                  alt="African landscape"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="float-card-static overflow-hidden h-48 sm:h-56">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop"
                  alt="Healthcare support"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
