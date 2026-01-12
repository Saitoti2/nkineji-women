import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, Heart, MessageCircle, Share2, MapPin, Calendar, Play, Pause, Volume2, Maximize, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "./CommentSection";

export function StoryViewerModal({ isOpen, onClose, story }: any) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const media = story.media || [];
    const currentMedia = media[currentMediaIndex];

    const handleTogglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[1000px] w-[95vw] sm:w-full h-[85dvh] sm:h-[90vh] p-0 overflow-hidden bg-card border-none shadow-2xl rounded-2xl sm:rounded-[2rem] flex flex-col">
                <DialogTitle className="sr-only">{story?.title || "Story Details"}</DialogTitle>
                <DialogDescription className="sr-only">
                    Read the impact story about {story?.beneficiary_name} and join the discussion.
                </DialogDescription>
                {/* macOS Style Bar (Hidden on mobile for more space, or kept small) */}
                <div className="flex-none h-12 sm:h-10 bg-muted/50 backdrop-blur-sm flex items-center px-4 z-50 border-b border-border/40 relative">
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

                    <div className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-muted-foreground truncate max-w-[60%] sm:max-w-[50%]">
                        {story.title}
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                    {/* Main Content Area (Media) - Scrollable on mobile with content, or fixed? 
                        On mobile: Media at top, content below. Entire thing scrolls? Or split view?
                        Better UX for mobile story: Media fixed at top (or 40%), bottom scrolls. 
                        OR: Integrated scroll. Let's try responsive layout.
                    */}
                    <div className="w-full md:flex-1 h-[35vh] md:h-full bg-black relative flex items-center justify-center group/media flex-none md:flex-auto">
                        {currentMedia?.media_type === "video" ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                <video
                                    ref={videoRef}
                                    src={getImageUrl(currentMedia.media_url)}
                                    // Keep videos contained so we don't cut off content
                                    className="w-full h-full object-contain"
                                    onClick={handleTogglePlay}
                                    onEnded={() => setIsPlaying(false)}
                                    playsInline
                                />
                                {!isPlaying && (
                                    <button
                                        onClick={handleTogglePlay}
                                        className="absolute inset-0 flex items-center justify-center bg-black/20"
                                    >
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-100 hover:scale-110 transition-transform duration-300">
                                            <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <img
                                src={getImageUrl(currentMedia?.media_url || story.profile_image_url)}
                                className="w-full h-full object-cover bg-black/20"
                                alt="Story media"
                            />
                        )}

                        {/* Navigation Arrows */}
                        {media.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))}
                                    className="absolute left-2 md:left-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-100 md:opacity-0 md:group-hover/media:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                                <button
                                    onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % media.length)}
                                    className="absolute right-2 md:right-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-100 md:opacity-0 md:group-hover/media:opacity-100 transition-opacity"
                                >
                                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Sidebar Area (Story & Comments) */}
                    <div className="flex-1 md:w-[400px] md:flex-none flex flex-col bg-card md:border-l border-border/40 min-h-0 relative z-10 w-full">
                        <div className="flex-1 overflow-y-auto scroll-smooth pb-0">
                            {/* Story Details */}
                            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-accent/20 flex-shrink-0">
                                        <img src={getImageUrl(story.profile_image_url)} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base md:text-lg">{story.beneficiary_name}</h3>
                                        <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> {story.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    <h2 className="text-lg md:text-xl font-bold font-display leading-tight">{story.title}</h2>
                                    <div className="prose prose-sm dark:prose-invert text-muted-foreground whitespace-pre-wrap">
                                        {story.content}
                                    </div>
                                </div>

                                {story.impact_summary && (
                                    <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 space-y-2">
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full">
                                            Impact Summary
                                        </span>
                                        <p className="text-sm font-medium italic text-foreground/90">
                                            "{story.impact_summary}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Interaction Stats */}
                            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-y border-border/40 bg-muted/20 sticky top-0 md:static z-10 backdrop-blur-md md:backdrop-filter-none">
                                <div className="flex gap-6">
                                    <div className="flex flex-col items-center gap-1 group/stat cursor-pointer">
                                        <Heart className="w-4 h-4 md:w-5 md:h-5 text-accent hover:fill-current" />
                                        <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground">42</span>
                                    </div>
                                    <div
                                        className="flex flex-col items-center gap-1 group/stat cursor-pointer"
                                        onClick={() => document.getElementById('comment-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500 hover:fill-current transition-transform group-hover/stat:scale-110" />
                                        <span className="text-[10px] md:text-[11px] font-bold text-muted-foreground">
                                            {story.comments_count || 12}
                                        </span>
                                    </div>
                                </div>
                                <Share2 className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                            </div>

                            {/* Comment Section */}
                            <div id="comment-section" className="flex-1 bg-card/30">
                                <CommentSection storyId={story.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
