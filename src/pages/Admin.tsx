import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Megaphone, DollarSign, UsersRound, 
  Plus, Edit, Trash2, LogOut, BarChart3,
  TrendingUp, Activity
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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
  const [donations, setDonations] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
    earmark: '',
    status: 'draft',
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    organisationId: '',
  });

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
      const token = localStorage.getItem('admin_token');
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
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      if (activeTab === 'dashboard' || activeTab === 'campaigns') {
        const [statsRes, campaignsRes] = await Promise.all([
          fetch(`${API_BASE}/admin/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/admin/campaigns`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }

        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json();
          setCampaigns(campaignsData.data || []);
        }
      }

      if (activeTab === 'donations') {
        const donationsRes = await fetch(`${API_BASE}/admin/donations`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (donationsRes.ok) {
          const donationsData = await donationsRes.json();
          setDonations(donationsData.data || []);
        }
      }

      if (activeTab === 'beneficiaries') {
        const beneficiariesRes = await fetch(`${API_BASE}/admin/beneficiaries`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (beneficiariesRes.ok) {
          const beneficiariesData = await beneficiariesRes.json();
          setBeneficiaries(beneficiariesData.data || []);
        }
      }

      if (activeTab === 'users') {
        const [usersRes, rolesRes] = await Promise.all([
          fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/admin/roles`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }

        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          setRoles(rolesData.data || []);
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

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && (data.user?.role === 'admin' || data.user?.role === 'super_admin')) {
        localStorage.setItem('admin_token', data.accessToken);
        localStorage.setItem('admin_refresh_token', data.refreshToken);
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
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const handleCreateCampaign = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaignForm,
          goalAmount: parseFloat(campaignForm.goalAmount),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign created successfully',
        });
        setShowCampaignDialog(false);
        setCampaignForm({
          title: '',
          description: '',
          goalAmount: '',
          startDate: '',
          endDate: '',
          earmark: '',
          status: 'draft',
        });
        loadDashboardData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create campaign',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCampaign = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_BASE}/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...campaignForm,
          goalAmount: campaignForm.goalAmount ? parseFloat(campaignForm.goalAmount) : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign updated successfully',
        });
        setShowCampaignDialog(false);
        setEditingCampaign(null);
        loadDashboardData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update campaign',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update campaign',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_BASE}/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Campaign deleted successfully',
        });
        loadDashboardData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete campaign',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
        setShowUserDialog(false);
        setUserForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: '',
          organisationId: '',
        });
        loadDashboardData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create user',
        variant: 'destructive',
      });
    }
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
          <h1 className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <Button variant="outline" onClick={handleLogout} className="shadow-float hover:shadow-float-lg border-2">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 float-card p-1 mb-6 bg-card/90 backdrop-blur-xl">
            <TabsTrigger value="dashboard" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Dashboard</TabsTrigger>
            <TabsTrigger value="campaigns" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Campaigns</TabsTrigger>
            <TabsTrigger value="donations" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Donations</TabsTrigger>
            <TabsTrigger value="beneficiaries" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Beneficiaries</TabsTrigger>
            <TabsTrigger value="users" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
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
            )}
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 float-card p-5 sm:p-6 md:p-8 lg:p-10">
              <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                Campaign Management
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                Manage <span className="text-accent">Campaigns</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
                Create, edit, and manage fundraising campaigns. Track progress and impact in real-time.
              </p>
            </div>
            <div className="flex justify-end items-center mb-6">
              <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default"
                    onClick={() => {
                      setEditingCampaign(null);
                      setCampaignForm({
                        title: '',
                        description: '',
                        goalAmount: '',
                        startDate: '',
                        endDate: '',
                        earmark: '',
                        status: 'draft',
                      });
                    }}
                    className="shadow-float hover:shadow-float-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={campaignForm.title}
                        onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={campaignForm.description}
                        onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Goal Amount</Label>
                        <Input
                          type="number"
                          value={campaignForm.goalAmount}
                          onChange={(e) => setCampaignForm({ ...campaignForm, goalAmount: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={campaignForm.status}
                          onValueChange={(value) => setCampaignForm({ ...campaignForm, status: value })}
                        >
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={campaignForm.startDate}
                          onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={campaignForm.endDate}
                          onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Earmark (Optional)</Label>
                      <Input
                        value={campaignForm.earmark}
                        onChange={(e) => setCampaignForm({ ...campaignForm, earmark: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={() => editingCampaign ? handleUpdateCampaign(editingCampaign.id) : handleCreateCampaign()}
                      className="w-full shadow-float hover:shadow-float-lg"
                      variant="default"
                    >
                      {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="float-card p-0 overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Raised</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{campaign.title}</TableCell>
                        <TableCell>${parseFloat(campaign.goal_amount || 0).toLocaleString()}</TableCell>
                        <TableCell>${parseFloat(campaign.raised_amount || 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCampaign(campaign);
                                setCampaignForm({
                                  title: campaign.title,
                                  description: campaign.description,
                                  goalAmount: campaign.goal_amount,
                                  startDate: campaign.start_date ? campaign.start_date.split('T')[0] : '',
                                  endDate: campaign.end_date ? campaign.end_date.split('T')[0] : '',
                                  earmark: campaign.earmark || '',
                                  status: campaign.status,
                                });
                                setShowCampaignDialog(true);
                              }}
                              className="hover:bg-primary/10 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
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
            <div className="float-card p-0 overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          ${parseFloat(donation.amount || 0).toLocaleString()} {donation.currency}
                        </TableCell>
                        <TableCell>{donation.campaign_title || 'General'}</TableCell>
                        <TableCell>
                          {donation.donor_name || (donation.donor_contact ? JSON.parse(donation.donor_contact || '{}').name : 'Anonymous')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={donation.status === 'succeeded' ? 'default' : 'secondary'}>
                            {donation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(donation.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="beneficiaries" className="space-y-6">
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
            <div className="float-card p-0 overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pseudo ID</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beneficiaries.map((beneficiary) => (
                      <TableRow key={beneficiary.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{beneficiary.pseudo_id}</TableCell>
                        <TableCell>{beneficiary.gender}</TableCell>
                        <TableCell>{new Date(beneficiary.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 float-card p-5 sm:p-6 md:p-8 lg:p-10">
              <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                User Management
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                System <span className="text-primary">Users</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-2">
                Manage user accounts, roles, and permissions. Control access to the admin dashboard.
              </p>
            </div>
            <div className="flex justify-end items-center mb-6">
              <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="default"
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({
                        name: '',
                        email: '',
                        phone: '',
                        password: '',
                        role: '',
                        organisationId: '',
                      });
                    }}
                    className="shadow-float hover:shadow-float-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={userForm.phone}
                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select
                        value={userForm.role}
                        onValueChange={(value) => setUserForm({ ...userForm, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateUser} className="w-full shadow-float hover:shadow-float-lg" variant="default">
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="float-card p-0 overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email || user.phone}</TableCell>
                        <TableCell>{user.role_name}</TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'secondary'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-muted/20 to-background p-4">
      <div className="float-card w-full max-w-md p-8 bg-card/90 backdrop-blur-xl">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              Admin Access
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2 text-center">
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
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="shadow-sm border-2"
            />
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



