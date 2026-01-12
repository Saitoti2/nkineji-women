import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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
    const [donations, setDonations] = useState<Donation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const res = await fetch(`${API_BASE}/admin/donations`, {
                headers: { 'Authorization': `Bearer ${token}` }
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

    return (
        <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 float-card p-5 sm:p-6 md:p-8 lg:p-10">
                <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                    Donation Records
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                    All <span className="text-primary">Donations</span>
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
                    View and manage all donation records. Track contributions and donor information.
                </p>
            </div>

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
                                    <TableHead className="font-bold text-right pr-8">Date</TableHead>
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
                                        <TableCell className="text-right pr-8 text-muted-foreground">
                                            {new Date(donation.created_at).toLocaleDateString()}
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
