import { useState } from "react";
import { Heart, Target, Clock, Users, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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

function calculateDaysLeft(endDate?: string): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Fetch function for React Query
const fetchCampaigns = async (): Promise<Campaign[]> => {
  const res = await fetch(`${API_BASE}/campaigns?status=active&limit=4`);
  const data = await res.json();
  if (!data.success) throw new Error('Failed to fetch campaigns');
  return data.data;
};

export function CampaignsSection() {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use React Query for caching
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', 'homepage'],
    queryFn: fetchCampaigns,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleDonate = async () => {
    if (!selectedCampaign || !donationAmount) {
      toast.error("Please enter a donation amount");
      return;
    }

    toast.success(`Thank you for your ${formatCurrency(parseFloat(donationAmount))} donation!`);
    setSelectedCampaign(null);
    setDonationAmount('');
  };

  const getGalleryImages = (campaign: Campaign) => {
    return campaign.image_url ? [campaign.image_url] : [];
  };

  const progress = selectedCampaign
    ? (selectedCampaign.raised_amount / selectedCampaign.goal_amount) * 100
    : 0;



  return (
    <>
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

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="float-card overflow-hidden animate-pulse">
                  <div className="h-40 sm:h-48 md:h-56 bg-muted" />
                  <div className="p-4 sm:p-5 md:p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-2 bg-muted rounded w-full mt-4" />
                    <div className="flex gap-4">
                      <div className="h-3 bg-muted rounded w-20" />
                      <div className="h-3 bg-muted rounded w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl">
              <p className="text-muted-foreground">No active campaigns at the moment.</p>
            </div>
          ) : (
            <>
              {/* Campaigns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                {campaigns.map((campaign) => {
                  const campaignProgress = (campaign.raised_amount / campaign.goal_amount) * 100;
                  const daysLeft = calculateDaysLeft(campaign.end_date);

                  return (
                    <div
                      key={campaign.id}
                      className="float-card overflow-hidden group cursor-pointer transition-all hover:shadow-xl"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setCurrentImageIndex(0);
                      }}
                    >
                      {/* Image */}
                      <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
                        {campaign.image_url ? (
                          <img
                            src={campaign.image_url}
                            alt={campaign.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="eager"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary/20 flex items-center justify-center">
                            <Heart className="h-16 w-16 text-secondary opacity-30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

                        {daysLeft !== null && daysLeft < 30 && (
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
                        <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-5 md:mb-6 leading-relaxed line-clamp-2">{campaign.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-3 sm:mb-4">
                          <div className="flex justify-between text-xs sm:text-sm mb-2">
                            <span className="font-semibold text-foreground">{formatCurrency(campaign.raised_amount)} raised</span>
                            <span className="text-muted-foreground">of {formatCurrency(campaign.goal_amount)}</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${Math.min(campaignProgress, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5 md:mb-6">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>{Math.floor(campaignProgress * 2)} donors</span>
                          </div>
                          {daysLeft !== null && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span>{daysLeft} days left</span>
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <Button
                          variant="donate"
                          className="w-full min-h-[44px] sm:min-h-[48px] text-sm sm:text-base"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCampaign(campaign);
                            setCurrentImageIndex(0);
                          }}
                        >
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
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-[48px] sm:min-h-[56px] text-sm sm:text-base"
                  onClick={() => navigate('/campaigns')}
                >
                  <Target className="w-4 h-4" />
                  View All Campaigns
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* macOS-Style Modal */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-background border-2 shadow-2xl rounded-2xl">
          {selectedCampaign && (
            <div className="flex flex-col max-h-[90vh]">
              {/* macOS Window Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCampaign(null)}
                      className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                    />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
                <h2 className="text-sm font-medium text-muted-foreground absolute left-1/2 transform -translate-x-1/2">
                  Campaign Details
                </h2>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Gallery */}
                {getGalleryImages(selectedCampaign).length > 0 && (
                  <div className="relative h-64 sm:h-80 md:h-96 bg-muted">
                    <img
                      src={getGalleryImages(selectedCampaign)[currentImageIndex]}
                      alt={selectedCampaign.title}
                      className="w-full h-full object-cover"
                    />
                    {getGalleryImages(selectedCampaign).length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev =>
                            prev === 0 ? getGalleryImages(selectedCampaign).length - 1 : prev - 1
                          )}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev =>
                            prev === getGalleryImages(selectedCampaign).length - 1 ? 0 : prev + 1
                          )}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Title & Category */}
                  <div className="mb-6">
                    {selectedCampaign.category && (
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                        {selectedCampaign.category}
                      </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
                      {selectedCampaign.title}
                    </h1>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedCampaign.description}
                    </p>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-8 p-6 bg-muted/30 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-foreground">
                        {formatCurrency(selectedCampaign.raised_amount)}
                      </span>
                      <span className="text-muted-foreground">
                        of {formatCurrency(selectedCampaign.goal_amount)} goal
                      </span>
                    </div>
                    <div className="progress-bar mb-4">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{Math.floor(progress)}%</div>
                        <div className="text-xs text-muted-foreground">Funded</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{Math.floor(progress * 2)}</div>
                        <div className="text-xs text-muted-foreground">Donors</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {calculateDaysLeft(selectedCampaign.end_date) || '∞'}
                        </div>
                        <div className="text-xs text-muted-foreground">Days Left</div>
                      </div>
                    </div>
                  </div>

                  {/* Donation Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold mb-4">Make a Donation</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-2">
                        {[25, 50, 100, 250].map(amount => (
                          <Button
                            key={amount}
                            variant="outline"
                            onClick={() => setDonationAmount(amount.toString())}
                            className={donationAmount === amount.toString() ? 'border-primary bg-primary/10' : ''}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Custom amount"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleDonate} size="lg" className="px-8">
                          <Heart className="mr-2 h-4 w-4" />
                          Donate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
