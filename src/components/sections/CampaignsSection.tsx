import { useState } from "react";
import { Heart, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CampaignDetailModal } from "@/components/campaigns/CampaignDetailModal";
import { getImageUrl } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
  image_url?: string;
  category?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

const fetchCampaigns = async (): Promise<Campaign[]> => {
  const res = await fetch(`${API_BASE}/campaigns?status=active&limit=3`);
  const data = await res.json();
  if (!data.success) throw new Error('Failed to fetch campaigns');
  return data.data;
};

export function CampaignsSection() {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', 'homepage'],
    queryFn: fetchCampaigns,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <>
      <section id="campaigns" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Active Campaigns
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Choose Your <span className="text-primary italic">Impact</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Direct your donation to causes that matter most to you. Every campaign is fully transparent with real-time progress tracking.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] bg-card rounded-[2.5rem] border border-border animate-pulse overflow-hidden">
                  <div className="h-56 bg-muted" />
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-muted w-1/4 rounded" />
                    <div className="h-6 bg-muted w-3/4 rounded" />
                    <div className="h-10 bg-muted w-full rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-[3rem] border border-dashed border-border">
              <p className="text-muted-foreground">No active campaigns at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {campaigns.map((campaign, idx) => (
                <CampaignItem
                  key={campaign.id}
                  campaign={campaign}
                  index={idx}
                  onClick={() => setSelectedCampaign(campaign)}
                />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button
              variant="outline"
              size="lg"
              className="h-16 px-10 rounded-2xl text-lg font-bold group"
              onClick={() => navigate('/campaigns')}
            >
              View All Campaigns
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      <CampaignDetailModal
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        campaign={selectedCampaign}
      />
    </>
  );
}

function CampaignItem({ campaign, index, onClick }: { campaign: Campaign; index: number; onClick: () => void }) {
  const progress = (campaign.raised_amount / campaign.goal_amount) * 100;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-[3rem] overflow-hidden border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col sm:flex-row h-full">
        <div className="w-full sm:w-[40%] relative overflow-hidden h-64 sm:h-auto">
          <img
            src={getImageUrl(campaign.image_url, "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600")}
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent sm:bg-gradient-to-r" />
        </div>
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-widest font-bold">
              {campaign.category || "Health"}
            </Badge>
            <h3 className="text-2xl font-bold font-display group-hover:text-primary transition-colors leading-tight">
              {campaign.title}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {campaign.description}
            </p>
          </div>

          <div className="space-y-4 pt-6">
            <div className="flex justify-between items-end text-sm font-bold">
              <span className="text-primary">{formatCurrency(campaign.raised_amount)}</span>
              <span className="text-muted-foreground">of {formatCurrency(campaign.goal_amount)}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <Button className="w-full h-12 rounded-xl font-bold group/btn">
              Support Now
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </Button>
            <p className="text-[10px] text-muted-foreground/60 text-center mt-3 uppercase tracking-tighter">
              © Nkineji Community Initiative
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
