import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { Heart, Reply, MoreHorizontal, Send, Trash2, Edit2, X } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_BASE = import.meta.env.VITE_API_URL;

// ─── Visitor identity stored in localStorage ────────────────────────────────

function getVisitorId() {
    let id = localStorage.getItem("visitor_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("visitor_id", id);
    }
    return id;
}

interface VisitorIdentity {
    name: string;
    avatar: string;  // Google photo URL (proxied via Cloudinary if available)
    googleId?: string;
}

function getVisitorIdentity(): VisitorIdentity | null {
    const raw = localStorage.getItem("visitor_identity");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

function setVisitorIdentity(identity: VisitorIdentity) {
    localStorage.setItem("visitor_identity", JSON.stringify(identity));
}

// Proxy Google avatar through Cloudinary for performance & reliability
function cloudinaryProxyAvatar(googlePhotoUrl: string): string {
    if (!googlePhotoUrl) return "";
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return googlePhotoUrl;
    // Use Cloudinary fetch to proxy the external URL, with a 64px crop for avatars
    const encoded = encodeURIComponent(googlePhotoUrl);
    return `https://res.cloudinary.com/${cloudName}/image/fetch/c_fill,w_64,h_64,q_auto,f_auto/${encoded}`;
}

// ─── Google identity prompt (lightweight, not full login) ───────────────────

function useGoogleIdentity(onIdentityReady: (identity: VisitorIdentity) => void) {
    const resolveRef = useRef<((identity: VisitorIdentity | null) => void) | null>(null);

    useEffect(() => {
        if ((window as any).google) return;
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        document.head.appendChild(script);
    }, []);

    const promptGoogleIdentity = () => {
        return new Promise<VisitorIdentity | null>((resolve) => {
            resolveRef.current = resolve;

            const clientId = GOOGLE_CLIENT_ID;
            if (!clientId || !(window as any).google?.accounts?.oauth2) {
                resolve(null);
                return;
            }

            const client = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: "openid email profile",
                callback: async (tokenResponse: any) => {
                    if (!tokenResponse.access_token) {
                        resolve(null);
                        return;
                    }
                    try {
                        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                        });
                        const info = await res.json();
                        const identity: VisitorIdentity = {
                            name: info.name || info.given_name || "Visitor",
                            avatar: cloudinaryProxyAvatar(info.picture || ""),
                            googleId: info.sub,
                        };
                        setVisitorIdentity(identity);
                        onIdentityReady(identity);
                        resolve(identity);
                    } catch {
                        resolve(null);
                    }
                },
                error_callback: () => resolve(null),
            });

            client.requestAccessToken({ prompt: "select_account" });
        });
    };

    return { promptGoogleIdentity };
}

// ─── Google identity banner shown above input ────────────────────────────────

