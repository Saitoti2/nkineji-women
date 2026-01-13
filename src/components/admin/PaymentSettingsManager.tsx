import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Building, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MpesaSettings {
    paybill: string;
    accountNumber: string;
    phoneNumber: string;
    instructions: string;
}

interface BankSettings {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    instructions: string;
}

export function PaymentSettingsManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [mpesa, setMpesa] = useState<MpesaSettings>({
        paybill: "",
        accountNumber: "",
        phoneNumber: "",
        instructions: ""
    });

    const [bank, setBank] = useState<BankSettings>({
        bankName: "",
        accountName: "",
        accountNumber: "",
        swiftCode: "",
        instructions: ""
    });

    const fetchSettings = async () => {
        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${API_BASE}/settings/payments`);
            const data = await res.json();
            if (data.success && data.data) {
                if (data.data.mpesa) {
                    setMpesa(prev => ({ ...prev, ...data.data.mpesa }));
                }
                if (data.data.bank_transfer) {
                    setBank(prev => ({ ...prev, ...data.data.bank_transfer }));
                }
            }
        } catch (e) {
            toast.error("Failed to load payment settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const saveSettings = async (key: 'mpesa' | 'bank_transfer', value: any) => {
        setSaving(true);
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

            const res = await fetch(`${API_BASE}/settings/payments`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });

            if (res.ok) {
                toast.success(`${key === 'mpesa' ? 'M-Pesa' : 'Bank'} settings saved`);
            } else {
                throw new Error('Failed to save');
            }
        } catch (e) {
            toast.error("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto py-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold">Payment Configuration</h2>
                <p className="text-muted-foreground">Manage how donors can pay via manual methods.</p>
            </div>

            <Tabs defaultValue="mpesa" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-6">
                    <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
                    <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                </TabsList>

                <TabsContent value="mpesa" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Smartphone className="w-5 h-5" /> M-Pesa Settings</CardTitle>
                            <CardDescription>Configure Paybill or Buy Goods information displayed to donors.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Paybill / Business Number</Label>
                                    <Input value={mpesa.paybill} onChange={e => setMpesa({ ...mpesa, paybill: e.target.value })} placeholder="e.g. 247247" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input value={mpesa.accountNumber} onChange={e => setMpesa({ ...mpesa, accountNumber: e.target.value })} placeholder="e.g. Donation" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number (Optional)</Label>
                                    <Input value={mpesa.phoneNumber} onChange={e => setMpesa({ ...mpesa, phoneNumber: e.target.value })} placeholder="e.g +254 7..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Instructions</Label>
                                <Textarea
                                    value={mpesa.instructions}
                                    onChange={e => setMpesa({ ...mpesa, instructions: e.target.value })}
                                    placeholder="Step by step instructions..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <Button onClick={() => saveSettings('mpesa', mpesa)} disabled={saving} className="w-full sm:w-auto">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save M-Pesa Settings
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bank" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" /> Bank Transfer Details</CardTitle>
                            <CardDescription>Information for direct bank deposits or wire transfers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <Input value={bank.bankName} onChange={e => setBank({ ...bank, bankName: e.target.value })} placeholder="e.g. Equity Bank" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Name</Label>
                                    <Input value={bank.accountName} onChange={e => setBank({ ...bank, accountName: e.target.value })} placeholder="e.g. Mara Bloom Foundation" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number</Label>
                                    <Input value={bank.accountNumber} onChange={e => setBank({ ...bank, accountNumber: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Swift/Sort Code</Label>
                                    <Input value={bank.swiftCode} onChange={e => setBank({ ...bank, swiftCode: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Instructions</Label>
                                <Textarea
                                    value={bank.instructions}
                                    onChange={e => setBank({ ...bank, instructions: e.target.value })}
                                    placeholder="Additional execution instructions..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <Button onClick={() => saveSettings('bank_transfer', bank)} disabled={saving} className="w-full sm:w-auto">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Bank Settings
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
