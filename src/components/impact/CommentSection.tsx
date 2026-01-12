import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Reply, MoreHorizontal, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CommentSection({ storyId }: { storyId: string }) {
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState("");

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ["comments", storyId],
        queryFn: async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/impact-comments/story/${storyId}`);
            const result = await res.json();
            return result.data;
        },
    });

    const commentMutation = useMutation({
        mutationFn: async (text: string) => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/impact-comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ story_id: storyId, content: text }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", storyId] });
            setNewComment("");
            toast.success("Comment posted!");
        },
    });

    return (
        <div className="flex flex-col h-full bg-card/30">
            <div className="flex-1 p-6 space-y-8 min-h-[300px]">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    Discussion <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </h4>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />)}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">No conversations yet.</p>
                        <p className="text-xs text-muted-foreground/60">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment: any) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border/40 bg-muted/10 backdrop-blur-md">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Add an encouraging word..."
                        className="w-full bg-background border border-border/40 rounded-2xl px-5 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && newComment.trim() && commentMutation.mutate(newComment)}
                    />
                    <button
                        disabled={!newComment.trim() || commentMutation.isPending}
                        onClick={() => commentMutation.mutate(newComment)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function CommentItem({ comment, isReply = false }: { comment: any; isReply?: boolean }) {
    return (
        <div className={cn("space-y-4", isReply && "ml-12")}>
            <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border/40">
                    <img src={comment.user_avatar || "/placeholder-avatar.jpg"} className="w-full h-full object-cover" alt={comment.user_name} />
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground hover:text-accent cursor-pointer transition-colors">
                            {comment.user_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">2h ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {comment.content}
                    </p>
                    <div className="flex items-center gap-6 pt-2">
                        <button className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-accent transition-colors">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{comment.likes_count || 0}</span>
                        </button>
                        {!isReply && (
                            <button className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-blue-500 transition-colors">
                                <Reply className="w-3.5 h-3.5" />
                                <span>Reply</span>
                            </button>
                        )}
                        <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies?.map((reply: any) => (
                <CommentItem key={reply.id} comment={reply} isReply />
            ))}
        </div>
    );
}
