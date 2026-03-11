import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { Heart, Reply, MoreHorizontal, Send, Trash2, Edit2, X, Check } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getVisitorId() {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("visitor_id", id);
    }
    return id;
}

export function CommentSection({ storyId }: { storyId: string }) {
    const queryClient = useQueryClient();
    const { user, accessToken } = useAuthStore();
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [visitorId, setVisitorId] = useState<string>("");

    useEffect(() => {
        setVisitorId(getVisitorId());
    }, []);

    const API_BASE = import.meta.env.VITE_API_URL; // Define API_BASE as it's used in the instruction snippet

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ['story-comments', storyId],
        queryFn: async () => {
            const visitorId = getVisitorId();
            const url = new URL(`${API_BASE}/impact-comments/story/${storyId}`);
            if (user?.id) url.searchParams.append('userId', user.id);
            else url.searchParams.append('visitor_id', visitorId);

            const res = await fetch(url.toString());
            const data = await res.json();
            return data.data || [];
        }
    });

    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const addCommentMutation = useMutation({
        mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
            const visitorId = getVisitorId();
            const res = await fetch(`${API_BASE}/impact-comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : { 'x-visitor-id': visitorId })
                },
                body: JSON.stringify({
                    story_id: storyId,
                    parent_comment_id: parentId,
                    content,
                    user_name: user?.name || undefined, // Backend will use req.user.name if token is present
                    visitor_id: user ? null : visitorId
                })
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['story-comments', storyId] });
            setNewComment("");
            setReplyingTo(null); // Changed from setReplyTo to setReplyingTo for consistency
            toast.success("Comment posted!");
            // Only scroll to bottom if it's a new root comment
            if (!replyingTo) {
                setTimeout(() => {
                    const container = document.getElementById("comments-container");
                    if (container) container.scrollTop = container.scrollHeight;
                }, 100);
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const visitorId = getVisitorId();
            await fetch(`${API_BASE}/impact-comments/${commentId}?visitor_id=${user ? '' : visitorId}`, {
                method: "DELETE",
                headers: {
                    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['story-comments', storyId] });
            toast.success("Comment deleted");
        },
    });

    const editMutation = useMutation({
        mutationFn: async ({ id, text }: { id: string; text: string }) => {
            const visitorId = getVisitorId();
            await fetch(`${API_BASE}/impact-comments/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
                },
                body: JSON.stringify({ content: text, visitor_id: user ? null : visitorId }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['story-comments', storyId] });
            setEditingId(null);
            toast.success("Comment updated");
        },
    });

    const reactionMutation = useMutation({
        mutationFn: async ({ commentId, type }: { commentId: string; type: string }) => {
            const visitorId = getVisitorId();
            await fetch(`${API_BASE}/impact-comments/${commentId}/react`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : { "x-visitor-id": visitorId })
                },
                body: JSON.stringify({ reaction_type: type, visitor_id: user ? null : visitorId }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['story-comments', storyId] });
        }
    });

    return (
        <div className="flex flex-col bg-card/30 relative min-h-[300px]">
            <div id="comments-container" className="flex-1 p-6 space-y-8 pb-24">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    Discussion <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </h4>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />)}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-12 text-center space-y-2 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
                        <p className="text-sm font-medium text-muted-foreground">No conversations yet.</p>
                        <p className="text-xs text-muted-foreground/60">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment: any) => (
                            <div key={comment.id} className="group">
                                {editingId === comment.id ? (
                                    <div className="flex gap-2 items-start">
                                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-muted" />
                                        <div className="flex-1 space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full bg-background border border-accent/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => editMutation.mutate({ id: comment.id, text: editContent })} disabled={editMutation.isPending}>
                                                    Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <CommentItem
                                        comment={comment}
                                        visitorId={visitorId}
                                        onDelete={() => deleteMutation.mutate(comment.id)}
                                        onEdit={() => {
                                            setEditingId(comment.id);
                                            setEditContent(comment.content);
                                        }}
                                        onReply={(id) => setReplyingTo(id)}
                                        replyingTo={replyingTo}
                                        onCancelReply={() => setReplyingTo(null)}
                                        onSubmitReply={(content, parentId) => addCommentMutation.mutate({ content, parentId })}
                                        onReact={(id, type) => reactionMutation.mutate({ commentId: id, type })}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Input Area (Main) */}
            <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-background/80 backdrop-blur-md z-20">
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Add an encouraging word..."
                        className="w-full bg-background border border-border/40 rounded-2xl px-5 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all shadow-sm"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && newComment.trim() && addCommentMutation.mutate({ content: newComment })}
                    />
                    <button
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                        onClick={() => addCommentMutation.mutate({ content: newComment })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50 disabled:hover:shadow-none"
                    >
                        {addCommentMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CommentItem({
    comment,
    isReply = false,
    visitorId,
    onDelete,
    onEdit,
    onReply,
    replyingTo,
    onCancelReply,
    onSubmitReply,
    onReact
}: {
    comment: any;
    isReply?: boolean;
    visitorId: string;
    onDelete: () => void;
    onEdit: () => void;
    onReply: (id: string) => void;
    replyingTo: string | null;
    onCancelReply: () => void;
    onSubmitReply: (text: string, parentId: string) => void;
    onReact: (id: string, type: string) => void;
}) {
    const { user } = useAuthStore();
    // Check ownership: Either current visitor ID matches or current user ID matches
    const isOwner = (comment.visitor_id && comment.visitor_id === visitorId) || (user?.id && comment.user_id === user.id);
    const [replyText, setReplyText] = useState("");
    const isReplying = replyingTo === comment.id;

    const hasLiked = comment.user_reaction === 'like';

    return (
        <div className={cn("space-y-4", isReply && "ml-8 md:ml-12 border-l-2 border-border/50 pl-4")}>
            <div className="flex gap-3 md:gap-4 group">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 border border-border/40">
                    <img src={getImageUrl(comment.user_avatar, "/placeholder-avatar.jpg")} className="w-full h-full object-cover" alt={comment.user_name} />
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground hover:text-accent cursor-pointer transition-colors">
                            {comment.user_name}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-medium">Recently</span>
                            {isOwner && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={onEdit}>
                                            <Edit2 className="w-3 h-3 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                                            <Trash2 className="w-3 h-3 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </p>
                    <div className="flex items-center gap-4 md:gap-6 pt-2">
                        <button
                            onClick={() => onReact(comment.id, 'like')}
                            className={cn(
                                "flex items-center gap-1.5 text-[11px] font-bold transition-colors",
                                hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                            )}
                        >
                            <Heart className={cn("w-3.5 h-3.5", hasLiked && "fill-current")} />
                            <span>{comment.likes_count || 0}</span>
                        </button>

                        <button
                            onClick={() => onReply(comment.id)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-blue-500 transition-colors"
                        >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Reply</span>
                        </button>
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
                            <input
                                type="text"
                                autoFocus
                                placeholder={`Reply to ${comment.user_name}...`}
                                className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && replyText.trim()) {
                                        onSubmitReply(replyText, comment.id);
                                        setReplyText("");
                                    }
                                }}
                            />
                            <Button size="sm" onClick={() => {
                                onSubmitReply(replyText, comment.id);
                                setReplyText("");
                            }} disabled={!replyText.trim()}>Reply</Button>
                            <Button size="icon" variant="ghost" onClick={onCancelReply}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies?.map((reply: any) => (
                <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply
                    visitorId={visitorId}
                    onDelete={() => { }} // Usually we don't allow deleting others' replies unless owner, but simplification for now
                    onEdit={() => { }}
                    onReply={onReply}
                    replyingTo={replyingTo}
                    onCancelReply={onCancelReply}
                    onSubmitReply={onSubmitReply}
                    onReact={onReact}
                />
            ))}
        </div>
    );
}
