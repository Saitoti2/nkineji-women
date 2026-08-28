import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Share2 } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { useState } from "react";
import { ShareCard } from "@/components/ui/ShareCard";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface Item {
    id: string;
    name: string;
    description: string;
    image_url: string;
    unit_price: number;
}

const fetchEssentials = async (): Promise<Item[]> => {
    const res = await fetch(`${API_BASE}/items?activeOnly=true`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to fetch items');
    // Backend sorts by priority DESC, created_at DESC
    return data.data.slice(0, 3);
};

export function EssentialsSection() {
    const navigate = useNavigate();
    const [shareItem, setShareItem] = useState<Item | null>(null);

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['landing-essentials'],
        queryFn: fetchEssentials,
        staleTime: 5 * 60 * 1000,
    });

    if (items.length === 0 && !isLoading) return null;

    return (
        <section id="essentials" className="py-24 bg-background relative overflow-hidden">

            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-2xl">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-3">
                            Essentials Boutique
                        </span>
                        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                            Shop for <span className="text-primary italic">Impact</span>
                        </h2>
                        <p className="text-foreground/90 font-medium text-base sm:text-lg mt-3 max-w-xl">
                            Purchase essential items sent directly to women and girls in the Mara.
                        </p>
                    </div>
                    <Button onClick={() => navigate('/essentials')} variant="outline" className="hidden md:flex group">
                        View All Items <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((item, idx) => (
                        <div
                            key={item.id}
                            className="group relative bg-card rounded-[2.5rem] overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div
                                className="aspect-square relative overflow-hidden"
                                onClick={() => navigate('/essentials')}
                            >
                                <img
                                    src={getImageUrl(item.image_url)}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md text-foreground font-bold px-4 py-2 rounded-full border border-border/50">
                                    ${item.unit_price}
                                </div>
                            </div>

                            <div className="p-8">
                                <h3
                                    className="font-display text-2xl font-bold mb-3 group-hover:text-primary transition-colors cursor-pointer"
                                    onClick={() => navigate('/essentials')}
                                >
                                    {item.name}
                                </h3>
                                <p
                                    className="text-muted-foreground line-clamp-2 mb-6 cursor-pointer"
                                    onClick={() => navigate('/essentials')}
                                >
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div
                                        className="flex items-center text-primary font-medium text-sm cursor-pointer"
                                        onClick={() => navigate('/essentials')}
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Give this item
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShareItem(item);
                                        }}
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted/50"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {shareItem && (
                    <ShareCard
                        isOpen={!!shareItem}
                        onClose={() => setShareItem(null)}
                        data={{
                            type: "item",
                            id: shareItem.id,
                            title: shareItem.name,
                            description: shareItem.description,
                            image_url: shareItem.image_url,
                            meta: `$${shareItem.unit_price} per item`,
                            tags: ["#NkinejiWomen", "#Essentials", "#GiveDirectly"],
                        }}
                    />
                )}
            </div>
        </section>
    );
}
