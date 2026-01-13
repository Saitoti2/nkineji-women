import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DynamicNavbar } from "@/components/layout/DynamicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";
import { Heart, Target, Search, Filter, ArrowRight } from "lucide-react";
import { CampaignDetailModal } from "@/components/campaigns/CampaignDetailModal";

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
    const res = await fetch(`${API_BASE}/campaigns?status=active`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    const data = await res.json();
    return data.data;
};

export default function Campaigns() {
    const navigate = useNavigate();
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
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
        <div className="min-h-screen bg-background flex flex-col pt-20">
            <DynamicNavbar />

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pb-20">

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
                <div className="mb-12 flex flex-col gap-6 p-6 bg-card rounded-[2rem] border border-border/50 shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full lg:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 bg-background border-none rounded-2xl shadow-inner focus-visible:ring-2 focus-visible:ring-primary/20"
                            />
                        </div>

                        {/* Mobile Scrollable Categories */}
                        <div className="w-full lg:w-auto overflow-hidden">
                            <div className="flex gap-3 overflow-x-auto pb-4 -mb-4 sm:pb-0 sm:mb-0 px-1 scrollbar-hide mask-fade-right">
                                {['all', 'rescue', 'education', 'health', 'economic', 'community'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={cn(
                                            "flex-none px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300",
                                            categoryFilter === cat
                                                ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105"
                                        )}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
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
            className="group cursor-pointer bg-card rounded-[2.5rem] overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
            style={{ animationDelay: `${index * 80}ms`, animationDuration: '800ms' }}
        >
            <div className="aspect-[16/10] relative overflow-hidden bg-muted rounded-t-[2.5rem]">
                <img
                    src={getImageUrl(campaign.image_url, "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800")}
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ objectPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/70" />
                <Badge className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border-white/20 text-white transition-all duration-500 group-hover:bg-primary group-hover:scale-110">
                    {campaign.category}
                </Badge>
                {/* Hover overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 opacity-0 group-hover:opacity-30 transition-opacity duration-700" />
            </div>

            <div className="p-8 space-y-6 relative rounded-b-[2.5rem]">
                {/* Animated background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-b-[2.5rem]" />

                <div className="relative z-10">
                    <h3 className="text-2xl font-bold font-display leading-tight mb-2 group-hover:text-primary transition-colors duration-500">
                        {campaign.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                        {campaign.description}
                    </p>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end text-sm">
                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Raised</span>
                            <p className="font-bold text-foreground text-lg transition-all duration-500 group-hover:text-primary group-hover:scale-110 origin-left">{formatCurrency(campaign.raised_amount)}</p>
                        </div>
                        <div className="text-right space-y-1">
                            <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Goal</span>
                            <p className="font-bold text-muted-foreground">{formatCurrency(campaign.goal_amount)}</p>
                        </div>
                    </div>

                    <div className="h-3 bg-muted rounded-full overflow-hidden p-[2px] relative">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary/40 group-hover:shadow-primary/60"
                            style={{
                                width: `${Math.min(100, progress)}%`,
                                backgroundSize: '200% 100%',
                                animation: 'shimmerBg 3s linear infinite'
                            }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 relative z-10">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-500 group-hover:gap-2">
                        <Target className="w-4 h-4 transition-transform duration-500 group-hover:rotate-12" />
                        <span>{Math.round(progress)}% Goal</span>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-xl group/btn hover:bg-primary/10 hover:text-primary transition-all duration-500 hover:scale-110">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-500 group-hover/btn:translate-x-2 group-hover/btn:scale-125" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
