import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Edit, Save, X, Megaphone, Upload, Activity, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface Campaign {
    id: string;
    title: string;
    description: string;
    goalAmount: number;
    currentAmount: number;
    startDate?: string;
    endDate?: string;
    earmark?: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    image_url?: string;
    category?: string;
}

export function CampaignsManager() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goalAmount: '',
        startDate: '',
        endDate: '',
        earmark: '',
        status: 'draft' as 'draft' | 'active' | 'paused' | 'completed',
        image_url: '',
        category: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const res = await fetch(`${API_BASE}/admin/campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCampaigns(data.data || []);
            }
        } catch (error) {
            toast.error("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            title: campaign.title,
            description: campaign.description || '',
            goalAmount: campaign.goalAmount.toString(),
            startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '',
            endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
            earmark: campaign.earmark || '',
            status: campaign.status,
            image_url: campaign.image_url || '',
            category: campaign.category || '',
        });
        setImagePreview(null);
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingCampaign(null);
        setFormData({
            title: '',
            description: '',
            goalAmount: '',
            startDate: '',
            endDate: '',
            earmark: '',
            status: 'draft',
            image_url: '',
            category: '',
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

        const token = localStorage.getItem('mara_bloom_auth_token');
        if (!token) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const response = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
            title: formData.title,
            description: formData.description,
            goalAmount: parseFloat(formData.goalAmount),
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            earmark: formData.earmark || undefined,
            status: formData.status,
            image_url: formData.image_url || undefined,
            category: formData.category || undefined,
        };

        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const url = editingCampaign ? `${API_BASE}/campaigns/${editingCampaign.id}` : `${API_BASE}/campaigns`;
            const method = editingCampaign ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingCampaign ? "Campaign updated" : "Campaign created");
                handleCancel();
                fetchCampaigns();
            } else {
                const data = await res.json();
                toast.error(data.error || "Action failed");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this campaign?")) return;
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const res = await fetch(`${API_BASE}/campaigns/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Campaign deleted");
                fetchCampaigns();
            } else {
                toast.error("Failed to delete campaign");
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-display">Campaign Command</h1>
                <Badge variant="outline" className="text-primary border-primary rounded-lg px-4 py-1">
                    {campaigns.length} Initiatives
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem]">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold font-display flex items-center gap-2">
                                {editingCampaign ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                                {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Water for Life"
                                        className="h-12 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the campaign..."
                                        className="rounded-2xl resize-none"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Goal ($)</Label>
                                        <Input
                                            type="number"
                                            value={formData.goalAmount}
                                            onChange={e => setFormData({ ...formData, goalAmount: e.target.value })}
                                            className="h-12 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="paused">Paused</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">End Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cover Image</Label>
                                    <div className="flex flex-col gap-4">
                                        {formData.image_url || imagePreview ? (
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border group shadow-float">
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
                                                    className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => document.getElementById('campaign-image-upload')?.click()}
                                                className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/5 group"
                                            >
                                                <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                                    <Upload className="w-6 h-6 text-primary/60" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium">Upload Cover Image</p>
                                                    <p className="text-xs text-muted-foreground">PNG, JPG or WebP</p>
                                                </div>
                                            </div>
                                        )}
                                        <Input
                                            id="campaign-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                        {uploading && (
                                            <div className="flex items-center gap-2 text-sm text-primary animate-pulse">
                                                <Activity className="w-4 h-4 animate-spin" />
                                                Uploading image...
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                                        <Input
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="e.g. Health"
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Earmark</Label>
                                        <Input
                                            value={formData.earmark}
                                            onChange={e => setFormData({ ...formData, earmark: e.target.value })}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    {editingCampaign && (
                                        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 h-12 rounded-xl">
                                            <X className="w-4 h-4 mr-2" /> Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" className="flex-grow h-12 rounded-xl bg-primary shadow-lg shadow-primary/20" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin mr-2" /> : (editingCampaign ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                                        {editingCampaign ? 'Save Updates' : 'Launch Campaign'}
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
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="py-6 pl-8 font-bold">Campaign</TableHead>
                                            <TableHead className="font-bold">Progress</TableHead>
                                            <TableHead className="font-bold">Dates</TableHead>
                                            <TableHead className="font-bold">Status</TableHead>
                                            <TableHead className="text-right pr-8 font-bold">Manage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {campaigns.map((campaign) => (
                                            <TableRow key={campaign.id} className="group hover:bg-muted/30 border-border/40 transition-colors">
                                                <TableCell className="py-6 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                                            {campaign.image_url ? (
                                                                <img
                                                                    src={getImageUrl(campaign.image_url)}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/50">
                                                                    <Megaphone className="w-5 h-5 opacity-20" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold leading-none mb-1">{campaign.title}</p>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">{campaign.category}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-bold">${campaign.currentAmount?.toLocaleString() ?? 0} <span className="text-muted-foreground font-normal">of ${campaign.goalAmount?.toLocaleString()}</span></div>
                                                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary"
                                                                style={{ width: `${Math.min(100, ((campaign.currentAmount || 0) / campaign.goalAmount) * 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs text-muted-foreground">
                                                        {campaign.startDate && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold">Start:</span> {new Date(campaign.startDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        {campaign.endDate && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold">End:</span> {new Date(campaign.endDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        campaign.status === 'active' ? "default" :
                                                            campaign.status === 'completed' ? "secondary" : "outline"
                                                    } className={cn(
                                                        "rounded-full px-3 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                                        campaign.status === 'active' && "bg-green-100 text-green-700 hover:bg-green-100",
                                                        campaign.status === 'draft' && "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
                                                        campaign.status === 'paused' && "bg-orange-100 text-orange-700 hover:bg-orange-100",
                                                        campaign.status === 'completed' && "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                    )}>
                                                        {campaign.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8 space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(campaign)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {campaigns.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-64 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Megaphone className="w-10 h-10 opacity-20" />
                                                        <p className="font-bold">No campaigns found</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
