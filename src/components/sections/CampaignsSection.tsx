import { Heart, Target, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const campaigns = [
  {
    id: 1,
    title: "Rescue & Safe House Fund",
    description: "Provide shelter, care, and rehabilitation for girls rescued from harmful traditional practices.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
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
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop",
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
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop",
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
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
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
    <section id="campaigns" className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Active Campaigns
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose Your <span className="text-accent">Impact</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Direct your donation to causes that matter most to you. Every campaign is fully transparent with real-time progress tracking.
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {campaigns.map((campaign) => {
            const progress = (campaign.raised / campaign.goal) * 100;
            
            return (
              <div key={campaign.id} className="float-card overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  
                  {campaign.urgent && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
                      Urgent
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-xl font-bold text-card">{campaign.title}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-muted-foreground text-sm mb-6">{campaign.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {campaign.donors} donors
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {campaign.daysLeft} days left
                    </div>
                  </div>

                  {/* CTA */}
                  <Button variant="donate" className="w-full">
                    <Heart className="w-4 h-4" />
                    Donate to This Campaign
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            <Target className="w-4 h-4" />
            View All Campaigns
          </Button>
        </div>
      </div>
    </section>
  );
}
