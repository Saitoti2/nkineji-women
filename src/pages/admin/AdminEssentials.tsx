import { useState, useEffect } from 'react';
import { DynamicNavbar } from "@/components/layout/DynamicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Loader2, Trash2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface Item {
    id: string;
    name: string;
    description: string;
    image_url: string;
    unit_price: number;
    is_active: boolean;
}

export default function AdminEssentials() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        unit_price: '',
        image_url: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch(`${API_BASE}/items`);
            const data = await res.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (error) {
            toast.error("Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('user_token');
            const res = await fetch(`${API_BASE}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newItem,
                    unit_price: parseFloat(newItem.unit_price)
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Item created successfully");
                setNewItem({ name: '', description: '', unit_price: '', image_url: '' });
                fetchItems();
            } else {
                toast.error(data.message || "Failed to create item");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <DynamicNavbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Manage Essentials</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Form */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New Item</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Item Name</Label>
                                        <Input
                                            id="name"
                                            value={newItem.name}
                                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                            placeholder="e.g. Sanitary Pads Pack"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price (USD)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={newItem.unit_price}
                                            onChange={e => setNewItem({ ...newItem, unit_price: e.target.value })}
                                            placeholder="5.00"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="image">Image URL</Label>
                                        <Input
                                            id="image"
                                            value={newItem.image_url}
                                            onChange={e => setNewItem({ ...newItem, image_url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Description</Label>
                                        <Textarea
                                            id="desc"
                                            value={newItem.description}
                                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                            placeholder="Brief description..."
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        Add Item
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Existing Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Active</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell>${Number(item.unit_price).toFixed(2)}</TableCell>
                                                    <TableCell>{item.is_active ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
