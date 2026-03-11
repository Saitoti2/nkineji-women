import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card, CardContent, CardDescription,
    CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { BackButton } from "@/components/ui/back-button";
import { useAuthStore } from '@/stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Official Google "G" Logo SVG
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <g>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </g>
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    // Google OAuth via popup
    const signInWithGoogle = () => {
        const clientId = GOOGLE_CLIENT_ID;

        if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
            toast({
                title: 'Google Login not configured',
                description: 'Add your VITE_GOOGLE_CLIENT_ID to the .env file. See console for setup instructions.',
                variant: 'destructive',
            });
            console.warn(
                '⚙️ GOOGLE AUTH SETUP:\n' +
                '1. Go to https://console.cloud.google.com\n' +
                '2. APIs & Services → Credentials → Create OAuth 2.0 Client ID\n' +
                '3. Add http://localhost:5173 to Authorized JavaScript origins\n' +
                '4. Copy the Client ID and set VITE_GOOGLE_CLIENT_ID in your .env file\n' +
                '5. Restart the dev server'
            );
            return;
        }

        if ((window as any).google?.accounts?.oauth2) {
            const client = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'openid email profile',
                callback: async (tokenResponse: any) => {
                    if (tokenResponse.access_token) {
                        await handleGoogleAccessToken(tokenResponse.access_token);
                    } else {
                        toast({ title: 'Google error', description: 'No token returned', variant: 'destructive' });
                    }
                },
                error_callback: (err: any) => {
                    console.error('Google OAuth error:', err);
                    toast({ title: 'Google sign-in cancelled', description: err?.message || 'Try again', variant: 'destructive' });
                },
            });
            client.requestAccessToken({ prompt: 'select_account' });
        } else if ((window as any).google?.accounts?.id) {
            (window as any).google.accounts.id.prompt();
        } else {
            toast({ title: 'Google not ready', description: 'Please wait a moment and try again.', variant: 'destructive' });
        }
    };

    const handleGoogleAccessToken = async (accessToken: string) => {
        setGoogleLoading(true);
        try {
            // Get user info from Google
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const userInfo = await userInfoRes.json();

            // Send to backend for login/register
            const res = await fetch(`${API_BASE}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    googleId: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name,
                    avatar: userInfo.picture,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setAuth(data.user, data.accessToken, data.refreshToken);
                toast({ title: '🎉 Welcome!', description: `Signed in as ${data.user.name || data.user.email}` });
                redirectUser(data.user.role);
            } else {
                toast({ title: 'Sign-in failed', description: data.message || 'Try again', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Google sign-in failed', variant: 'destructive' });
        } finally {
            setGoogleLoading(false);
        }
    };

    useEffect(() => {
        // Dynamically load GSI client script
        if (!(window as any).google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    const redirectUser = (role: string) => {
        if (['admin', 'super_admin', 'chief_admin'].includes(role)) navigate('/admin');
        else navigate('/dashboard');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setAuth(data.user, data.accessToken, data.refreshToken);
                toast({ title: 'Welcome back!', description: 'Logged in successfully' });
                redirectUser(data.user.role);
            } else {
                toast({ title: 'Login failed', description: data.message || 'Invalid credentials', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Error', description: 'Network error occurred', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 relative font-body">
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
                <BackButton label="Home" />
            </div>

            <Card className="w-full max-w-md shadow-xl border-border/50 rounded-3xl overflow-hidden bg-background/90 backdrop-blur-md">
                <CardHeader className="space-y-1 pb-4 pt-8">
                    <div className="flex justify-center mb-3">
                        <Link to="/">
                            <img src="/logo.png" alt="Nkineji Initiative" className="h-10 w-auto object-contain" />
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-display font-bold text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center text-sm">
                        Sign in to your Mara Bloom account
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-6">
                    {/* === Google Sign-In Button === */}
                    <button
                        type="button"
                        onClick={signInWithGoogle}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-white hover:bg-gray-50 active:scale-[0.98] transition-all text-sm font-medium text-[#3c4043] shadow-sm select-none disabled:opacity-60"
                        style={{ fontFamily: "'Roboto', Arial, sans-serif" }}
                    >
                        {googleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                        ) : (
                            <GoogleIcon />
                        )}
                        <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
                    </button>

                    <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted-foreground/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pr-10 rounded-xl h-11"
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
                            type="submit"
                            className="w-full h-11 rounded-xl font-bold bg-primary hover:scale-[1.02] transition-transform"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                                </span>
                            ) : 'Sign in'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 border-t border-border/10 bg-muted/10 py-5 px-6">
                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" className="font-bold text-primary hover:underline">
                            Create Account
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
