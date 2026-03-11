import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, UsersRound, Plus, Pencil, Trash2, X, Save, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from '@/stores/authStore';
import { AdvancedFilters } from './AdvancedFilters';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface Beneficiary {
    id: string;
    pseudo_id: string;
    full_name_encrypted?: string;
    gender: string;
    date_of_birth?: string;
    contact_info_encrypted?: string;
    created_at: string;
}

export function BeneficiariesManager() {
    const { accessToken } = useAuthStore();
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        gender: 'female',
        dateOfBirth: '',
        contactInfo: {
            phone: '',
            email: '',
            address: ''
        }
    });

    useEffect(() => {
        fetchBeneficiaries();
    }, [filters]);

    const fetchBeneficiaries = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== undefined)
                ) as any
            });
            const res = await fetch(`${API_BASE}/admin/beneficiaries?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBeneficiaries(data.data || []);
            } else {
                toast.error("Failed to load beneficiaries");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this beneficiary record? This action cannot be undone.")) return;
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE}/admin/beneficiaries/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                toast.success("Beneficiary removed");
                fetchBeneficiaries();
            } else {
                toast.error("Failed to delete beneficiary");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleEdit = (beneficiary: Beneficiary) => {
        setEditingId(beneficiary.id);
        let contact = { phone: '', email: '', address: '' };
        if (beneficiary.contact_info_encrypted) {
            try {
                contact = JSON.parse(beneficiary.contact_info_encrypted);
            } catch (e) {
                console.error("Failed to parse contact info", e);
            }
        }
        setFormData({
            fullName: beneficiary.full_name_encrypted || '',
            gender: beneficiary.gender,
            dateOfBirth: beneficiary.date_of_birth ? new Date(beneficiary.date_of_birth).toISOString().split('T')[0] : '',
            contactInfo: contact
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;
        setSubmitting(true);
        try {
            const url = editingId
                ? `${API_BASE}/admin/beneficiaries/${editingId}`
                : `${API_BASE}/admin/beneficiaries`;

            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingId ? "Beneficiary updated" : "Beneficiary registered");
                setIsDialogOpen(false);
                setEditingId(null);
                setFormData({
                    fullName: '',
                    gender: 'female',
                    dateOfBirth: '',
                    contactInfo: { phone: '', email: '', address: '' }
                });
                fetchBeneficiaries();
            } else {
                const data = await res.json();
                toast.error(data.error || "Operation failed");
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
                    <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                        Beneficiary Management
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                        Impact <span className="text-secondary">Directory</span>
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                        Manage beneficiary records with privacy and security. Track impact and program participation.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingId(null);
                        setFormData({
                            fullName: '',
                            gender: 'female',
                            dateOfBirth: '',
                            contactInfo: { phone: '', email: '', address: '' }
                        });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-2xl bg-secondary text-white shadow-xl shadow-secondary/20 hover:shadow-secondary/30 transition-all font-bold gap-2">
                            <Plus className="w-5 h-5" /> Add Beneficiary
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold font-display">{editingId ? 'Edit Record' : 'New Registration'}</DialogTitle>
                            <DialogDescription>Ensure all data is accurate. Sensitive fields are encrypted for privacy.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                                    <Input
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Legal Name"
                                        className="h-12 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gender</Label>
                                    <Select value={formData.gender} onValueChange={v => setFormData({ ...formData, gender: v })}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                                    <Input
                                        value={formData.contactInfo.phone}
                                        onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, phone: e.target.value } })}
                                        placeholder="+254..."
                                        className="h-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Physical Address</Label>
                                <Input
                                    value={formData.contactInfo.address}
                                    onChange={e => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, address: e.target.value } })}
                                    placeholder="County, Sub-county, Village..."
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <Button type="submit" className="w-full h-14 rounded-2xl bg-secondary text-white shadow-lg shadow-secondary/20 font-bold" disabled={submitting}>
                                {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                                {editingId ? 'Save Changes' : 'Confirm Registration'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <AdvancedFilters
                onFilterChange={setFilters}
                searchPlaceholder="Search beneficiaries by name or location..."
                statusOptions={[
                    { label: 'Female', value: 'female' },
                    { label: 'Male', value: 'male' },
                    { label: 'Other', value: 'other' },
                ]}
                showDateFilter={false}
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
                                    <TableHead className="py-6 pl-8 font-bold">Pseudo ID</TableHead>
                                    <TableHead className="font-bold">Full Name</TableHead>
                                    <TableHead className="font-bold">Gender</TableHead>
                                    <TableHead className="font-bold">Contact</TableHead>
                                    <TableHead className="text-right pr-8 font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {beneficiaries.map((beneficiary) => (
                                    <TableRow key={beneficiary.id} className="hover:bg-muted/30 border-border/40 transition-colors">
                                        <TableCell className="py-6 pl-8 font-mono text-xs">{beneficiary.pseudo_id}</TableCell>
                                        <TableCell className="font-bold">{beneficiary.full_name_encrypted || 'Anonymous'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">{beneficiary.gender}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {beneficiary.contact_info_encrypted ? (
                                                JSON.parse(beneficiary.contact_info_encrypted).phone || JSON.parse(beneficiary.contact_info_encrypted).email || 'No contact'
                                            ) : 'No contact'}
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(beneficiary)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(beneficiary.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {beneficiaries.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <UsersRound className="w-10 h-10 opacity-20" />
                                                <p className="font-bold">No beneficiaries found</p>
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
