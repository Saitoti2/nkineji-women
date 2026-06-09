import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Trash2, Edit, Save, X, UserPlus, Shield, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthStore } from '@/stores/authStore';
import { AdvancedFilters } from './AdvancedFilters';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL;

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    role_name?: string;
    is_active: boolean;
    created_at: string;
}

interface Role {
    id: string;
    name: string;
}

export function UsersManager() {
    const { accessToken } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [filters, setFilters] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        organisationId: '',
        is_active: true
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, v]) => v !== undefined)
                ) as any
            });
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${API_BASE}/admin/users?${queryParams}`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
                fetch(`${API_BASE}/admin/roles`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
            ]);

            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data.data || []);
            }
            if (rolesRes.ok) {
                const data = await rolesRes.json();
                setRoles(data.data || []);
            }
        } catch (error) {
            toast.error("Failed to load users data");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '', // Leave empty to keep unchanged
            role: user.role, // This might be role ID or name depending on backend. Using role from user obj.
            organisationId: '',
            is_active: user.is_active
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            role: '',
            organisationId: '',
            is_active: true
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload: any = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
        };

        if (formData.password) {
            payload.password = formData.password;
        }

        try {
            if (!accessToken) return;
            const url = editingUser ? `${API_BASE}/admin/users/${editingUser.id}` : `${API_BASE}/admin/users`;
            const method = editingUser ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingUser ? "User updated" : "User created");
                handleCancel();
                fetchData();
            } else {
                const error = await res.json();
                toast.error(error.error || "Action failed");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this user?")) return;
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                toast.success("User deleted");
                fetchData();
            } else {
                toast.error("Failed to delete user");
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 md:mb-16">
                <div className="text-center md:text-left max-w-2xl">
                    <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                        Access Control
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                        User <span className="text-primary">Administration</span>
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                        Manage administrative access, roles, and permissions for the Mara Bloom platform.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                    <Badge variant="secondary" className="px-4 py-1.5 rounded-xl font-bold bg-primary/5 text-primary border-none">
                        {users.length} Registered Personnel
                    </Badge>
                </div>
            </div>

            <AdvancedFilters
                onFilterChange={setFilters}
                searchPlaceholder="Search users by name, email or phone..."
                statusOptions={[
                    { label: 'Active', value: 'true' },
                    { label: 'Inactive', value: 'false' },
                ]}
                categoryOptions={roles.map(r => ({ label: r.name, value: r.id }))}
                showDateFilter={false}
                className="mb-8"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem]">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold font-display flex items-center gap-2">
                                {editingUser ? <Edit className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                                {editingUser ? 'Edit User' : 'New User'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="h-12 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="h-12 rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 234 567 890"
                                        className="h-12 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Key className="w-3 h-3" /> Password {editingUser && '(Leave blank to keep)'}
                                    </Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="h-12 rounded-xl"
                                        required={!editingUser}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Role
                                    </Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Select Role" />
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

                                <div className="flex gap-3 pt-4">
                                    {editingUser && (
                                        <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 h-12 rounded-xl">
                                            <X className="w-4 h-4 mr-2" /> Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" className="flex-grow h-12 rounded-xl bg-primary shadow-lg shadow-primary/20" disabled={submitting}>
                                        {submitting ? <Loader2 className="animate-spin mr-2" /> : (editingUser ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                                        {editingUser ? 'Save Changes' : 'Create User'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="border-none shadow-2xl bg-card rounded-[2.5rem] overflow-hidden">
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableHead className="py-4 sm:py-6 pl-4 sm:pl-8 font-bold text-xs sm:text-sm">User</TableHead>
                                                <TableHead className="font-bold text-xs sm:text-sm hidden md:table-cell">Role</TableHead>
                                                <TableHead className="font-bold text-xs sm:text-sm">Status</TableHead>
                                                <TableHead className="text-right pr-4 sm:pr-8 font-bold text-xs sm:text-sm">Manage</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id} className="group hover:bg-muted/30 border-border/40 transition-colors">
                                                    <TableCell className="py-4 sm:py-6 pl-4 sm:pl-8">
                                                        <div>
                                                            <p className="font-bold text-xs sm:text-sm">{user.name}</p>
                                                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        <Badge variant="outline" className="capitalize text-[9px] sm:text-[10px]">
                                                            {user.role_name || user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.is_active ? "default" : "secondary"} className="text-[9px] sm:text-[10px]">
                                                            {user.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-4 sm:pr-8 space-x-1 sm:space-x-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                                                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
