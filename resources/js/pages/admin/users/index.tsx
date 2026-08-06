import { Head, useForm } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash,
    Users,
    Shield,
    Check,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

interface User {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    roles: { id: number; name: string }[];
    permissions: { id: number; name: string }[];
    created_at: string;
}

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface IndexProps {
    users: User[];
    roles: Role[];
    permissions: Permission[];
    auth: {
        user: {
            id: number;
            name: string;
        };
    };
}

export default function Index({ users, roles, permissions, auth }: IndexProps) {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [editUserId, setEditUserId] = useState<number | null>(null);
    const [editRoleId, setEditRoleId] = useState<number | null>(null);

    // User Form
    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        bio: '',
        roles: [] as string[],
    });

    // Role Form
    const roleForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    // User Handlers
    const openCreateUserModal = () => {
        userForm.reset();
        userForm.clearErrors();
        setEditUserId(null);
        setIsUserOpen(true);
    };

    const openEditUserModal = (user: User) => {
        userForm.clearErrors();
        setEditUserId(user.id);
        userForm.setData({
            name: user.name,
            email: user.email,
            password: '', // Keep empty unless updating
            bio: user.bio || '',
            roles: user.roles.map((r) => r.name),
        });
        setIsUserOpen(true);
    };

    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editUserId) {
            userForm.put(admin.users.update({ user: editUserId }).url, {
                onSuccess: () => {
                    setIsUserOpen(false);
                    userForm.reset();
                },
            });
        } else {
            userForm.post(admin.users.store().url, {
                onSuccess: () => {
                    setIsUserOpen(false);
                    userForm.reset();
                },
            });
        }
    };

    const handleUserDelete = (user: User) => {
        if (user.id === auth.user.id) {
            alert('You cannot delete your own account!');

            return;
        }

        if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            userForm.delete(admin.users.destroy({ user: user.id }).url);
        }
    };

    const toggleUserRole = (roleName: string) => {
        const currentRoles = [...userForm.data.roles];
        const index = currentRoles.indexOf(roleName);

        if (index > -1) {
            currentRoles.splice(index, 1);
        } else {
            currentRoles.push(roleName);
        }

        userForm.setData('roles', currentRoles);
    };

    // Role Handlers
    const openCreateRoleModal = () => {
        roleForm.reset();
        roleForm.clearErrors();
        setEditRoleId(null);
        setIsRoleOpen(true);
    };

    const openEditRoleModal = (role: Role) => {
        roleForm.clearErrors();
        setEditRoleId(role.id);
        roleForm.setData({
            name: role.name,
            permissions: role.permissions.map((p) => p.name),
        });
        setIsRoleOpen(true);
    };

    const handleRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editRoleId) {
            roleForm.put(admin.roles.update({ role: editRoleId }).url, {
                onSuccess: () => {
                    setIsRoleOpen(false);
                    roleForm.reset();
                },
            });
        } else {
            roleForm.post(admin.roles.store().url, {
                onSuccess: () => {
                    setIsRoleOpen(false);
                    roleForm.reset();
                },
            });
        }
    };

    const handleRoleDelete = (role: Role) => {
        if (role.name === 'Super Admin') {
            alert('The Super Admin role cannot be deleted.');

            return;
        }

        if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
            roleForm.delete(admin.roles.destroy({ role: role.id }).url);
        }
    };

    const toggleRolePermission = (permName: string) => {
        const currentPerms = [...roleForm.data.permissions];
        const index = currentPerms.indexOf(permName);

        if (index > -1) {
            currentPerms.splice(index, 1);
        } else {
            currentPerms.push(permName);
        }

        roleForm.setData('permissions', currentPerms);
    };

    return (
        <>
            <Head title="Access Control Manager" />

            <div className="flex flex-col gap-6 p-6 pb-16">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Access Control Manager
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configure security definitions, assign system roles,
                            and govern permissions.
                        </p>
                    </div>
                    {activeTab === 'users' ? (
                        <Button onClick={openCreateUserModal} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add User
                        </Button>
                    ) : (
                        <Button onClick={openCreateRoleModal} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Role
                        </Button>
                    )}
                </div>

                {/* Tabs Selector */}
                <div className="flex gap-4 border-b border-sidebar-border/60">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-all ${
                            activeTab === 'users'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        Users
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {users.length}
                        </Badge>
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-all ${
                            activeTab === 'roles'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Shield className="h-4 w-4" />
                        Roles & Permissions
                        <Badge variant="secondary" className="ml-1 text-xs">
                            {roles.length}
                        </Badge>
                    </button>
                </div>

                {/* Users List Tab */}
                {activeTab === 'users' && (
                    <div className="overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-sidebar-border bg-muted/40 font-medium text-muted-foreground">
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Assigned Roles</th>
                                        <th className="p-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="p-8 text-center text-muted-foreground"
                                            >
                                                No users found. Click "Add User"
                                                to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="border-b border-sidebar-border/50 transition-colors hover:bg-muted/10"
                                            >
                                                <td className="p-4 font-semibold text-foreground">
                                                    <div className="flex flex-col">
                                                        <span>{user.name}</span>
                                                        {user.bio && (
                                                            <span className="mt-0.5 line-clamp-1 max-w-[300px] text-xs font-normal text-muted-foreground">
                                                                {user.bio}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground">
                                                    {user.email}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {user.roles.length ===
                                                        0 ? (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                No roles
                                                                assigned
                                                            </span>
                                                        ) : (
                                                            user.roles.map(
                                                                (role) => (
                                                                    <Badge
                                                                        key={
                                                                            role.id
                                                                        }
                                                                        className={
                                                                            role.name ===
                                                                            'Super Admin'
                                                                                ? 'border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/10'
                                                                                : 'border border-primary/20 bg-primary/10 text-primary hover:bg-primary/10'
                                                                        }
                                                                    >
                                                                        {
                                                                            role.name
                                                                        }
                                                                    </Badge>
                                                                ),
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditUserModal(
                                                                    user,
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
                                                        </Button>
                                                        {user.id !==
                                                            auth.user.id && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleUserDelete(
                                                                        user,
                                                                    )
                                                                }
                                                            >
                                                                <Trash className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Roles & Permissions Tab */}
                {activeTab === 'roles' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Roles List Card */}
                        <div className="flex flex-col overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm">
                            <div className="border-b border-sidebar-border bg-muted/20 p-4">
                                <h3 className="font-bold text-foreground">
                                    Available System Roles
                                </h3>
                            </div>
                            <div className="flex-1 divide-y divide-sidebar-border/50">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex items-center justify-between p-4 transition-colors hover:bg-muted/5"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-foreground">
                                                    {role.name}
                                                </span>
                                                {role.name ===
                                                    'Super Admin' && (
                                                    <Badge className="border border-red-500/20 bg-red-500/10 text-[10px] text-red-500 hover:bg-red-500/10">
                                                        Protected
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                Grants {role.permissions.length}{' '}
                                                capabilities / permissions.
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEditRoleModal(role)
                                                }
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground transition-colors hover:text-primary" />
                                            </Button>
                                            {role.name !== 'Super Admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleRoleDelete(role)
                                                    }
                                                >
                                                    <Trash className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Permissions Overview Card */}
                        <div className="flex flex-col overflow-hidden rounded-xl border border-sidebar-border/70 bg-card text-card-foreground shadow-sm">
                            <div className="flex items-center justify-between border-b border-sidebar-border bg-muted/20 p-4">
                                <h3 className="font-bold text-foreground">
                                    Dynamic System Permissions
                                </h3>
                                <Badge variant="secondary">
                                    {permissions.length} Total
                                </Badge>
                            </div>
                            <div className="max-h-[450px] flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {permissions.map((perm) => (
                                        <div
                                            key={perm.id}
                                            className="flex items-center gap-2.5 rounded-lg border border-sidebar-border/40 bg-muted/20 p-2"
                                        >
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs font-medium text-foreground">
                                                    {perm.name}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create/Edit User Dialog */}
                <Dialog open={isUserOpen} onOpenChange={setIsUserOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editUserId
                                    ? 'Modify User Profile'
                                    : 'Register New User'}
                            </DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleUserSubmit}
                            className="space-y-4 py-2"
                        >
                            <div className="space-y-1">
                                <Label htmlFor="user-name">Full Name</Label>
                                <Input
                                    id="user-name"
                                    value={userForm.data.name}
                                    onChange={(e) =>
                                        userForm.setData('name', e.target.value)
                                    }
                                    placeholder="Enter full name..."
                                />
                                <InputError message={userForm.errors.name} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="user-email">
                                    Email Address
                                </Label>
                                <Input
                                    id="user-email"
                                    type="email"
                                    value={userForm.data.email}
                                    onChange={(e) =>
                                        userForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="email@example.com"
                                />
                                <InputError message={userForm.errors.email} />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="user-password">
                                        Password
                                    </Label>
                                    {editUserId && (
                                        <span className="text-xs text-muted-foreground italic">
                                            (Leave blank to keep current)
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="user-password"
                                    type="password"
                                    value={userForm.data.password}
                                    onChange={(e) =>
                                        userForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder={
                                        editUserId
                                            ? '••••••••'
                                            : 'Minimum 8 characters'
                                    }
                                />
                                <InputError
                                    message={userForm.errors.password}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="user-bio">Bio (Optional)</Label>
                                <Input
                                    id="user-bio"
                                    value={userForm.data.bio}
                                    onChange={(e) =>
                                        userForm.setData('bio', e.target.value)
                                    }
                                    placeholder="Short profile description..."
                                />
                                <InputError message={userForm.errors.bio} />
                            </div>

                            <div className="space-y-2">
                                <Label>Assign System Roles</Label>
                                <div className="grid grid-cols-2 gap-2 rounded-lg border border-sidebar-border/60 bg-muted/10 p-3">
                                    {roles.map((role) => {
                                        const isChecked =
                                            userForm.data.roles.includes(
                                                role.name,
                                            );

                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() =>
                                                    toggleUserRole(role.name)
                                                }
                                                className={`flex items-center justify-between rounded-md border p-2 text-left text-xs transition-colors ${
                                                    isChecked
                                                        ? 'border-primary bg-primary/5 font-semibold text-foreground'
                                                        : 'border-sidebar-border bg-card text-muted-foreground hover:bg-muted/10'
                                                }`}
                                            >
                                                <span>{role.name}</span>
                                                {isChecked && (
                                                    <Check className="h-3 w-3 text-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError
                                    message={userForm.errors.roles as string}
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsUserOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={userForm.processing}
                                >
                                    {editUserId
                                        ? 'Save Changes'
                                        : 'Create User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Create/Edit Role Dialog */}
                <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editRoleId
                                    ? 'Configure Role'
                                    : 'Create Custom Role'}
                            </DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleRoleSubmit}
                            className="space-y-4 py-2"
                        >
                            <div className="space-y-1">
                                <Label htmlFor="role-name">
                                    Role Identifier Name
                                </Label>
                                <Input
                                    id="role-name"
                                    value={roleForm.data.name}
                                    onChange={(e) =>
                                        roleForm.setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Editor, Moderator, Designer"
                                    disabled={
                                        !!(
                                            editRoleId &&
                                            roleForm.data.name === 'Super Admin'
                                        )
                                    }
                                />
                                <InputError message={roleForm.errors.name} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>
                                        Bind Capabilities / Permissions
                                    </Label>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {roleForm.data.permissions.length}{' '}
                                        Selected
                                    </Badge>
                                </div>
                                <div className="max-h-[250px] overflow-y-auto rounded-lg border border-sidebar-border/60 bg-muted/10 p-3">
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                        {permissions.map((perm) => {
                                            const isChecked =
                                                roleForm.data.permissions.includes(
                                                    perm.name,
                                                );

                                            return (
                                                <button
                                                    key={perm.id}
                                                    type="button"
                                                    onClick={() =>
                                                        toggleRolePermission(
                                                            perm.name,
                                                        )
                                                    }
                                                    className={`flex items-center justify-between rounded-md border p-2 text-left text-xs transition-colors ${
                                                        isChecked
                                                            ? 'border-primary bg-primary/5 font-semibold text-foreground'
                                                            : 'border-sidebar-border bg-card text-muted-foreground hover:bg-muted/10'
                                                    }`}
                                                >
                                                    <span className="font-mono">
                                                        {perm.name}
                                                    </span>
                                                    {isChecked && (
                                                        <Check className="h-3 w-3 text-primary" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <InputError
                                    message={
                                        roleForm.errors.permissions as string
                                    }
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsRoleOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={roleForm.processing}
                                >
                                    {editRoleId
                                        ? 'Save Changes'
                                        : 'Create Role'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Users & Roles',
            href: '/dashboard/users-roles',
        },
    ],
};
