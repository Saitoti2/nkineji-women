import { Heart, GraduationCap, Stethoscope, Users, TrendingUp, Home, BookOpen, MessageCircle } from "lucide-react";
import { usePublicStats, fmtStat, fmtMoney } from "@/hooks/usePublicStats";

export function ImpactStats() {
  const { data: stats, isLoading } = usePublicStats();

  const statCards = [
    {
      icon: Users,
      value: fmtStat(stats?.beneficiaries),
      label: "Women & Girls Supported",
      description: "Beneficiaries receiving education, healthcare, and economic support",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: TrendingUp,
      value: fmtMoney(stats?.totalRaised),
      label: "Total Funds Raised",
      description: "Donations collected and channeled directly into community programs",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Heart,
      value: fmtStat(stats?.donations),
      label: "Donations Received",
      description: "Individual contributions from supporters around the world",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: BookOpen,
      value: fmtStat(stats?.impactStories),
      label: "Impact Stories",
      description: "Real stories of resilience and change published from the Mara",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Stethoscope,
      value: fmtStat(stats?.activeCampaigns),
      label: "Active Campaigns",
      description: "Ongoing fundraising campaigns accepting contributions right now",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: MessageCircle,
      value: fmtStat(stats?.communityComments),
      label: "Community Voices",
      description: "Messages of encouragement left by our global supporter community",
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <section id="impact" className="py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3">
            Our Impact
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 leading-tight">
            Measurable Change, <span className="text-primary">Real Lives</span>
          </h2>
          <p className="text-foreground/90 font-medium text-base sm:text-lg">
            Every dollar goes directly to community programs in the Mara.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className="float-card p-6 border border-border/70"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground mb-1">
                {isLoading ? (
                  <span className="inline-block w-20 h-8 bg-muted rounded-lg animate-pulse" />
                ) : (
                  stat.value
                )}
              </div>
              <h3 className="font-bold text-foreground mb-1 text-base">{stat.label}</h3>
              <p className="text-foreground/80 font-medium text-xs leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Transparency Note */}
        <div className="mt-8 p-6 rounded-2xl bg-card border border-border/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-foreground mb-1 text-base">98% Program Efficiency</h4>
              <p className="text-foreground/90 font-medium text-xs leading-relaxed">
                98 cents of every dollar goes directly to our programs with full quarterly financial transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
