import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Mail, Shield, Clock, Camera, Settings, Heart, Calendar, ArrowRight } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { useQuery } from "@tanstack/react-query";
import { cn, getImageUrl } from "@/lib/utils";

interface UserProfile {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role: string;
    created_at?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

interface Donation {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    campaign_title?: string;
    payment_method: string;
}

export default function Profile() {
    const { user: rawUser, accessToken, setAuth } = useAuthStore();

    const user = rawUser as unknown as UserProfile;
    const [isUpdating, setIsUpdating] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });

    const { data: donations = [], isLoading } = useQuery({
        queryKey: ['my-donations'],
        queryFn: async (): Promise<Donation[]> => {
            if (!accessToken) return [];
            const res = await fetch(`${API_BASE}/donations`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch donations');
            const data = await res.json();
            return data.data;
        },
        enabled: !!accessToken
    });

    const handleUpdateProfile = async (e?: React.FormEvent, updatedData?: any) => {
        if (e) e.preventDefault();
        if (!accessToken) return;

        const dataToSend = updatedData || profileData;
        setIsUpdating(true);
        try {
            const res = await fetch(`${API_BASE}/users/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!res.ok) throw new Error('Failed to update profile');

            const result = await res.json();

            // Update auth store with new user data
            if (rawUser) {
                setAuth({ ...rawUser, ...result.data }, accessToken, useAuthStore.getState().refreshToken || '');
            }

            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !accessToken) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');
            const result = await res.json();

            // After upload, update profile with new avatar URL
            await handleUpdateProfile(undefined, { avatar: result.data.url });
        } catch (error) {
            toast.error("Avatar upload failed");
        }
    };

    if (!user) return null;

    const totalDonated = donations
        .filter(d => d.status === 'succeeded')
        .reduce((sum, d) => sum + Number(d.amount), 0);

    const successfulDonationsCount = donations.filter(d => d.status === 'succeeded').length;

    return (
        <div className="min-h-screen bg-muted/30 p-4 sm:p-8 font-body">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <BackButton label="Back to Home" />
                    <Button variant="outline" size="icon" className="rounded-xl shadow-float">
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Profile Sidebar */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-none shadow-float rounded-[2.5rem] overflow-hidden bg-background">
                            <CardContent className="p-8 text-center space-y-6">
                                <div className="relative inline-block mx-auto">
                                    <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-lg">
                                        <AvatarImage src={getImageUrl(user.avatar)} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-4xl font-display">
                                            {user.name?.[0] || user.email[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                    />
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute bottom-0 right-0 rounded-full shadow-lg border-2 border-background"
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                    >
                                        <Camera className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold font-display">{user.name || 'User'}</h2>
                                    <p className="text-muted-foreground text-sm">{user.email}</p>
                                </div>

                                <Badge className="capitalize py-1 px-4 rounded-lg bg-primary/10 text-primary border-primary/20">
                                    <Shield className="w-3 h-3 mr-2" />
                                    {user.role.replace('_', ' ')}
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-float rounded-[2rem] bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary" />
                                    Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Donations Made</span>
                                    <span className="font-bold">{successfulDonationsCount}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Total Contributed</span>
                                    <span className="font-bold text-primary">${totalDonated.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Joined At</span>
                                    <span className="font-bold font-mono">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : '2026-03'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Settings / Info & Donation History */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Contribution History */}
                        <Card className="border-none shadow-float rounded-[2.5rem] bg-card">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-2xl font-bold font-display">Contribution History</CardTitle>
                                <CardDescription>Your past impact and supported campaigns</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
                                        ))}
                                    </div>
                                ) : donations.length === 0 ? (
                                    <div className="text-center py-12 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                                        <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                        <p className="text-muted-foreground">No contributions found yet.</p>
                                        <Button variant="link" className="mt-2 text-primary">Start your journey today</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {donations.map((donation) => (
                                            <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/50 hover:border-primary/20 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                        donation.status === 'succeeded' ? "bg-primary/10 text-primary" : "bg-orange-500/10 text-orange-500"
                                                    )}>
                                                        <Heart className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{donation.campaign_title || 'General Fund'}</p>
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(donation.created_at).toLocaleDateString()}
                                                            <span className="mx-1">•</span>
                                                            <span className="capitalize">{donation.payment_method}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-display font-bold text-base text-foreground">
                                                        ${Number(donation.amount).toLocaleString()}
                                                    </p>
                                                    <Badge variant="outline" className={cn(
                                                        "text-[10px] py-0 px-2 rounded-full",
                                                        donation.status === 'succeeded' ? "border-green-500/30 text-green-600 bg-green-50/50" : "border-orange-500/30 text-orange-600 bg-orange-50/50"
                                                    )}>
                                                        {donation.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-float rounded-[2.5rem] bg-card">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-2xl font-bold font-display">Account Settings</CardTitle>
                                <CardDescription>Manage your personal information and preferences</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <User className="w-3 h-3" /> Full Name
                                            </Label>
                                            <Input
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="h-12 rounded-xl"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Mail className="w-3 h-3" /> Email Address
                                            </Label>
                                            <Input defaultValue={user.email} disabled className="h-12 rounded-xl bg-muted/50" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isUpdating} className="rounded-xl px-8">
                                            {isUpdating ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Key({ className }: { className?: string }) {
    return <Shield className={className} />;
}
