import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Copy, Check, X,
    Twitter, Facebook, MessageCircle, Send, Link2, Mail
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";

export interface ShareCardData {
    type: "campaign" | "story" | "item";
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    /** e.g. "$50,000 goal" or "$25 per item" */
    meta?: string;
    /** e.g. "#FGM" or "#Education" */
    tags?: string[];
}

interface ShareCardProps {
    isOpen: boolean;
    onClose: () => void;
    data: ShareCardData;
}

function getShareUrl(data: ShareCardData) {
    const base = window.location.origin;
    if (data.type === "campaign") return `${base}/campaigns/${data.id}`;
    if (data.type === "story") return `${base}/impact/${data.id}`;
    return `${base}/essentials`;
}

function getShareText(data: ShareCardData) {
    if (data.type === "campaign")
        return `🌿 Support "${data.title}" — a campaign making real change in the Maasai Mara. ${data.meta ? `Goal: ${data.meta}.` : ""} Every contribution counts.`;
    if (data.type === "story")
        return `💛 "${data.title}" — a story of resilience and hope from the Maasai Mara. Read it and be inspired.`;
    return `🛍️ Give the gift of essentials — "${data.title}" for ${data.meta}. Directly supports women & girls in the Mara.`;
}

const platforms = [
    {
        id: "twitter",
        label: "X / Twitter",
        icon: Twitter,
        color: "bg-black hover:bg-zinc-800",
        getUrl: (text: string, url: string) =>
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
        id: "facebook",
        label: "Facebook",
        icon: Facebook,
        color: "bg-[#1877F2] hover:bg-[#166FE5]",
        getUrl: (_: string, url: string) =>
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
        id: "whatsapp",
        label: "WhatsApp",
        icon: MessageCircle,
        color: "bg-[#25D366] hover:bg-[#1ebe57]",
        getUrl: (text: string, url: string) =>
            `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
    },
    {
        id: "telegram",
        label: "Telegram",
        icon: Send,
        color: "bg-[#0088cc] hover:bg-[#0077b3]",
        getUrl: (text: string, url: string) =>
            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
    {
        id: "email",
        label: "Email",
        icon: Mail,
        color: "bg-muted hover:bg-muted/80 text-foreground",
        getUrl: (text: string, url: string) =>
            `mailto:?subject=${encodeURIComponent(`Check this out: ${text.slice(0, 60)}`)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
    },
];

export function ShareCard({ isOpen, onClose, data }: ShareCardProps) {
    const [copied, setCopied] = useState(false);
    const url = getShareUrl(data);
    const text = getShareText(data);
    const imageUrl = getImageUrl(data.image_url);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error("Could not copy link");
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: data.title, text, url });
            } catch {
                /* user dismissed */
            }
        } else {
            handleCopy();
        }
    };

    const handlePlatformShare = (platform: typeof platforms[0]) => {
        const shareUrl = platform.getUrl(text, url);
        window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    };

    const typeLabel =
        data.type === "campaign" ? "Campaign" : data.type === "story" ? "Story" : "Item";

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="bottom"
                className="rounded-t-[2rem] p-0 border-none max-h-[92dvh] overflow-y-auto bg-card/98 backdrop-blur-xl shadow-2xl"
            >
                <SheetTitle className="sr-only">Share {typeLabel}</SheetTitle>
                <SheetDescription className="sr-only">
                    Share this {typeLabel.toLowerCase()} on social media or copy the link.
                </SheetDescription>

                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1.5 rounded-full bg-muted-foreground/20" />
                </div>

                <div className="px-5 pb-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-lg">Share this {typeLabel}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-muted/60 transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Social Preview Card */}
                    <div className="rounded-2xl overflow-hidden border border-border/50 shadow-float bg-card">
                        {/* Image */}
                        {imageUrl && (
                            <div className="w-full aspect-[1200/630] relative overflow-hidden bg-muted">
                                <img
                                    src={imageUrl}
                                    alt={data.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {/* OG overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                {/* Type badge & Brand Logo */}
                                <div className="absolute top-3 left-3 flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/90 text-white backdrop-blur-sm">
                                        {typeLabel}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3 flex items-center bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-black/10 shadow-sm">
                                    <img src="/logo-light.png" alt="Nkineji" className="w-5 h-5 object-contain" />
                                    <span className="text-[10px] font-bold text-foreground ml-1.5">Nkineji</span>
                                </div>
                                {/* Title overlay */}
                                <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-white font-display font-bold text-base sm:text-lg leading-tight line-clamp-2 drop-shadow">
                                        {data.title}
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* Card body */}
                        <div className="p-4 space-y-1.5">
                            {!imageUrl && (
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-display font-bold text-base leading-tight line-clamp-2">
                                        {data.title}
                                    </p>
                                    <img src="/logo-light.png" alt="Logo" className="w-6 h-6 object-contain shrink-0" />
                                </div>
                            )}
                            {data.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {data.description}
                                </p>
                            )}
                            <div className="flex items-center justify-between pt-1">
                                {data.meta && (
                                    <span className="text-xs font-bold text-primary">{data.meta}</span>
                                )}
                                <div className="flex items-center gap-1.5 ml-auto">
                                    <img src="/logo-light.png" alt="Logo" className="w-3.5 h-3.5 object-contain" />
                                    <span className="text-[10px] text-muted-foreground/80 font-semibold">
                                        nkinejiwomen.com
                                    </span>
                                </div>
                            </div>
                            {data.tags && data.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {data.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] font-semibold text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Platform Buttons */}
                    <div className="grid grid-cols-5 gap-2">
                        {platforms.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => handlePlatformShare(p)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-95 ${p.color} text-white`}
                            >
                                <p.icon className="w-5 h-5" />
                                <span className="text-[9px] font-bold leading-none">{p.label.split(" ")[0]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Copy Link */}
                    <div className="flex items-center gap-2 bg-muted/40 rounded-2xl px-4 py-3 border border-border/40">
                        <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground truncate flex-1 font-mono">{url}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className={`shrink-0 rounded-xl h-8 px-3 transition-all ${copied ? "text-green-600 bg-green-50" : "hover:bg-muted"}`}
                        >
                            {copied ? (
                                <><Check className="w-3.5 h-3.5 mr-1" /> Copied</>
                            ) : (
                                <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>
                            )}
                        </Button>
                    </div>

                    {/* Native Share (mobile) */}
                    {typeof navigator !== "undefined" && "share" in navigator && (
                        <Button
                            variant="outline"
                            className="w-full rounded-2xl h-12 font-bold border-border/50"
                            onClick={handleNativeShare}
                        >
                            <Link2 className="w-4 h-4 mr-2" />
                            Share via…
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
