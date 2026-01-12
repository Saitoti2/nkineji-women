import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Edit, Trash2, X, Save, Image as ImageIcon, Film, Eye, Upload, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface StoryMedia {
    id?: string;
    media_type: 'image' | 'video';
    media_url: string;
    thumbnail_url?: string;
    caption?: string;
    display_order: number;
}

interface ImpactStory {
    id: string;
    beneficiary_name: string;
    beneficiary_age?: number;
    location?: string;
    profile_image_url?: string;
    short_bio?: string;
    title: string;
    content: string;
    impact_summary?: string;
    campaign_id?: string;
    campaign_title?: string;
    status: 'draft' | 'published' | 'archived';
    views_count: number;
    created_at: string;
    media?: StoryMedia[];
}

interface Campaign {
    id: string;
    title: string;
}

export function ImpactStoriesManager() {
    const [stories, setStories] = useState<ImpactStory[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStory, setEditingStory] = useState<ImpactStory | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        beneficiary_name: '',
        beneficiary_age: '',
        location: '',
        profile_image_url: '',
        short_bio: '',
        title: '',
        content: '',
        impact_summary: '',
        campaign_id: '',
        status: 'published' as 'draft' | 'published' | 'archived',
        media: [] as StoryMedia[]
    });

    useEffect(() => {
        fetchStories();
        fetchCampaigns();
    }, []);

    const fetchStories = async () => {
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const res = await fetch(`${API_BASE}/impact-stories?status=all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStories(data.data);
            }
        } catch (error) {
            toast.error("Failed to load stories");
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${API_BASE}/campaigns`);
            const data = await res.json();
            if (data.success) {
                setCampaigns(data.data);
            }
        } catch (error) { }
    };

    const handleEdit = (story: ImpactStory) => {
        setEditingStory(story);
        setFormData({
            beneficiary_name: story.beneficiary_name,
            beneficiary_age: story.beneficiary_age?.toString() || '',
            location: story.location || '',
            profile_image_url: story.profile_image_url || '',
            short_bio: story.short_bio || '',
            title: story.title,
            content: story.content,
            impact_summary: story.impact_summary || '',
            campaign_id: story.campaign_id || '',
            status: story.status,
            media: story.media || []
        });
        setImagePreview(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingStory(null);
        setFormData({
            beneficiary_name: '',
            beneficiary_age: '',
            location: '',
            profile_image_url: '',
            short_bio: '',
            title: '',
            content: '',
            impact_summary: '',
            campaign_id: '',
            status: 'published' as 'draft' | 'published' | 'archived',
            media: []
        });
        setImagePreview(null);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | { type: 'media', index: number }) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (target === 'profile') {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }

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
                if (target === 'profile') {
                    setFormData({ ...formData, profile_image_url: data.data.url });
                } else {
                    updateMediaRow(target.index, 'media_url', data.data.url);
                }
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
            beneficiary_name: formData.beneficiary_name,
            beneficiary_age: formData.beneficiary_age ? parseInt(formData.beneficiary_age) : undefined,
            location: formData.location || undefined,
            profile_image_url: formData.profile_image_url || undefined,
            short_bio: formData.short_bio || undefined,
            title: formData.title,
            content: formData.content,
            impact_summary: formData.impact_summary || undefined,
            campaign_id: formData.campaign_id || undefined,
            status: formData.status,
            media: formData.media.map((m, idx) => ({
                ...m,
                display_order: m.display_order ?? idx
            }))
        };

        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const url = editingStory
                ? `${API_BASE}/impact-stories/${editingStory.id}`
                : `${API_BASE}/impact-stories`;
            const method = editingStory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingStory ? "Story updated" : "Story created");
                handleCancel();
                fetchStories();
            } else {
                const data = await res.json();
                toast.error(data.message || "Action failed");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this impact story?")) return;
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const res = await fetch(`${API_BASE}/impact-stories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Story deleted");
                fetchStories();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const addMediaRow = () => {
        setFormData({
            ...formData,
            media: [...formData.media, { media_type: 'image', media_url: '', display_order: formData.media.length }]
        });
    };

    const removeMediaRow = (index: number) => {
        const newMedia = formData.media.filter((_, i) => i !== index);
        setFormData({ ...formData, media: newMedia });
    };

    const updateMediaRow = (index: number, field: keyof StoryMedia, value: any) => {
        const newMedia = [...formData.media];
        newMedia[index] = { ...newMedia[index], [field]: value };
        setFormData({ ...formData, media: newMedia });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-display">Impact Story Lab</h1>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none p-2 px-4 rounded-xl">
                    {stories.length} Transformation Tales
                </Badge>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-2xl font-bold font-display flex items-center gap-3">
                                {editingStory ? <Edit className="text-primary" /> : <Plus className="text-primary" />}
                                {editingStory ? 'Refine the Tale' : 'Draft New Story'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Beneficiary Name</Label>
                                        <Input
                                            value={formData.beneficiary_name}
                                            onChange={e => setFormData({ ...formData, beneficiary_name: e.target.value })}
                                            className="h-12 rounded-xl" required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</Label>
                                        <Input
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="h-12 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Catchy Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="h-12 rounded-xl text-lg font-bold" required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Beneficiary Avatar</Label>
                                    <div className="flex flex-col gap-4">
                                        {formData.profile_image_url || imagePreview ? (
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 group">
                                                <img
                                                    src={imagePreview || getImageUrl(formData.profile_image_url)}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, profile_image_url: '' });
                                                        setImagePreview(null);
                                                    }}
                                                    className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-destructive"
                                                >
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                                className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-all flex items-center justify-center cursor-pointer bg-muted/5 group"
                                            >
                                                <Upload className="w-6 h-6 text-primary/40 group-hover:scale-110 transition-transform" />
                                            </div>
                                        )}
                                        <Input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageUpload(e, 'profile')}
                                            disabled={uploading}
                                        />
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={formData.profile_image_url}
                                                onChange={e => setFormData({ ...formData, profile_image_url: e.target.value })}
                                                placeholder="Or paste profile image URL..."
                                                className="h-10 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">The Full Story</Label>
                                    <Textarea
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        className="rounded-2xl resize-none leading-relaxed" rows={10} required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Impact Summary (Quoteable)</Label>
                                    <Textarea
                                        value={formData.impact_summary}
                                        onChange={e => setFormData({ ...formData, impact_summary: e.target.value })}
                                        className="rounded-xl resize-none italic" rows={2}
                                        placeholder="e.g. Now serving 40 women daily..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Linked Campaign</Label>
                                        <Select value={formData.campaign_id} onValueChange={v => setFormData({ ...formData, campaign_id: v })}>
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue placeholder="Social Link" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visibility</Label>
                                        <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                                            <SelectTrigger className="h-12 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-border">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm font-bold uppercase text-primary">Media Gallery</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addMediaRow} className="rounded-xl">
                                            <Plus className="w-4 h-4 mr-2" /> Add Media
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.media.map((item, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex gap-4 items-start relative">
                                                <div className="flex-grow space-y-3">
                                                    <div className="flex gap-4">
                                                        <div className="w-32">
                                                            <Select value={item.media_type} onValueChange={v => updateMediaRow(idx, 'media_type', v)}>
                                                                <SelectTrigger className="h-9 rounded-lg">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="image">Image</SelectItem>
                                                                    <SelectItem value="video">Video</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="flex-1 flex gap-2">
                                                            <Input
                                                                value={item.media_url}
                                                                onChange={e => updateMediaRow(idx, 'media_url', e.target.value)}
                                                                placeholder="Media URL..."
                                                                className="h-9 rounded-lg flex-grow"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => document.getElementById(`media-upload-${idx}`)?.click()}
                                                                className="h-9 w-9 shrink-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                                disabled={uploading}
                                                            >
                                                                <Upload className="h-4 w-4" />
                                                            </Button>
                                                            <Input
                                                                id={`media-upload-${idx}`}
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={(e) => handleImageUpload(e, { type: 'media', index: idx })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Input
                                                        value={item.caption || ''}
                                                        onChange={e => updateMediaRow(idx, 'caption', e.target.value)}
                                                        placeholder="Caption..."
                                                        className="h-9 rounded-lg"
                                                    />
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeMediaRow(idx)} className="text-destructive hover:bg-destructive/10 h-8 w-8">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    {editingStory && (
                                        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 h-14 rounded-2xl">
                                            Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" className="flex-[2] h-14 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin mr-2" /> : (editingStory ? <Save className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />)}
                                        {editingStory ? 'Save Transformations' : 'Share the Impact'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {stories.map(story => (
                                <Card key={story.id} className="border-none shadow-lg bg-card rounded-[2rem] hover:shadow-xl transition-shadow group overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col sm:flex-row h-full">
                                            <div className="w-full sm:w-48 h-48 sm:h-auto relative">
                                                <img
                                                    src={getImageUrl(story.profile_image_url)}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <Badge className={cn(
                                                        "rounded-full p-1 w-6 h-6 flex items-center justify-center border-none",
                                                        story.status === 'published' ? "bg-green-500" : story.status === 'draft' ? "bg-yellow-500" : "bg-muted text-muted-foreground"
                                                    )} />
                                                </div>
                                            </div>
                                            <div className="flex-1 p-6 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">{story.title}</h3>
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                                            <Eye className="w-3.5 h-3.5" /> {story.views_count}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">{story.beneficiary_name}</p>
                                                    <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                                                        {story.content}
                                                    </p>
                                                </div>

                                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
                                                    <div className="flex gap-2">
                                                        {story.media && story.media.map((m, i) => (
                                                            <div key={i} className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                                                                {m.media_type === 'image' ? <ImageIcon className="w-3 h-3 text-muted-foreground" /> : <Film className="w-3 h-3 text-muted-foreground" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(story)} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(story.id)} className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {stories.length === 0 && (
                                <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border">
                                    <p className="font-bold text-muted-foreground">No stories shared yet. Be the first!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
