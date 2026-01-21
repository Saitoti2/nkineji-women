import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Users, Megaphone, DollarSign, UsersRound,
  LogOut, TrendingUp, Activity, Eye, EyeOff, Home
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImpactStoriesManager } from '@/components/admin/ImpactStoriesManager';
import { EssentialsManager } from '@/components/admin/EssentialsManager';
import { CampaignsManager } from '@/components/admin/CampaignsManager';
import { DonationsManager } from '@/components/admin/DonationsManager';
import { BeneficiariesManager } from '@/components/admin/BeneficiariesManager';
import { UsersManager } from '@/components/admin/UsersManager';
import { PaymentSettingsManager } from '@/components/admin/PaymentSettingsManager';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface DashboardStats {
  totalCampaigns: number;
  totalDonations: number;
  totalBeneficiaries: number;
  totalRaised: number;
}

export function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, activeTab]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('mara_bloom_auth_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      // Verify token is valid by making a test request
      const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('mara_bloom_auth_token');
        navigate('/admin/login');
      }
    } catch (error) {
      localStorage.removeItem('mara_bloom_auth_token');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    const token = localStorage.getItem('mara_bloom_auth_token');
    if (!token) return;

    try {
      if (activeTab === 'dashboard' || activeTab === 'campaigns') {
        const statsRes = await fetch(`${API_BASE}/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }
      }

      if (activeTab === 'users') {
        // Users fetched in UsersManager
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && (data.user?.role === 'admin' || data.user?.role === 'super_admin')) {
        localStorage.setItem('mara_bloom_auth_token', data.accessToken);
        localStorage.setItem('mara_bloom_refresh_token', data.refreshToken);
        setIsAuthenticated(true);
        navigate('/admin');
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Invalid credentials or insufficient permissions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Login failed',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mara_bloom_auth_token');
    localStorage.removeItem('mara_bloom_refresh_token');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };





  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/90 backdrop-blur-xl sticky top-0 z-50 shadow-float border-b-border/30">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')} className="shadow-float hover:shadow-float-lg border-2">
              <Home className="w-4 h-4 mr-2" />
              Website
            </Button>
            <Button variant="outline" onClick={handleLogout} className="shadow-float hover:shadow-float-lg border-2">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex overflow-x-auto scrollbar-hide py-1 mb-6 bg-card/90 backdrop-blur-xl border border-white/20 rounded-xl sticky top-[72px] z-40 gap-1 px-1">
            <TabsTrigger value="dashboard" className="flex-shrink-0 min-w-auto px-4 py-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="campaigns" className="flex-shrink-0 min-w-auto px-4 py-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Campaigns</TabsTrigger>
            <TabsTrigger value="stories" className="flex-shrink-0 min-w-auto px-4 py-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Impact Stories</TabsTrigger>
            <TabsTrigger value="donations" className="flex-shrink-0 min-w-auto px-4 py-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Donations</TabsTrigger>
            <TabsTrigger value="beneficiaries" className="flex-shrink-0 min-w-auto px-4 py-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Beneficiaries</TabsTrigger>
            <TabsTrigger value="essentials" className="flex-shrink-0 min-w-auto px-4 py-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Essentials</TabsTrigger>
            <TabsTrigger value="users" className="flex-shrink-0 min-w-auto px-4 py-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Users</TabsTrigger>
            <TabsTrigger value="settings" className="flex-shrink-0 min-w-auto px-4 py-2 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {stats && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                  {/* ... stats cards ... */}
                  <div className="float-card p-4 sm:p-5 md:p-6 lg:p-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 sm:mb-4">
                      <Megaphone className="w-5 h-5 sm:w-6 sm:h-7" />
                    </div>
                    <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                      {stats.totalCampaigns}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Total Campaigns</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">Active fundraising campaigns</p>
                  </div>

                  <div className="float-card p-4 sm:p-5 md:p-6 lg:p-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-3 sm:mb-4">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-7" />
                    </div>
                    <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                      ${stats.totalRaised.toLocaleString()}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Total Raised</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">Funds collected across all campaigns</p>
                  </div>

                  <div className="float-card p-4 sm:p-5 md:p-6 lg:p-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-3 sm:mb-4">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-7" />
                    </div>
                    <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                      {stats.totalDonations}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Total Donations</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">Individual contributions received</p>
                  </div>

                  <div className="float-card p-4 sm:p-5 md:p-6 lg:p-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 sm:mb-4">
                      <UsersRound className="w-5 h-5 sm:w-6 sm:h-7" />
                    </div>
                    <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                      {stats.totalBeneficiaries}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Beneficiaries</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">Women and girls supported</p>
                  </div>
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-bold font-display mb-6">Advanced Management Control Center</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="group hover:border-primary/50 transition-all cursor-pointer border-2 shadow-float hover:shadow-float-lg bg-card/80 backdrop-blur" onClick={() => setActiveTab('campaigns')}>
                      <CardHeader>
                        <Megaphone className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <CardTitle>Campaign Command</CardTitle>
                        <CardDescription>Full CRUD & detailed settings for all initiatives</CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="group hover:border-accent/50 transition-all cursor-pointer border-2 shadow-float hover:shadow-float-lg bg-card/80 backdrop-blur" onClick={() => setActiveTab('stories')}>
                      <CardHeader>
                        <Users className="w-8 h-8 text-accent mb-2 group-hover:scale-110 transition-transform" />
                        <CardTitle>Impact Story Lab</CardTitle>
                        <CardDescription>Manage stories, media gallery & testimonials</CardDescription>
                      </CardHeader>
                    </Card>

                    <Card className="group hover:border-secondary/50 transition-all cursor-pointer border-2 shadow-float hover:shadow-float-lg bg-card/80 backdrop-blur" onClick={() => setActiveTab('essentials')}>
                      <CardHeader>
                        <DollarSign className="w-8 h-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                        <CardTitle>Essentials Boutique</CardTitle>
                        <CardDescription>Update prices & descriptions for provision items</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <CampaignsManager />
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <DonationsManager />
          </TabsContent>

          <TabsContent value="beneficiaries" className="space-y-6">
            <BeneficiariesManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersManager />
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <ImpactStoriesManager />
          </TabsContent>

          <TabsContent value="essentials" className="space-y-6">
            <EssentialsManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PaymentSettingsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background p-4">
      <div className="float-card w-full max-w-md p-8 bg-card/90 backdrop-blur-xl">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              Admin Access
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-2 text-center">
            Admin Login
          </h1>
          <p className="text-muted-foreground text-center text-sm sm:text-base">Enter your credentials to access the admin dashboard</p>
        </div>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block text-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="shadow-sm border-2"
            />
          </div>
          <div>
            <Label className="mb-2 block text-foreground">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="shadow-sm border-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            onClick={() => onLogin(email, password)}
            className="w-full shadow-float hover:shadow-float-lg"
            variant="default"
            size="lg"
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}



