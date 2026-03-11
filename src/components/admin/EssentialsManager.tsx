import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Edit, Save, X, Package, Upload, GripVertical, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAuthStore } from '@/stores/authStore';
import { AdvancedFilters } from './AdvancedFilters';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface Item {
    id: string;
    name: string;
    description: string;
    image_url: string;
    unit_price: number;
    is_active: boolean;
    priority?: number;
}

export function EssentialsManager() {
    const { accessToken } = useAuthStore();
    const [items, setItems] = useState<Item[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        unit_price: '',
        image_url: '',
        is_active: true,
        priority: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, [filters]);

    const fetchItems = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                limit: '100',
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== undefined)
                ) as any
            });
            const res = await fetch(`${API_BASE}/items?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (data.success) {
                const sorted = (data.data || []).sort((a: Item, b: Item) =>
                    (b.priority || 0) - (a.priority || 0)
                );
                setItems(sorted);
            }
        } catch (error) {
            toast.error("Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: Item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            unit_price: item.unit_price.toString(),
            image_url: item.image_url || '',
            is_active: item.is_active,
            priority: item.priority?.toString() || '0'
        });
        setImagePreview(null);
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            unit_price: '',
            image_url: '',
            is_active: true,
            priority: ''
        });
        setImagePreview(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        if (!accessToken) return;
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formDataUpload,
            });

            if (response.ok) {
                const data = await response.json();
                setFormData({ ...formData, image_url: data.data.url });
                toast.success("Image uploaded successfully");
            } else {
                toast.error("Failed to upload image");
            }
        } catch (error) {
            toast.error("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            ...formData,
            unit_price: parseFloat(formData.unit_price),
            priority: formData.priority ? parseInt(formData.priority) : 0
        };

        try {
            const url = editingItem ? `${API_BASE}/items/${editingItem.id}` : `${API_BASE}/items`;
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingItem ? "Item updated" : "Item added");
                handleCancel();
                fetchItems();
            } else {
                toast.error("Action failed");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this item?")) return;
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE}/items/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                toast.success("Item removed");
                fetchItems();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const sortedItems = Array.from(items);
        const [reorderedItem] = sortedItems.splice(result.source.index, 1);
        sortedItems.splice(result.destination.index, 0, reorderedItem);

        // Calculate new priorities
        const updates = sortedItems.map((item, index) => ({
            id: item.id,
            priority: sortedItems.length - index
        }));

        setItems(sortedItems.map((item, index) => ({ ...item, priority: sortedItems.length - index })));

        try {
            const res = await fetch(`${API_BASE}/admin/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ items: updates, type: 'items' })
            });

            if (!res.ok) {
                toast.error("Failed to save new order");
                fetchItems();
            } else {
                toast.success("Order updated");
            }
        } catch (e) {
            toast.error("Failed to save order");
            fetchItems();
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 md:mb-16">
                <div className="text-center md:text-left max-w-2xl">
                    <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                        Logical Provisioning
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                        Essentials <span className="text-secondary">Boutique</span>
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                        Manage essential kits and items that donors can specifically fund for beneficiaries.
                    </p>
                </div>

                {!editingItem && !formData.name && (
                    <Button
                        onClick={() => {
                            setFormData({
                                name: 'New Item',
                                description: '',
                                unit_price: '',
                                image_url: '',
                                is_active: true,
                                priority: '0'
                            });
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="h-14 px-8 rounded-2xl bg-secondary text-white shadow-xl shadow-secondary/20 hover:shadow-secondary/30 transition-all font-bold gap-2"
                    >
                        <Plus className="w-5 h-5" /> Add Essential Item
                    </Button>
                )}
            </div>

            <AdvancedFilters
                onFilterChange={setFilters}
                searchPlaceholder="Search essential items..."
                statusOptions={[
                    { label: 'In Stock', value: 'true' },
                    { label: 'Out of Stock', value: 'false' },
                ]}
                showDateFilter={false}
                className="mb-8"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem]">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold font-display flex items-center gap-2">
                                {editingItem ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                                {editingItem ? 'Edit Provision' : 'New Provision'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Item Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Literacy Kit"
                                        className="h-12 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="space-y-2 flex-grow">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Price (USD)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.unit_price}
                                            onChange={e => setFormData({ ...formData, unit_price: e.target.value })}
                                            placeholder="25.00"
                                            className="h-12 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 flex-grow">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Priority</Label>
                                        <Input
                                            type="number"
                                            value={formData.priority}
                                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                            placeholder="0"
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Item Visual</Label>
                                    <div className="flex flex-col gap-4">
                                        {formData.image_url || imagePreview ? (
                                            <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-2 border-border group shadow-float">
                                                <img
                                                    src={imagePreview || getImageUrl(formData.image_url)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, image_url: '' });
                                                        setImagePreview(null);
                                                    }}
                                                    className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => document.getElementById('item-image-upload')?.click()}
                                                className="w-full aspect-square rounded-[2rem] border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer bg-muted/5 group"
                                            >
                                                <div className="p-5 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                                    <Upload className="w-8 h-8 text-primary/60" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold">Upload Product Image</p>
                                                    <p className="text-xs text-muted-foreground">PNG, JPG or WebP</p>
                                                </div>
                                            </div>
                                        )}
                                        <Input
                                            id="item-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        {uploading && (
                                            <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                                                <Activity className="w-4 h-4 animate-spin" />
                                                Uploading item image...
                                            </div>
                                        )}
                                        <Input
                                            value={formData.image_url}
                                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="Or paste image URL..."
                                            className="h-10 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Impact Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Explain the value..."
                                        className="rounded-2xl resize-none"
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {editingItem && (
                                        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 h-12 rounded-xl">
                                            <X className="w-4 h-4 mr-2" /> Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" className="flex-grow h-12 rounded-xl bg-primary shadow-lg shadow-primary/20" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin mr-2" /> : (editingItem ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                                        {editingItem ? 'Save Updates' : 'Add to Inventory'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                            ) : (
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableHead className="w-[50px] pl-8"></TableHead>
                                                <TableHead className="py-6 font-bold">Item</TableHead>
                                                <TableHead className="font-bold">Price</TableHead>
                                                <TableHead className="font-bold">Status</TableHead>
                                                <TableHead className="text-right pr-8 font-bold">Manage</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <Droppable droppableId="items">
                                            {(provided) => (
                                                <TableBody
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                >
                                                    {items.map((item, index) => (
                                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <TableRow
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={cn(
                                                                        "group border-border/40 transition-colors",
                                                                        snapshot.isDragging ? "bg-muted/50 shadow-lg" : "hover:bg-muted/30"
                                                                    )}
                                                                    style={provided.draggableProps.style}
                                                                >
                                                                    <TableCell className="pl-8">
                                                                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-2 rounded hover:bg-muted/50 w-fit">
                                                                            <GripVertical className="w-5 h-5 text-muted-foreground/50" />
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="py-6">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden shrink-0">
                                                                                <img
                                                                                    src={getImageUrl(item.image_url)}
                                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-bold leading-none mb-1">{item.name}</p>
                                                                                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="font-bold text-lg">${Number(item.unit_price).toFixed(2)}</TableCell>
                                                                    <TableCell>
                                                                        <Badge variant={item.is_active ? "default" : "secondary"} className={cn(
                                                                            "rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                                                            item.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-muted text-muted-foreground hover:bg-muted"
                                                                        )}>
                                                                            {item.is_active ? 'In Stock' : 'Inactive'}
                                                                        </Badge>
                                                                        <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                                                                            Pri: {item.priority || 0}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right pr-8 space-x-2">
                                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                    {items.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="h-64 text-center">
                                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                                    <Package className="w-10 h-10 opacity-20" />
                                                                    <p className="font-bold">Inventory is empty</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            )}
                                        </Droppable>
                                    </Table>
                                </DragDropContext>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
