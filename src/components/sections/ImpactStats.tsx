import { Heart, GraduationCap, Stethoscope, Users, TrendingUp, Home } from "lucide-react";

const stats = [
  {
    icon: Heart,
    value: "847",
    label: "Girls Rescued",
    description: "From harmful practices and given a safe home",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: GraduationCap,
    value: "1,200+",
    label: "Education Sponsorships",
    description: "Girls supported through school and university",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Stethoscope,
    value: "3,500+",
    label: "Healthcare Services",
    description: "Maternal care, cancer screening & treatment support",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Users,
    value: "45",
    label: "Savings Groups",
    description: "Women's cooperatives managing their finances",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: TrendingUp,
    value: "156",
    label: "Micro-Businesses",
    description: "Women-owned enterprises started and thriving",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Home,
    value: "12",
    label: "Community Centers",
    description: "Safe spaces for women's programs and training",
    color: "bg-primary/10 text-primary",
  },
];

export function ImpactStats() {
  return (
    <section id="impact" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-muted/50 via-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 float-card p-5 sm:p-6 md:p-8 lg:p-10">
          <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Our Impact
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Measurable Change, <span className="text-primary">Real Lives</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
            Every donation translates directly into tangible impact. Here's what your generosity has achieved.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="float-card p-4 sm:p-5 md:p-6 lg:p-8"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${stat.color} flex items-center justify-center mb-3 sm:mb-4`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-7" />
              </div>
              <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">{stat.label}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Transparency Note */}
        <div className="mt-8 sm:mt-10 md:mt-12 float-card-static p-4 sm:p-5 md:p-6 lg:p-8 bg-secondary/5 border border-secondary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground mb-1 text-sm sm:text-base">98% Program Efficiency</h4>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                98 cents of every dollar goes directly to our programs. We maintain full transparency 
                with quarterly financial reports available to all donors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
