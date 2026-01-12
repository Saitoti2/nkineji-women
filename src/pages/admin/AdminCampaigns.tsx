import { useState, useEffect } from 'react';
import { DynamicNavbar } from "@/components/layout/DynamicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Edit, Pause, Play, Trash2, X, Save, Upload, Image as ImageIcon, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface Campaign {
    id: string;
    title: string;
    description: string;
    goal_amount: number;
    raised_amount: number;
    image_url?: string;
    category?: string;
    status: string;
    start_date?: string;
    end_date?: string;
}

export default function AdminCampaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goalAmount: '',
        imageUrl: '',
        category: '',
        status: 'draft',
        startDate: '',
        endDate: ''
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
            const res = await fetch(`${API_BASE}/campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setCampaigns(data.data);
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
            description: campaign.description,
            goalAmount: campaign.goal_amount.toString(),
            imageUrl: campaign.image_url || '',
            category: campaign.category || '',
            status: campaign.status,
            startDate: campaign.start_date ? campaign.start_date.split('T')[0] : '',
            endDate: campaign.end_date ? campaign.end_date.split('T')[0] : ''
        });
        setImagePreview(null);
    };

    const handleCancel = () => {
        setEditingCampaign(null);
        setFormData({
            title: '',
            description: '',
            goalAmount: '',
            imageUrl: '',
            category: '',
            status: 'draft',
            startDate: '',
            endDate: ''
        });
        setImagePreview(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
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
                setFormData({ ...formData, imageUrl: data.data.url });
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
            image_url: formData.imageUrl || undefined,
            category: formData.category || undefined,
            status: formData.status,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined
        };

        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const url = editingCampaign
                ? `${API_BASE}/campaigns/${editingCampaign.id}`
                : `${API_BASE}/campaigns`;
            const method = editingCampaign ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(editingCampaign ? "Campaign updated" : "Campaign created");
                handleCancel();
                fetchCampaigns();
            } else {
                toast.error(data.message || "Action failed");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this campaign? This cannot be undone.")) return;

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
            toast.error("Network error");
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const res = await fetch(`${API_BASE}/campaigns/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`);
                fetchCampaigns();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <DynamicNavbar />

            <main className="flex-grow container mx-auto px-4 py-8 pt-32">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold font-display">Campaign Control Center</h1>
                    {!editingCampaign && (
                        <Badge variant="outline" className="text-primary border-primary">
                            {campaigns.length} Active Initiatives
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Editor Section */}
                    <div className="lg:col-span-1">
                        <Card className="border-none shadow-xl bg-card rounded-[2rem]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-2xl font-bold font-display">
                                    {editingCampaign ? 'Edit Campaign' : 'Create Initiative'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Impactful title..."
                                            className="h-12 rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Goal ($)</Label>
                                            <Input
                                                type="number"
                                                value={formData.goalAmount}
                                                onChange={e => setFormData({ ...formData, goalAmount: e.target.value })}
                                                placeholder="5000"
                                                className="h-12 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                                <SelectTrigger className="h-12 rounded-xl">
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="rescue">Rescue</SelectItem>
                                                    <SelectItem value="education">Education</SelectItem>
                                                    <SelectItem value="health">Health</SelectItem>
                                                    <SelectItem value="economic">Economic</SelectItem>
                                                    <SelectItem value="community">Community</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Campaign Image</Label>
                                        <div className="flex flex-col gap-4">
                                            {formData.imageUrl || imagePreview ? (
                                                <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-border group">
                                                    <img
                                                        src={imagePreview || getImageUrl(formData.imageUrl)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, imageUrl: '' });
                                                            setImagePreview(null);
                                                        }}
                                                        className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => document.getElementById('campaign-image-upload')?.click()}
                                                    className="w-full aspect-video rounded-[2rem] border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/5 group"
                                                >
                                                    <div className="p-4 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                                        <Upload className="w-8 h-8 text-primary/60" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-medium">Click to upload image</p>
                                                        <p className="text-xs text-muted-foreground">Local file storage</p>
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
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-border" />
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Or URL</span>
                                                <div className="h-px flex-1 bg-border" />
                                            </div>
                                            <Input
                                                value={formData.imageUrl}
                                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                placeholder="Unsplash/Cloudinary link..."
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mission Details</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Tell the story..."
                                            className="rounded-2xl resize-none"
                                            rows={6}
                                            required
                                        />
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
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                                            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                                <SelectTrigger className="h-12 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="paused">Paused</SelectItem>
                                                    <SelectItem value="completed">Done</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                            {editingCampaign ? 'Save Changes' : 'Launch Campaign'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section */}
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-xl bg-card rounded-[2rem] overflow-hidden">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableHead className="font-bold py-6 pl-8">Initiative</TableHead>
                                                <TableHead className="font-bold">Goal</TableHead>
                                                <TableHead className="font-bold">Progress</TableHead>
                                                <TableHead className="font-bold">Status</TableHead>
                                                <TableHead className="text-right pr-8 font-bold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {campaigns.map((campaign) => (
                                                <TableRow key={campaign.id} className="group hover:bg-muted/30 border-border/50">
                                                    <TableCell className="py-6 pl-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
                                                                <img
                                                                    src={getImageUrl(campaign.image_url)}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold leading-none mb-1">{campaign.title}</p>
                                                                <p className="text-xs text-muted-foreground">{campaign.category}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold">${Number(campaign.goal_amount).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <div className="w-32">
                                                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tighter">
                                                                <span>{Math.round((campaign.raised_amount / campaign.goal_amount) * 100)}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-muted rounded-full">
                                                                <div
                                                                    className="h-full bg-primary rounded-full"
                                                                    style={{ width: `${Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className={cn(
                                                            "rounded-lg text-[10px] uppercase font-bold",
                                                            campaign.status === 'active' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                                campaign.status === 'paused' ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                                    "bg-muted text-muted-foreground"
                                                        )}>
                                                            {campaign.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-8 space-x-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(campaign)} className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(campaign.id, campaign.status)} className="h-9 w-9 rounded-lg">
                                                            {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)} className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
