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

// Cloudinary images for landing page mission gallery
const CLOUDINARY_IMAGES = {
  womenGathering: "https://res.cloudinary.com/dssyfjokh/image/upload/v1787950826/mara-bloom/landing/khjsezg2arnvkbdefewq.jpg",
  takingPhoto: "https://res.cloudinary.com/dssyfjokh/image/upload/v1787950827/mara-bloom/landing/cg9xh7dsefuqzcsla9f1.jpg",
  communityGathering: "https://res.cloudinary.com/dssyfjokh/image/upload/v1787950828/mara-bloom/landing/htzzrpfoskgnvqgrmkov.jpg",
  craftsClock: "https://res.cloudinary.com/dssyfjokh/image/upload/v1787950829/mara-bloom/landing/nf2j8s1yytkkfycscfcz.jpg",
  beadedJewelry: "https://res.cloudinary.com/dssyfjokh/image/upload/v1787950830/mara-bloom/landing/nx95yte1wa1nfzhpdce7.jpg",
};

export function MissionSection() {
  return (
    <section id="mission" className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="p-2 sm:p-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
              Our Mission
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Transforming the Mara, <span className="text-primary">One Woman at a Time</span>
            </h2>
            <p className="text-foreground/90 font-medium text-base sm:text-lg leading-relaxed mb-8">
              Dedicated to empowering Maasai women and girls through emergency rescue, healthcare, education, and financial independence.
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/70">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <pillar.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground text-sm mb-1">{pillar.title}</h4>
                    <p className="text-foreground/80 text-xs leading-relaxed font-medium">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cloudinary Image Mosaic Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <div className="float-card overflow-hidden h-36 sm:h-44 md:h-52 lg:h-60 group">
                <img
                  src={CLOUDINARY_IMAGES.womenGathering}
                  alt="Maasai women in traditional dress sitting together in community"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="float-card overflow-hidden h-28 sm:h-36 md:h-44 group">
                <img
                  src={CLOUDINARY_IMAGES.takingPhoto}
                  alt="Maasai women and volunteers connecting"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="float-card overflow-hidden h-24 sm:h-32 group">
                <img
                  src={CLOUDINARY_IMAGES.beadedJewelry}
                  alt="Maasai beaded belts and traditional artisan crafts"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 md:space-y-4 pt-4 sm:pt-6 md:pt-8">
              <div className="float-card overflow-hidden h-28 sm:h-36 md:h-44 group">
                <img
                  src={CLOUDINARY_IMAGES.communityGathering}
                  alt="Community gathering in the Maasai Mara"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="float-card overflow-hidden h-36 sm:h-44 md:h-52 lg:h-60 group">
                <img
                  src={CLOUDINARY_IMAGES.craftsClock}
                  alt="Women presenting handcrafted items"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
