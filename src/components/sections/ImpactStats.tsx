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
    <section id="impact" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            Our Impact
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Measurable Change, <span className="text-primary">Real Lives</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Every donation translates directly into tangible impact. Here's what your generosity has achieved.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="float-card p-6 sm:p-8"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{stat.label}</h3>
              <p className="text-muted-foreground text-sm">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Transparency Note */}
        <div className="mt-12 float-card-static p-6 sm:p-8 bg-secondary/5 border border-secondary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">98% Program Efficiency</h4>
              <p className="text-muted-foreground text-sm">
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
