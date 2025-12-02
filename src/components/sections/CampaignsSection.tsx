import { Heart, Target, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const campaigns = [
  {
    id: 1,
    title: "Rescue & Safe House Fund",
    description: "Provide shelter, care, and rehabilitation for girls rescued from harmful traditional practices.",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=80&auto=format",
    raised: 42500,
    goal: 75000,
    donors: 234,
    daysLeft: 45,
    urgent: true,
  },
  {
    id: 2,
    title: "Women's Micro-Enterprise Fund",
    description: "Seed capital and training to help women start sustainable small businesses.",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=80&auto=format",
    raised: 28300,
    goal: 50000,
    donors: 156,
    daysLeft: 60,
    urgent: false,
  },
  {
    id: 3,
    title: "Girls' Education Sponsorship",
    description: "Cover school fees, uniforms, and supplies for girls from primary to university.",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=800&fit=crop&q=80&auto=format",
    raised: 18750,
    goal: 30000,
    donors: 89,
    daysLeft: 30,
    urgent: true,
  },
  {
    id: 4,
    title: "Maternal Health Outreach",
    description: "Mobile clinics bringing prenatal care and safe delivery services to remote communities.",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop&q=80&auto=format",
    raised: 35000,
    goal: 45000,
    donors: 178,
    daysLeft: 15,
    urgent: true,
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function CampaignsSection() {
  return (
    <section id="campaigns" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 float-card p-5 sm:p-6 md:p-8 lg:p-10">
          <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            Active Campaigns
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Choose Your <span className="text-accent">Impact</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
            Direct your donation to causes that matter most to you. Every campaign is fully transparent with real-time progress tracking.
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {campaigns.map((campaign) => {
            const progress = (campaign.raised / campaign.goal) * 100;
            
            return (
              <div key={campaign.id} className="float-card overflow-hidden group">
                {/* Image */}
                <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  
                  {campaign.urgent && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 sm:px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-semibold">
                      Urgent
                    </div>
                  )}
                  
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-card leading-tight">{campaign.title}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6">
                  <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-5 md:mb-6 leading-relaxed">{campaign.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="font-semibold text-foreground">{formatCurrency(campaign.raised)} raised</span>
                      <span className="text-muted-foreground">of {formatCurrency(campaign.goal)}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5 md:mb-6">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{campaign.donors} donors</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{campaign.daysLeft} days left</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button variant="donate" className="w-full min-h-[44px] sm:min-h-[48px] text-sm sm:text-base">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Donate to This Campaign
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <Button variant="outline" size="lg" className="min-h-[48px] sm:min-h-[56px] text-sm sm:text-base">
            <Target className="w-4 h-4" />
            View All Campaigns
          </Button>
        </div>
      </div>
    </section>
  );
}
