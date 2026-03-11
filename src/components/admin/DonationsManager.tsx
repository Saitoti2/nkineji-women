import { useState, useEffect } from 'react';
import { Loader2, DollarSign, Plus, Trash2, X, User, Heart, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from '@/stores/authStore';
import { AdvancedFilters } from './AdvancedFilters';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface Donation {
    id: string;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
    campaign_title?: string;
    donor_name?: string;
    donor_contact?: string;
}

export function DonationsManager() {
    const { accessToken } = useAuthStore();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [campaigns, setCampaigns] = useState<{ id: string, title: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        currency: 'USD',
        campaignId: 'none',
        donorName: '',
        donorEmail: '',
        donorPhone: '',
        paymentMethod: 'cash',
        status: 'succeeded'
    });

    useEffect(() => {
        fetchDonations();
        fetchCampaigns();
    }, [filters]);

    const fetchCampaigns = async () => {
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE}/admin/campaigns?limit=100`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCampaigns(data.data || []);
            }
        } catch (error) {
            console.error("Failed to load campaigns", error);
        }
    };

    const fetchDonations = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== undefined)
                ) as any
            });
            const res = await fetch(`${API_BASE}/admin/donations?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDonations(data.data || []);
            } else {
                toast.error("Failed to load donations");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this donation record? This will NOT refund payment but will remove it from reports.")) return;
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE}/donations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                toast.success("Donation record removed");
                fetchDonations();
            } else {
                toast.error("Failed to delete record");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleAddDonation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                campaignId: formData.campaignId === 'none' ? undefined : formData.campaignId
            };

            const res = await fetch(`${API_BASE}/donations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Manual donation recorded");
                setIsAddDialogOpen(false);
                setFormData({
                    amount: '',
                    currency: 'USD',
                    campaignId: 'none',
                    donorName: '',
                    donorEmail: '',
                    donorPhone: '',
                    paymentMethod: 'cash',
                    status: 'succeeded'
                });
                fetchDonations();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to record donation");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 md:mb-16">
                <div className="text-center md:text-left max-w-2xl">
                    <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                        Donation Records
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                        Internal <span className="text-primary">Ledger</span>
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                        View and manage all donation records. Track contributions and donor information.
                    </p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-bold gap-2">
                            <Plus className="w-5 h-5" /> Record Donation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold font-display">Manual Entry</DialogTitle>
                            <DialogDescription>Use this to record offline donations like Cash, Cheques or Direct Transfers.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddDonation} className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount</Label>
                                    <Input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="50.00"
                                        className="h-12 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Currency</Label>
                                    <Select value={formData.currency} onValueChange={v => setFormData({ ...formData, currency: v })}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="KES">KES (KSh)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Donor Name</Label>
                                <Input
                                    value={formData.donorName}
                                    onChange={e => setFormData({ ...formData, donorName: e.target.value })}
                                    placeholder="e.g. Jane Smith"
                                    className="h-12 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Donor Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.donorEmail}
                                        onChange={e => setFormData({ ...formData, donorEmail: e.target.value })}
                                        placeholder="jane@example.com"
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Donor Phone</Label>
                                    <Input
                                        value={formData.donorPhone}
                                        onChange={e => setFormData({ ...formData, donorPhone: e.target.value })}
                                        placeholder="+254..."
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fund</Label>
                                    <Select value={formData.campaignId} onValueChange={v => setFormData({ ...formData, campaignId: v })}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Select Campaign" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">General Fund</SelectItem>
                                            {campaigns.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Method</Label>
                                    <Select value={formData.paymentMethod} onValueChange={v => setFormData({ ...formData, paymentMethod: v })}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="mpesa">Manual M-Pesa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 font-bold" disabled={submitting}>
                                {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                                Record Final Entry
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <AdvancedFilters
                onFilterChange={setFilters}
                searchPlaceholder="Search by donor name, contact or reference..."
                statusOptions={[
                    { label: 'Succeeded', value: 'succeeded' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Failed', value: 'failed' },
                ]}
                categoryOptions={campaigns.map(c => ({ label: c.title, value: c.id }))}
                className="mb-8"
            />

            <div className="float-card p-0 overflow-hidden bg-card rounded-[2.5rem] shadow-2xl">
                <div className="p-4 sm:p-5 md:p-6">
                    {loading ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="py-6 pl-8 font-bold">Amount</TableHead>
                                    <TableHead className="font-bold">Campaign</TableHead>
                                    <TableHead className="font-bold">Donor</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="text-right pr-8 font-bold">Manage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {donations.map((donation) => (
                                    <TableRow key={donation.id} className="hover:bg-muted/30 border-border/40 transition-colors">
                                        <TableCell className="py-6 pl-8 font-bold text-lg">
                                            ${parseFloat(donation.amount || '0').toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{donation.currency}</span>
                                        </TableCell>
                                        <TableCell>{donation.campaign_title || 'General'}</TableCell>
                                        <TableCell>
                                            {donation.donor_name || (donation.donor_contact ? JSON.parse(donation.donor_contact || '{}').name : 'Anonymous')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={donation.status === 'succeeded' ? 'default' : 'secondary'} className={
                                                donation.status === 'succeeded' ? "bg-green-100 text-green-700 hover:bg-green-100" : ""
                                            }>
                                                {donation.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(donation.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(donation.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {donations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <DollarSign className="w-10 h-10 opacity-20" />
                                                <p className="font-bold">No donations found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