function IdentityBanner({
    identity,
    onChangeIdentity,
}: {
    identity: VisitorIdentity;
    onChangeIdentity: () => void;
}) {
    return (
        <div className="flex items-center gap-2 px-5 pt-3 pb-1">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-border/40 shrink-0">
                <img
                    src={identity.avatar || "/placeholder-avatar.jpg"}
                    alt={identity.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg"; }}
                />
            </div>
            <span className="text-xs text-muted-foreground">
                Commenting as <span className="font-semibold text-foreground">{identity.name}</span>
            </span>
            <button
                onClick={onChangeIdentity}
                className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
                Change
            </button>
        </div>
    );
}

// ─── Main CommentSection ─────────────────────────────────────────────────────

export function CommentSection({ storyId }: { storyId: string }) {
    const queryClient = useQueryClient();
    const { user, accessToken } = useAuthStore();
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [visitorId] = useState(() => getVisitorId());
    const [visitorIdentity, setVisitorIdentityState] = useState<VisitorIdentity | null>(
        () => getVisitorIdentity()
    );
    const [isGettingIdentity, setIsGettingIdentity] = useState(false);

    const { promptGoogleIdentity } = useGoogleIdentity((identity) => {
        setVisitorIdentityState(identity);
    });

    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const { data: comments = [], isLoading } = useQuery({
        queryKey: ["story-comments", storyId],
        queryFn: async () => {
            const url = new URL(`${API_BASE}/impact-comments/story/${storyId}`);
            if (user?.id) url.searchParams.append("userId", user.id);
            else url.searchParams.append("visitor_id", visitorId);
            const res = await fetch(url.toString());
            const data = await res.json();
            return data.data || [];
        },
    });

    // Resolve commenter name + avatar (logged-in user wins, then visitor identity, then anonymous)
    const commenterName = user?.name || visitorIdentity?.name || undefined;
    const commenterAvatar = user?.avatar || visitorIdentity?.avatar || undefined;

    const handleInputFocus = async () => {
        // If already identified or logged in, skip
        if (user || visitorIdentity || isGettingIdentity) return;
        // Non-blocking: prompt in background so they can still type
        setIsGettingIdentity(true);
        try {
            await promptGoogleIdentity();
        } finally {
            setIsGettingIdentity(false);
        }
    };

    const handleChangeIdentity = async () => {
        setIsGettingIdentity(true);
        try {
            await promptGoogleIdentity();
        } finally {
            setIsGettingIdentity(false);
        }
    };

    const addCommentMutation = useMutation({
        mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
            const res = await fetch(`${API_BASE}/impact-comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken
                        ? { Authorization: `Bearer ${accessToken}` }
                        : { "x-visitor-id": visitorId }),
                },
                body: JSON.stringify({
                    story_id: storyId,
                    parent_comment_id: parentId,
                    content,
                    user_name: commenterName,
                    user_avatar: commenterAvatar,
                    visitor_id: user ? null : visitorId,
                }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["story-comments", storyId] });
            setNewComment("");
            setReplyingTo(null);
            toast.success("Comment posted!");
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
            await fetch(
                `${API_BASE}/impact-comments/${commentId}?visitor_id=${user ? "" : visitorId}`,
                {
                    method: "DELETE",
                    headers: {
                        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    },
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["story-comments", storyId] });
            toast.success("Comment deleted");
        },
    });

    const editMutation = useMutation({
        mutationFn: async ({ id, text }: { id: string; text: string }) => {
            await fetch(`${API_BASE}/impact-comments/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
                body: JSON.stringify({ content: text, visitor_id: user ? null : visitorId }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["story-comments", storyId] });
            setEditingId(null);
            toast.success("Comment updated");
        },
    });

    const reactionMutation = useMutation({
        mutationFn: async ({ commentId, type }: { commentId: string; type: string }) => {
            await fetch(`${API_BASE}/impact-comments/${commentId}/react`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken
                        ? { Authorization: `Bearer ${accessToken}` }
                        : { "x-visitor-id": visitorId }),
                },
                body: JSON.stringify({ reaction_type: type, visitor_id: user ? null : visitorId }),
            });
        },
        onMutate: async ({ commentId, type }) => {
            // Optimistic update for instant UI feedback
            await queryClient.cancelQueries({ queryKey: ["story-comments", storyId] });
            const prev = queryClient.getQueryData(["story-comments", storyId]);

            queryClient.setQueryData(["story-comments", storyId], (old: any[]) => {
                return (old || []).map((c: any) => {
                    if (c.id !== commentId) return c;
                    const hasLiked = c.user_reaction === type;
                    return {
                        ...c,
                        user_reaction: hasLiked ? null : type,
                        likes_count: hasLiked
                            ? Math.max(0, Number(c.likes_count) - 1)
                            : Number(c.likes_count) + 1,
                    };
                });
            });

            return { prev };
        },
        onError: (_err, _vars, context: any) => {
            queryClient.setQueryData(["story-comments", storyId], context?.prev);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["story-comments", storyId] });
        },
    });

    return (
        <div className="flex flex-col bg-card/30 relative min-h-[300px]">
            <div id="comments-container" className="flex-1 p-6 space-y-8 pb-24">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    Discussion <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </h4>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-muted/50 rounded-2xl animate-pulse" />
                        ))}
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
                                                <Button
                                                    size="sm"
                                                    onClick={() => editMutation.mutate({ id: comment.id, text: editContent })}
                                                    disabled={editMutation.isPending}
                                                >
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
                                        onSubmitReply={(content, parentId) =>
                                            addCommentMutation.mutate({ content, parentId })
                                        }
                                        onReact={(id, type) =>
                                            reactionMutation.mutate({ commentId: id, type })
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Commenter identity banner */}
            {(visitorIdentity || user) && (
                <IdentityBanner
                    identity={
                        user
                            ? { name: user.name || user.email, avatar: user.avatar || "" }
                            : visitorIdentity!
                    }
                    onChangeIdentity={handleChangeIdentity}
                />
            )}

            {/* Input Area */}
            <div className="sticky bottom-0 left-0 right-0 px-4 pb-4 pt-2 border-t border-border/40 bg-background/80 backdrop-blur-md z-20">
                {/* Google prompt hint for anonymous visitors */}
                {!user && !visitorIdentity && (
                    <p className="text-[11px] text-muted-foreground mb-2 px-1">
                        <button
                            onClick={handleChangeIdentity}
                            className="text-accent hover:underline font-medium"
                        >
                            Sign in with Google
                        </button>{" "}
                        to show your name & photo, or comment anonymously.
                    </p>
                )}

                <div className="relative flex items-center gap-2">
                    {/* Avatar preview next to input */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border/40 shrink-0 bg-muted">
                        <img
                            src={
                                user?.avatar ||
                                visitorIdentity?.avatar ||
                                "/placeholder-avatar.jpg"
                            }
                            alt="You"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg";
                            }}
                        />
                    </div>

                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Add an encouraging word..."
                            className="w-full bg-background border border-border/40 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all shadow-sm"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onFocus={handleInputFocus}
                            onKeyDown={(e) =>
                                e.key === "Enter" &&
                                newComment.trim() &&
                                addCommentMutation.mutate({ content: newComment })
                            }
                        />
                        <button
                            disabled={!newComment.trim() || addCommentMutation.isPending}
                            onClick={() => addCommentMutation.mutate({ content: newComment })}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center hover:shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50 disabled:hover:shadow-none"
                        >
                            {addCommentMutation.isPending ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── CommentItem ─────────────────────────────────────────────────────────────

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
    onReact,
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
    const isOwner =
        (comment.visitor_id && comment.visitor_id === visitorId) ||
        (user?.id && comment.user_id === user.id);
    const [replyText, setReplyText] = useState("");
    const isReplying = replyingTo === comment.id;
    const hasLiked = comment.user_reaction === "like";

    // Relative time
    const timeAgo = (dateStr: string) => {
        if (!dateStr) return "Recently";
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className={cn("space-y-4", isReply && "ml-8 md:ml-12 border-l-2 border-border/50 pl-4")}>
            <div className="flex gap-3 md:gap-4 group">
                {/* Avatar */}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 border border-border/40 bg-muted">
                    <img
                        src={comment.user_avatar || "/placeholder-avatar.jpg"}
                        className="w-full h-full object-cover"
                        alt={comment.user_name}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-avatar.jpg";
                        }}
                    />
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground hover:text-accent cursor-pointer transition-colors">
                            {comment.user_name || "Visitor"}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-medium">
                                {timeAgo(comment.created_at)}
                            </span>
                            {isOwner && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={onEdit}>
                                            <Edit2 className="w-3 h-3 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={onDelete}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="w-3 h-3 mr-2" /> Delete
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
                            onClick={() => onReact(comment.id, "like")}
                            className={cn(
                                "flex items-center gap-1.5 text-[11px] font-bold transition-colors",
                                hasLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                            )}
                        >
                            <Heart className={cn("w-3.5 h-3.5", hasLiked && "fill-current")} />
                            <span>{Number(comment.likes_count) || 0}</span>
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
                            <Button
                                size="sm"
                                onClick={() => {
                                    onSubmitReply(replyText, comment.id);
                                    setReplyText("");
                                }}
                                disabled={!replyText.trim()}
                            >
                                Reply
                            </Button>
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
                    onDelete={() => {}}
                    onEdit={() => {}}
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
