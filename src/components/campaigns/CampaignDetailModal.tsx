import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Heart, Users, Calendar, Target, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { useState } from "react";
import { cn, getImageUrl } from "@/lib/utils";
import { useDonationStore } from "@/stores/donationStore";
import { toast } from "@/hooks/use-toast";

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

interface CampaignDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: Campaign | null;
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

export function CampaignDetailModal({ isOpen, onClose, campaign }: CampaignDetailModalProps) {
    const [donationAmount, setDonationAmount] = useState('');
    const { openDonationModal } = useDonationStore();

    const handleShare = async () => {
        if (!campaign) return;

        const shareData = {
            title: campaign.title,
            text: `Support this campaign: ${campaign.title}`,
            url: `${window.location.origin}/campaigns/${campaign.id}`,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(shareData.url);
            toast({
                title: "Link copied",
                description: "Campaign link copied to clipboard",
            });
        }
    };

    if (!campaign) return null;

    const progress = (campaign.raised_amount / campaign.goal_amount) * 100;
    const daysLeft = calculateDaysLeft(campaign.end_date);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[900px] w-[95vw] h-[85vh] p-0 overflow-hidden bg-card border-none shadow-2xl rounded-[1.5rem] sm:rounded-[2rem]">
                <div className="sr-only">
                    <DialogTitle>{campaign.title}</DialogTitle>
                    <DialogDescription>
                        Support the {campaign.category} campaign. {formatCurrency(campaign.raised_amount)} raised of {formatCurrency(campaign.goal_amount)} goal.
                    </DialogDescription>
                </div>
                {/* macOS Style Bar */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-muted/80 backdrop-blur-md flex items-center px-4 z-50 border-b border-border/40">
                    {/* Mobile: Simple X button */}
                    <button
                        onClick={onClose}
                        className="sm:hidden w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Desktop: macOS style controls */}
                    <div className="hidden sm:flex gap-2">
                        <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-muted-foreground truncate max-w-[50%]">
                        {campaign.title}
                    </div>
                </div>

                <div className="h-full pt-10 overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col">
                        {/* Hero Image Section */}
                        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden">
                            <img
                                src={getImageUrl(campaign.image_url, "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200")}
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                                <Badge className="bg-primary/90 text-white border-none backdrop-blur-sm">
                                    {campaign.category || "Active Campaign"}
                                </Badge>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display leading-tight">
                                    {campaign.title}
                                </h2>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-6 rounded-[2rem] bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center space-y-2">
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest leading-none">Raised</span>
                                    <span className="text-3xl font-bold text-primary">{formatCurrency(campaign.raised_amount)}</span>
                                    <span className="text-xs text-muted-foreground">of {formatCurrency(campaign.goal_amount)} goal</span>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center space-y-2">
                                    <Users className="w-6 h-6 text-primary mb-1" />
                                    <span className="text-3xl font-bold">{Math.floor(progress * 2.4 + 10)}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Donors</span>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-muted/30 border border-border/50 flex flex-col items-center justify-center text-center space-y-2">
                                    <Calendar className="w-6 h-6 text-primary mb-1" />
                                    <span className="text-3xl font-bold">{daysLeft || '30+'}</span>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Days Remaining</span>
                                </div>
                            </div>

                            {/* Description & Progress */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-2xl font-bold font-display">About this Campaign</h3>
                                    <div className="prose prose-lg dark:prose-invert text-muted-foreground max-w-none leading-relaxed">
                                        {campaign.description}
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2 text-primary font-bold">
                                                <Target className="w-5 h-5" />
                                                <span>{Math.round(progress)}% of Goal Reached</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground font-medium">
                                                {formatCurrency(campaign.goal_amount - campaign.raised_amount)} needed to reach target
                                            </span>
                                        </div>
                                        <div className="h-4 bg-muted rounded-full overflow-hidden p-1 border border-border/50">
                                            <div
                                                className="h-full bg-primary rounded-full shadow-lg shadow-primary/20 transition-all duration-1000"
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Donate Sidebar */}
                                <div className="lg:col-span-1">
                                    <div className="p-6 rounded-[2rem] bg-card border border-border shadow-xl space-y-5 sticky top-0">
                                        <h3 className="text-xl font-bold text-center">Support Now</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[25, 50, 100, 250].map((amt) => (
                                                <Button
                                                    key={amt}
                                                    variant="outline"
                                                    className={cn(
                                                        "h-14 rounded-2xl font-bold transition-all",
                                                        donationAmount === amt.toString() ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-95" : "hover:bg-primary/5 hover:border-primary/40"
                                                    )}
                                                    onClick={() => setDonationAmount(amt.toString())}
                                                >
                                                    ${amt}
                                                </Button>
                                            ))}
                                        </div>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                            <Input
                                                type="number"
                                                placeholder="Custom"
                                                className="h-16 pl-8 rounded-2xl bg-muted/50 border-none outline-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                                                value={donationAmount}
                                                onChange={(e) => setDonationAmount(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 group"
                                            onClick={() => {
                                                onClose();
                                                openDonationModal();
                                            }}
                                        >
                                            Contribute Now
                                            <Heart className="w-5 h-5 ml-2 transition-transform group-active:scale-150" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full h-12 rounded-xl text-muted-foreground hover:text-foreground"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Share Campaign
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
