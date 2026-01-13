import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, UsersRound } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface Beneficiary {
    id: string;
    pseudo_id: string;
    gender: string;
    created_at: string;
}

export function BeneficiariesManager() {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBeneficiaries();
    }, []);

    const fetchBeneficiaries = async () => {
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const res = await fetch(`${API_BASE}/admin/beneficiaries`, {
                headers: { 'Authorization': `Bearer ${token}` }
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

    return (
        <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 float-card p-5 sm:p-6 md:p-8 lg:p-10">
                <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                    Beneficiary Management
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                    Our <span className="text-secondary">Beneficiaries</span>
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
                    Manage beneficiary records with privacy and security. Track impact and program participation.
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
                                    <TableHead className="py-6 pl-8 font-bold">Pseudo ID</TableHead>
                                    <TableHead className="font-bold">Gender</TableHead>
                                    <TableHead className="font-bold text-right pr-8">Created</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {beneficiaries.map((beneficiary) => (
                                    <TableRow key={beneficiary.id} className="hover:bg-muted/30 border-border/40 transition-colors">
                                        <TableCell className="py-6 pl-8 font-mono">{beneficiary.pseudo_id}</TableCell>
                                        <TableCell className="capitalize">{beneficiary.gender}</TableCell>
                                        <TableCell className="text-right pr-8 text-muted-foreground">
                                            {new Date(beneficiary.created_at).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {beneficiaries.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-64 text-center">
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
