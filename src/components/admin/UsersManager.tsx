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
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
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
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const [usersRes, rolesRes] = await Promise.all([
                fetch(`${API_BASE}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/admin/roles`, { headers: { 'Authorization': `Bearer ${token}` } })
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
            const token = localStorage.getItem('mara_bloom_auth_token');
            const url = editingUser ? `${API_BASE}/admin/users/${editingUser.id}` : `${API_BASE}/admin/users`;
            const method = editingUser ? 'PUT' : 'POST';

            // Ensure Admin.tsx logic: roles.map used role.name as value? 
            // Admin.tsx: value={role.name}
            // So role sent is name mostly.

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
        try {
            const token = localStorage.getItem('mara_bloom_auth_token');
            const res = await fetch(`${API_BASE}/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
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
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-display">User Management</h1>
                <Badge variant="outline" className="text-primary border-primary rounded-lg px-4 py-1">
                    {users.length} Active Users
                </Badge>
            </div>

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
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableHead className="py-6 pl-8 font-bold">User</TableHead>
                                            <TableHead className="font-bold">Role</TableHead>
                                            <TableHead className="font-bold">Status</TableHead>
                                            <TableHead className="text-right pr-8 font-bold">Manage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id} className="group hover:bg-muted/30 border-border/40 transition-colors">
                                                <TableCell className="py-6 pl-8">
                                                    <div>
                                                        <p className="font-bold">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {user.role_name || user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.is_active ? "default" : "secondary"}>
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-8 space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
