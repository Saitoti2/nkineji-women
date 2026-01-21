import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

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

    const { data: items = [], isLoading } = useQuery({
        queryKey: ['landing-essentials'],
        queryFn: fetchEssentials,
        staleTime: 5 * 60 * 1000,
    });

    if (items.length === 0 && !isLoading) return null;

    return (
        <section id="essentials" className="py-24 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>

            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-2xl">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/30 text-secondary-foreground text-sm font-medium mb-4">
                            Essentials Boutique
                        </span>
                        <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                            Shop for <span className="text-primary italic">Impact</span>
                        </h2>
                        <p className="text-muted-foreground text-lg mt-4 max-w-xl">
                            Purchase essential items that go directly to women and girls in the Mara. Tangible support, immediate difference.
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
                            className="group relative bg-card rounded-[2.5rem] overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                            onClick={() => navigate('/essentials')}
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="aspect-square relative overflow-hidden">
                                <img
                                    src={getImageUrl(item.image_url)}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md text-foreground font-bold px-4 py-2 rounded-full shadow-lg">
                                    ${item.unit_price}
                                </div>
                            </div>

                            <div className="p-8">
                                <h3 className="font-display text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-muted-foreground line-clamp-2 mb-6">
                                    {item.description}
                                </p>
                                <div className="flex items-center text-primary font-medium text-sm">
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    Give this item
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
