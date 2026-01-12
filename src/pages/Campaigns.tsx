import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DynamicNavbar } from "@/components/layout/DynamicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Heart, Clock, Users, Target, X, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const fetchCampaigns = async (): Promise<Campaign[]> => {
    const res = await fetch(`${API_BASE}/campaigns?status=active`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    const data = await res.json();
    return data.data;
};

export default function Campaigns() {
    const navigate = useNavigate();
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const { data: campaigns = [], isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: fetchCampaigns,
        staleTime: 5 * 60 * 1000,
    });

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || campaign.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-background flex flex-col pt-32">
            <DynamicNavbar />

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Back Link */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300"
                    >
                        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Button>
                </div>

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium border-primary/20">
                        Our Initiatives
                    </Badge>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground leading-tight">
                        Powering <span className="text-primary italic">Change</span> Through Giving
                    </h1>
                    <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                        Every dollar contributed goes directly to the field. Browse our active campaigns and help us reach our goals.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between p-6 bg-card rounded-[2rem] border border-border/50 shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="relative w-full lg:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 bg-background border-none rounded-2xl shadow-inner focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {['all', 'rescue', 'education', 'health', 'economic', 'community'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300",
                                    categoryFilter === cat
                                        ? "bg-primary text-white shadow-lg shadow-primary/25 translate-y-[-2px]"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[450px] bg-card rounded-[2.5rem] border border-border animate-pulse overflow-hidden">
                                <div className="h-56 bg-muted" />
                                <div className="p-8 space-y-4">
                                    <div className="h-4 bg-muted w-1/4 rounded" />
                                    <div className="h-6 bg-muted w-3/4 rounded" />
                                    <div className="h-3 bg-muted w-full rounded" />
                                    <div className="h-8 bg-muted w-full rounded-xl mt-6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="text-center py-32 bg-card rounded-[3rem] border border-dashed border-border/60">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Filter className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No campaigns found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                        <Button variant="outline" className="mt-8 rounded-2xl" onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}>
                            Reset All Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                        {filteredCampaigns.map((campaign, idx) => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                index={idx}
                                onClick={() => setSelectedCampaign(campaign)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            {/* Campaign Modal (Simplified reuse) */}
            <CampaignDetailModal
                isOpen={!!selectedCampaign}
                onClose={() => setSelectedCampaign(null)}
                campaign={selectedCampaign}
            />
        </div>
    );
}

function CampaignCard({ campaign, index, onClick }: { campaign: Campaign; index: number; onClick: () => void }) {
    const progress = (campaign.raised_amount / campaign.goal_amount) * 100;

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer bg-card rounded-[2.5rem] overflow-hidden border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="aspect-[16/10] relative overflow-hidden">
                <img
                    src={campaign.image_url || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800"}
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <Badge className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border-white/20 text-white">
                    {campaign.category}
                </Badge>
            </div>

            <div className="p-8 space-y-6">
                <div>
                    <h3 className="text-2xl font-bold font-display leading-tight mb-2 group-hover:text-primary transition-colors">
                        {campaign.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                        {campaign.description}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end text-sm">
                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Raised</span>
                            <p className="font-bold text-foreground text-lg">{formatCurrency(campaign.raised_amount)}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Goal</span>
                            <p className="font-bold text-muted-foreground">{formatCurrency(campaign.goal_amount)}</p>
                        </div>
                    </div>

                    <div className="h-3 bg-muted rounded-full overflow-hidden p-[2px]">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary),0.4)]"
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                        <Target className="w-4 h-4" />
                        <span>{Math.round(progress)}% Goal</span>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-xl group/btn hover:bg-primary/10 hover:text-primary transition-all">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
    );
}

// Minimal Campaign Detail Modal for the page (can be expanded later)
function CampaignDetailModal({ isOpen, onClose, campaign }: { isOpen: boolean, onClose: () => void, campaign: Campaign | null }) {
    if (!campaign) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-none rounded-[2rem] shadow-2xl">
                <div className="relative">
                    <div className="h-64 sm:h-80 relative overflow-hidden">
                        <img src={campaign.image_url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 border border-white/10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="p-8 sm:p-10 space-y-8">
                        <div className="space-y-3">
                            <Badge className="bg-primary/90 text-white border-none">{campaign.category}</Badge>
                            <h2 className="text-3xl sm:text-4xl font-bold font-display">{campaign.title}</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">{campaign.description}</p>
                        </div>

                        <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/50 space-y-6">
                            <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Raised so far</p>
                                    <p className="text-3xl font-bold text-primary">{formatCurrency(campaign.raised_amount)}</p>
                                </div>
                                <div className="h-10 w-[1px] bg-border hidden sm:block" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Goal target</p>
                                    <p className="text-3xl font-bold text-foreground">{formatCurrency(campaign.goal_amount)}</p>
                                </div>
                                <div className="h-10 w-[1px] bg-border hidden sm:block" />
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Donors</p>
                                        <p className="text-xl font-bold">1,240+</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Progress</span>
                                    <span>{Math.round((campaign.raised_amount / campaign.goal_amount) * 100)}%</span>
                                </div>
                                <div className="h-4 bg-background/50 rounded-full overflow-hidden p-1 border border-border/50">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000 shadow-lg shadow-primary/20"
                                        style={{ width: `${Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button size="lg" className="flex-1 h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
                                Donate to this Campaign
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 w-16 rounded-2xl p-0">
                                <Heart className="w-6 h-6 text-primary" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
