import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  Users, Megaphone, DollarSign, UsersRound,
  LogOut, TrendingUp, Activity, Home, Menu, X, Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImpactStoriesManager } from '@/components/admin/ImpactStoriesManager';
import { EssentialsManager } from '@/components/admin/EssentialsManager';
import { CampaignsManager } from '@/components/admin/CampaignsManager';
import { DonationsManager } from '@/components/admin/DonationsManager';
import { BeneficiariesManager } from '@/components/admin/BeneficiariesManager';
import { UsersManager } from '@/components/admin/UsersManager';
import { PaymentSettingsManager } from '@/components/admin/PaymentSettingsManager';
import { useAuthStore } from '@/stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface DashboardStats {
  totalCampaigns: number;
  totalDonations: number;
  totalBeneficiaries: number;
  totalRaised: number;
}

const navItems = [
  { id: 'dashboard', icon: Activity, label: 'Dashboard' },
  { id: 'campaigns', icon: Megaphone, label: 'Campaigns' },
  { id: 'stories', icon: Users, label: 'Impact Stories' },
  { id: 'donations', icon: DollarSign, label: 'Donations' },
  { id: 'beneficiaries', icon: UsersRound, label: 'Beneficiaries' },
  { id: 'essentials', icon: TrendingUp, label: 'Essentials' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Admin() {
  const navigate = useNavigate();
  const { user, accessToken, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user && accessToken) {
      setLoading(false);
      loadDashboardData();
    } else {
      const checkPersistence = async () => {
        setTimeout(() => {
          if (!useAuthStore.getState().isAuthenticated) {
            navigate('/login');
          } else {
            setLoading(false);
            loadDashboardData();
          }
        }, 500);
      };
      checkPersistence();
    }
  }, [user, activeTab]);

  const loadDashboardData = async () => {
    if (!accessToken) return;

    try {
      if (activeTab === 'dashboard' || activeTab === 'campaigns') {
        const statsRes = await fetch(`${API_BASE}/admin/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  if (!user) {
    return <div className="p-20 text-center">Redirecting to login...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header with Title and Actions */}
      <header className="border-b bg-card/90 backdrop-blur-xl sticky top-0 z-50 shadow-float border-b-border/30">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-display font-bold text-foreground">
              Admin Dashboard
            </h1>

            <div className="flex items-center gap-2">
              {/* Desktop Actions */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="hidden sm:flex"
              >
                <Home className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="hidden sm:flex"
              >
                <LogOut className="w-5 h-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="lg:hidden p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Open menu"
                  >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[85vw] max-w-[320px] bg-card/95 backdrop-blur-xl border-l-0 rounded-l-3xl p-0 shadow-float-xl"
                >
                  <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                  <SheetDescription className="sr-only">Admin navigation menu</SheetDescription>

                  <div className="flex flex-col h-full p-6">
                    {/* Mobile Menu Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="font-display font-semibold text-foreground">Admin</h2>
                          <p className="text-xs text-muted-foreground">Control Panel</p>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <button className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                          <X className="w-5 h-5 text-foreground" />
                        </button>
                      </SheetClose>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col gap-2 flex-1">
                      {navItems.map((item) => (
                        <SheetClose asChild key={item.id}>
                          <button
                            onClick={() => setActiveTab(item.id)}
                            className={`
                              flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
                              ${activeTab === item.id 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'hover:bg-muted/50 text-foreground'
                              }
                            `}
                          >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        </SheetClose>
                      ))}
                    </nav>

                    {/* Mobile Actions */}
                    <div className="pt-6 border-t border-border/50 space-y-2">
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/')}
                        >
                          <Home className="w-4 h-4 mr-2" />
                          Back to Site
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs - Floating chip-like design */}
        <div className="hidden lg:block border-t border-border/30">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-full transition-all whitespace-nowrap font-medium text-sm shadow-float
                    ${activeTab === item.id 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'bg-card/90 backdrop-blur-sm hover:bg-muted/80 text-foreground hover:shadow-lg'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {activeTab === 'dashboard' && stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="float-card p-4 sm:p-5 lg:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 sm:mb-3">
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  {stats.totalCampaigns}
                </div>
                <h3 className="font-semibold text-foreground text-xs sm:text-sm mt-1">Campaigns</h3>
              </div>

              <div className="float-card p-4 sm:p-5 lg:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-2 sm:mb-3">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  ${stats.totalRaised.toLocaleString()}
                </div>
                <h3 className="font-semibold text-foreground text-xs sm:text-sm mt-1">Raised</h3>
              </div>

              <div className="float-card p-4 sm:p-5 lg:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-2 sm:mb-3">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  {stats.totalDonations}
                </div>
                <h3 className="font-semibold text-foreground text-xs sm:text-sm mt-1">Donations</h3>
              </div>

              <div className="float-card p-4 sm:p-5 lg:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 sm:mb-3">
                  <UsersRound className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  {stats.totalBeneficiaries}
                </div>
                <h3 className="font-semibold text-foreground text-xs sm:text-sm mt-1">Beneficiaries</h3>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold font-display mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Card className="group hover:border-primary/50 transition-all cursor-pointer border-2 shadow-float hover:shadow-float-lg bg-card/80 backdrop-blur" onClick={() => setActiveTab('campaigns')}>
                  <CardHeader className="p-4 sm:p-6">
                    <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Campaigns</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Manage initiatives</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="group hover:border-accent/50 transition-all cursor-pointer border-2 shadow-float hover:shadow-float-lg bg-card/80 backdrop-blur" onClick={() => setActiveTab('stories')}>
                  <CardHeader className="p-4 sm:p-6">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-accent mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Stories</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Impact narratives</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="group hover:border-secondary/50 transition-all cursor-pointer border-2 shadow-float hover:shadow-float-lg bg-card/80 backdrop-blur" onClick={() => setActiveTab('essentials')}>
                  <CardHeader className="p-4 sm:p-6">
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-sm sm:text-base lg:text-lg">Essentials</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Provision items</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === 'campaigns' && <CampaignsManager />}
        {activeTab === 'donations' && <DonationsManager />}
        {activeTab === 'beneficiaries' && <BeneficiariesManager />}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'stories' && <ImpactStoriesManager />}
        {activeTab === 'essentials' && <EssentialsManager />}
        {activeTab === 'settings' && <PaymentSettingsManager />}
      </main>
    </div>
  );
}
