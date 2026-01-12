import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Heart, MessageCircle, Share2, MapPin, Calendar, Play, Pause, Volume2, Maximize, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
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
            <DialogContent className="max-w-[1000px] w-[95vw] h-[90vh] p-0 overflow-hidden bg-card border-none shadow-2xl rounded-[1.5rem] sm:rounded-[2rem]">
                {/* macOS Style Bar */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-muted/50 backdrop-blur-sm flex items-center px-4 z-50 border-b border-border/40">
                    <div className="flex gap-2">
                        <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                        <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-muted-foreground truncate max-w-[50%]">
                        {story.title}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row h-full pt-10">
                    {/* Main Content Area (Media) */}
                    <div className="flex-1 bg-black relative flex items-center justify-center group/media">
                        {currentMedia?.media_type === "video" ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <video
                                    ref={videoRef}
                                    src={currentMedia.media_url}
                                    className="max-h-full max-w-full"
                                    onClick={handleTogglePlay}
                                    onEnded={() => setIsPlaying(false)}
                                />
                                {!isPlaying && (
                                    <button
                                        onClick={handleTogglePlay}
                                        className="absolute inset-0 flex items-center justify-center bg-black/20"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-100 hover:scale-110 transition-transform duration-300">
                                            <Play className="w-10 h-10 fill-current ml-1" />
                                        </div>
                                    </button>
                                )}

                                {/* Custom Controls */}
                                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover/media:opacity-100 transition-opacity duration-300">
                                    <div className="flex gap-4">
                                        <button onClick={handleTogglePlay} className="text-white hover:text-accent transition-colors">
                                            {isPlaying ? <Pause /> : <Play />}
                                        </button>
                                        <Volume2 className="text-white hover:text-accent transition-colors cursor-pointer" />
                                    </div>
                                    <Maximize className="text-white hover:text-accent transition-colors cursor-pointer" />
                                </div>
                            </div>
                        ) : (
                            <img
                                src={currentMedia?.media_url || story.profile_image_url}
                                className="max-h-full max-w-full object-contain"
                                alt="Story media"
                            />
                        )}

                        {/* Navigation Arrows */}
                        {media.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))}
                                    className="absolute left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/media:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setCurrentMediaIndex((prev) => (prev + 1) % media.length)}
                                    className="absolute right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/media:opacity-100 transition-opacity"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Sidebar Area (Story & Comments) */}
                    <div className="w-full md:w-[400px] flex flex-col bg-card border-l border-border/40 overflow-hidden">
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            {/* Story Details */}
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-accent/20">
                                        <img src={story.profile_image_url} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{story.beneficiary_name}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> {story.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold font-display leading-tight">{story.title}</h2>
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
                            <div className="px-6 py-4 flex items-center justify-between border-y border-border/40 bg-muted/20">
                                <div className="flex gap-6">
                                    <div className="flex flex-col items-center gap-1 group/stat cursor-pointer">
                                        <Heart className="w-5 h-5 text-accent hover:fill-current" />
                                        <span className="text-[11px] font-bold text-muted-foreground">42</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 group/stat cursor-pointer">
                                        <MessageCircle className="w-5 h-5 text-blue-500 hover:fill-current" />
                                        <span className="text-[11px] font-bold text-muted-foreground">12</span>
                                    </div>
                                </div>
                                <Share2 className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                            </div>

                            {/* Comment Section */}
                            <div className="flex-1">
                                <CommentSection storyId={story.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
