import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, MapPin, Calendar, Users, ArrowRight, Play, Image as ImageIcon, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StoryViewerModal } from "@/components/impact/StoryViewerModal";

// API fetching
const fetchImpactStories = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/impact-stories`);
    if (!response.ok) throw new Error("Failed to fetch stories");
    const result = await response.json();
    return result.data;
};

export default function Impact() {
    const navigate = useNavigate();
    const [selectedStory, setSelectedStory] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: stories = [], isLoading } = useQuery({
        queryKey: ["impact-stories"],
        queryFn: fetchImpactStories,
    });

    const handleStoryClick = (story: any) => {
        setSelectedStory(story);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background overflow-x-hidden">
            {/* Navigation Header */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Button>
            </div>

            {/* Hero Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24">
                <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-accent/10 text-accent font-medium border-accent/20">
                        Voices of Transformation
                    </Badge>
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                        Real Stories, Real <span className="text-accent italic font-serif">Impact</span>
                    </h1>
                    <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
                        Witness the direct transformation your contributions bring to life. From local communities to individual families, every story is a testament to the power of collective action.
                    </p>
                </div>
            </section>

            {/* Stories Grid */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-3xl border border-border bg-card/50 overflow-hidden animate-pulse">
                                <div className="aspect-[4/5] bg-muted/50" />
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-muted/50 rounded-full w-24" />
                                    <div className="h-6 bg-muted/50 rounded-lg w-3/4" />
                                    <div className="h-4 bg-muted/50 rounded-full w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
                        {stories.map((story: any) => (
                            <ImpactStoryCard
                                key={story.id}
                                story={story}
                                onClick={() => handleStoryClick(story)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Story Viewer Modal */}
            {selectedStory && (
                <StoryViewerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    story={selectedStory}
                />
            )}
        </main>
    );
}

function ImpactStoryCard({ story, onClick }: { story: any; onClick: () => void }) {
    const mainMedia = story.media?.[0];

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer rounded-[2.5rem] overflow-hidden bg-card border border-border/50 hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-2"
        >
            {/* Image Container */}
            <div className="aspect-[4/5] relative overflow-hidden">
                <img
                    src={story.profile_image_url || "/placeholder-avatar.jpg"}
                    alt={story.beneficiary_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Media Type Badge */}
                <div className="absolute top-6 right-6 flex gap-2">
                    {story.media?.some((m: any) => m.media_type === "video") && (
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                            <Play className="w-5 h-5 fill-current" />
                        </div>
                    )}
                    {story.media?.length > 1 && (
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                    )}
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
                    <Badge className="bg-accent/90 text-white border-none backdrop-blur-sm mb-2">
                        {story.campaign_title || "Foundation Support"}
                    </Badge>
                    <h3 className="text-2xl sm:text-3xl font-bold font-display leading-tight group-hover:text-accent transition-colors duration-300">
                        {story.beneficiary_name}
                    </h3>
                    <div className="flex items-center gap-3 text-white/80 text-sm font-medium">
                        <MapPin className="w-4 h-4" />
                        <span>{story.location}</span>
                        <span className="w-1 h-1 rounded-full bg-white/40" />
                        <span>{story.beneficiary_age} years old</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 bg-card flex flex-col justify-between h-auto">
                <p className="text-muted-foreground line-clamp-2 text-base leading-relaxed mb-6">
                    {story.short_bio}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-accent" />
                            <span>{story.likes_count || 42}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span>{story.comments_count || 12}</span>
                        </div>
                    </div>
                    <button className="text-accent font-semibold flex items-center gap-2 group/btn text-sm sm:text-base">
                        Read Story
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
