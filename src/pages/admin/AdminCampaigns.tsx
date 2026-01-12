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
import { Plus, Loader2, Edit, Pause, Play, Trash2 } from "lucide-react";

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
    const [newCampaign, setNewCampaign] = useState({
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

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem('user_token');
            const res = await fetch(`${API_BASE}/campaigns`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('user_token');
            const res = await fetch(`${API_BASE}/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newCampaign.title,
                    description: newCampaign.description,
                    goalAmount: parseFloat(newCampaign.goalAmount),
                    image_url: newCampaign.imageUrl || null,
                    category: newCampaign.category || null,
                    status: newCampaign.status,
                    startDate: newCampaign.startDate || null,
                    endDate: newCampaign.endDate || null
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Campaign created successfully");
                setNewCampaign({
                    title: '',
                    description: '',
                    goalAmount: '',
                    imageUrl: '',
                    category: '',
                    status: 'draft',
                    startDate: '',
                    endDate: ''
                });
                fetchCampaigns();
            } else {
                toast.error(data.message || "Failed to create campaign");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        try {
            const token = localStorage.getItem('user_token');
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
            toast.error("Failed to update campaign");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <DynamicNavbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Manage Campaigns</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Form */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Campaign</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Campaign Title</Label>
                                        <Input
                                            id="title"
                                            value={newCampaign.title}
                                            onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })}
                                            placeholder="e.g. Emergency Rescue Fund"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="goal">Goal Amount (USD)</Label>
                                        <Input
                                            id="goal"
                                            type="number"
                                            step="0.01"
                                            value={newCampaign.goalAmount}
                                            onChange={e => setNewCampaign({ ...newCampaign, goalAmount: e.target.value })}
                                            placeholder="50000"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={newCampaign.category} onValueChange={(value) => setNewCampaign({ ...newCampaign, category: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rescue">Rescue & Safety</SelectItem>
                                                <SelectItem value="education">Education</SelectItem>
                                                <SelectItem value="health">Health</SelectItem>
                                                <SelectItem value="economic">Economic Empowerment</SelectItem>
                                                <SelectItem value="community">Community</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="image">Image URL</Label>
                                        <Input
                                            id="image"
                                            value={newCampaign.imageUrl}
                                            onChange={e => setNewCampaign({ ...newCampaign, imageUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="desc">Description</Label>
                                        <Textarea
                                            id="desc"
                                            value={newCampaign.description}
                                            onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })}
                                            placeholder="Campaign description..."
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start">Start Date</Label>
                                            <Input
                                                id="start"
                                                type="date"
                                                value={newCampaign.startDate}
                                                onChange={e => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end">End Date</Label>
                                            <Input
                                                id="end"
                                                type="date"
                                                value={newCampaign.endDate}
                                                onChange={e => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={newCampaign.status} onValueChange={(value) => setNewCampaign({ ...newCampaign, status: value })}>
                                            <SelectTrigger>
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

                                    <Button type="submit" className="w-full" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                                        Create Campaign
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Campaigns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Goal</TableHead>
                                                <TableHead>Raised</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {campaigns.map((campaign) => (
                                                <TableRow key={campaign.id}>
                                                    <TableCell className="font-medium">{campaign.title}</TableCell>
                                                    <TableCell>${Number(campaign.goal_amount).toLocaleString()}</TableCell>
                                                    <TableCell>${Number(campaign.raised_amount).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                                                campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {campaign.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleStatus(campaign.id, campaign.status)}
                                                        >
                                                            {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
