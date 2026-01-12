import { useState, useEffect } from 'react';
import { DynamicNavbar } from "@/components/layout/DynamicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag, Plus, Minus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Item {
    id: string;
    name: string;
    description: string;
    image_url: string;
    unit_price: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function EssentialsDonation() {
    const navigate = useNavigate();
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_BASE}/items?activeOnly=true`);
            const data = await res.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch items", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = (id: string, delta: number) => {
        setQuantities(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [id]: next };
        });
    };

    const totalAmount = items.reduce((sum, item) => {
        return sum + (item.unit_price * (quantities[item.id] || 0));
    }, 0);

    const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

    const handleDonate = async () => {
        if (totalAmount === 0) {
            toast.error("Please select at least one item to donate.");
            return;
        }

        setSubmitting(true);
        try {
            const selectedItems = Object.entries(quantities)
                .filter(([_, qty]) => qty > 0)
                .map(([itemId, quantity]) => ({ itemId, quantity }));

            const response = await fetch(`${API_BASE}/donations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('user_token') || ''}`
                },
                body: JSON.stringify({
                    amount: totalAmount,
                    currency: 'USD',
                    paymentMethod: 'stripe', // Mocking stripe for now
                    items: selectedItems,
                    // If user is guest, we might need to prompt for details, but assuming logged in or anonymous for now
                }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success("Thank you! Your donation has been initiated.");
                setQuantities({});
                // Redirect or show success modal
            } else {
                toast.error(data.message || "Donation failed");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <DynamicNavbar />

            <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
                <div className="mb-8">
                    <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                        Donate Essentials
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Directly fund specific items needed by women and girls in the Maasai Mara.
                        Your donation purchases these exact items for distribution.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-xl">
                        <p className="text-muted-foreground">No items currently available for donation.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                        {items.map((item) => (
                            <Card key={item.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
                                            <ShoppingBag className="h-12 w-12 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-primary shadow-sm">
                                        ${Number(item.unit_price).toFixed(2)}
                                    </div>
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl">{item.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                                </CardHeader>

                                <CardFooter className="mt-auto pt-0 border-t bg-muted/10 p-4">
                                    <div className="flex items-center justify-between w-full">
                                        <span className="font-medium text-muted-foreground">Quantity:</span>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                disabled={!quantities[item.id]}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center font-bold text-lg">
                                                {quantities[item.id] || 0}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Floating Checkout Bar */}
                {totalItems > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t shadow-lg z-50">
                        <div className="container mx-auto flex items-center justify-between max-w-4xl">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-bold text-foreground">{totalItems}</span> items selected
                                </div>
                                <div className="text-xl font-bold text-primary">
                                    Total: ${totalAmount.toFixed(2)}
                                </div>
                            </div>
                            <Button size="lg" onClick={handleDonate} disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                                    </>
                                ) : (
                                    "Complete Donation"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
