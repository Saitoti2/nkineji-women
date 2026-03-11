
import { useNavigate } from 'react-router-dom';
import { DynamicNavbar } from "@/components/layout/DynamicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Gift, Users, ArrowRight, Star, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col font-body">
            <DynamicNavbar />

            <main className="flex-grow container mx-auto px-4 py-8 pt-32">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h1 className="text-4xl font-bold font-display mb-2">Welcome back, {user.name || 'Friend'}!</h1>
                            <p className="text-muted-foreground">See the impact of your support and find new ways to help.</p>
                        </div>
                        <Badge variant="outline" className="px-4 py-2 rounded-full border-primary/20 text-primary bg-primary/5">
                            {user.role === 'donor' ? 'Active Supporter' : user.role.replace('_', ' ')}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 to-transparent rounded-3xl">
                            <CardContent className="p-8">
                                <Heart className="w-10 h-10 text-primary mb-4" />
                                <h3 className="text-2xl font-bold mb-1">Impact Made</h3>
                                <p className="text-muted-foreground text-sm mb-4">You've supported our initiatives this year.</p>
                                <Button variant="link" className="p-0 h-auto text-primary font-bold" onClick={() => navigate('/impact')}>
                                    View stories <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-gradient-to-br from-accent/10 to-transparent rounded-3xl">
                            <CardContent className="p-8">
                                <Gift className="w-10 h-10 text-accent mb-4" />
                                <h3 className="text-2xl font-bold mb-1">Open Initiatives</h3>
                                <p className="text-muted-foreground text-sm mb-4">Explore campaigns needing support right now.</p>
                                <Button variant="link" className="p-0 h-auto text-accent font-bold" onClick={() => navigate('/campaigns')}>
                                    Explore all <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-gradient-to-br from-secondary/10 to-transparent rounded-3xl">
                            <CardContent className="p-8">
                                <Users className="w-10 h-10 text-secondary mb-4" />
                                <h3 className="text-2xl font-bold mb-1">Community</h3>
                                <p className="text-muted-foreground text-sm mb-4">Join hundreds of supporters in making a difference.</p>
                                <Button variant="link" className="p-0 h-auto text-secondary font-bold" onClick={() => navigate('/impact')}>
                                    Join discussion <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <h2 className="text-2xl font-bold font-display mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {[
                            { title: 'New Impact Story Published', type: 'story', date: 'Just now', initiative: 'Literacy for All' },
                            { title: 'Goal Reached!', type: 'milestone', date: 'Recently', initiative: 'Rescue Center' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center p-6 rounded-3xl bg-card shadow-sm border border-border/50 hover:border-primary/20 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                                    {item.type === 'story' ? <Star className="w-5 h-5 text-yellow-500" /> :
                                        item.type === 'donation' ? <Heart className="w-5 h-5 text-red-500" /> :
                                            <Calendar className="w-5 h-5 text-blue-500" />}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground">{item.initiative} • {item.date}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
