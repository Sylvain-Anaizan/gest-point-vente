import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout'; // Unified layout
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ShieldCheckIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    ShieldAlertIcon,
    KeyIcon,
    UsersIcon,
    CheckCircle2Icon
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { store, update as updateRole, destroy as destroyRole } from '@/actions/App/Http/Controllers/RoleController';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    roles: Role[];
    permissions: Permission[];
}

export default function Index({ roles, permissions }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const handleCreate = () => {
        post(store.url(), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast.success('Rôle créé avec succès');
            },
            onError: (errors) => {
                console.error('Role creation failed:', errors);
                toast.error('Erreur lors de la création du rôle');
            }
        });
    };

    const handleUpdate = () => {
        if (!editingRole) return;
        put(updateRole.url(editingRole.id), {
            onSuccess: () => {
                setEditingRole(null);
                reset();
                toast.success('Rôle mis à jour avec succès');
            },
            onError: (errors) => {
                console.error('Role update failed:', errors);
                toast.error('Erreur lors de la mise à jour');
            }
        });
    };

    const handleDelete = (role: Role) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) {
            destroy(destroyRole.url(role.id), {
                onSuccess: () => toast.success('Rôle supprimé'),
                onError: (err: { error?: string }) => toast.error(err.error || 'Erreur lors de la suppression'),
            });
        }
    };

    const togglePermission = (permName: string) => {
        const current = [...data.permissions];
        const index = current.indexOf(permName);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permName);
        }
        setData('permissions', current);
    };

    const openCreate = () => {
        reset();
        setIsCreateOpen(true);
    };

    const openEdit = (role: Role) => {
        setEditingRole(role);
        setData({
            name: role.name,
            permissions: role.permissions.map(p => p.name),
        });
    };

    return (
        <AppLayout>
            <Head title="Gestion des Rôles" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <ShieldCheckIcon className="size-6 text-indigo-600" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight dark:text-white">Rôles & Accès</h1>
                        </div>
                        <p className="text-muted-foreground max-w-2xl">
                            Définissez les niveaux d'accès et les responsabilités pour chaque membre de votre équipe Anaizan.
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <Button
                            onClick={openCreate}
                            className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex gap-2 shrink-0"
                        >
                            <PlusIcon className="size-5" />
                            Nouveau Rôle
                        </Button>
                        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border-indigo-500/20 shadow-2xl">
                            <DialogHeader className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b">
                                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                    <PlusIcon className="size-6 text-indigo-500" />
                                    Créer un Rôle
                                </DialogTitle>
                                <DialogDescription>
                                    Nommez le rôle et cochez les permissions associées.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider opacity-60">Nom du Rôle</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Responsable Stock"
                                        className="h-12 text-lg font-medium border-zinc-200 dark:border-zinc-800"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-sm text-destructive font-medium">{errors.name}</p>}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                                        <KeyIcon className="size-4" />
                                        Permissions Système
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {permissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className={cn(
                                                    "flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                                    data.permissions.includes(permission.name)
                                                        ? "border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/5"
                                                        : "border-zinc-100 dark:border-zinc-800"
                                                )}
                                                onClick={() => togglePermission(permission.name)}
                                            >
                                                <Checkbox
                                                    id={`perm-${permission.id}`}
                                                    checked={data.permissions.includes(permission.name)}
                                                    onCheckedChange={() => { }} // Controlled by div onClick
                                                    className="size-5 rounded-md border-zinc-300 pointer-events-none"
                                                />
                                                <span className="text-sm font-medium leading-none cursor-pointer select-none">
                                                    {permission.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="h-12 px-6 rounded-xl font-bold">Annuler</Button>
                                <Button onClick={handleCreate} disabled={processing} className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700">
                                    {processing ? 'Enregistrement...' : 'Créer le Rôle'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <Card key={role.id} className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl font-bold uppercase tracking-tight truncate">{role.name}</CardTitle>
                                        {role.name === 'admin' && (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-black text-[10px] uppercase">
                                                Système
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="flex items-center gap-1.5 font-medium">
                                        <CheckCircle2Icon className="size-3 text-emerald-500" />
                                        {role.permissions.length} permissions accordées
                                    </CardDescription>
                                </div>
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                    <ShieldAlertIcon className="size-5 text-zinc-400 dark:text-zinc-500" />
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4">
                                <div className="flex flex-wrap gap-1.5 min-h-[60px]">
                                    {role.permissions.slice(0, 6).map((perm) => (
                                        <Badge
                                            key={perm.id}
                                            variant="outline"
                                            className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 py-0.5"
                                        >
                                            {perm.name}
                                        </Badge>
                                    ))}
                                    {role.permissions.length > 6 && (
                                        <Badge variant="secondary" className="text-[10px] font-bold">
                                            +{role.permissions.length - 6} de plus
                                        </Badge>
                                    )}
                                    {role.permissions.length === 0 && (
                                        <p className="text-xs italic text-muted-foreground opacity-50">Aucune permission</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-2 border-t pt-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-9 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30"
                                            onClick={() => openEdit(role)}
                                        >
                                            <PencilIcon className="size-4" />
                                        </Button>
                                        {role.name !== 'admin' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-9 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                                                onClick={() => handleDelete(role)}
                                            >
                                                <TrashIcon className="size-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex -space-x-2">
                                        <div className="size-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 flex items-center justify-center">
                                            <UsersIcon className="size-3 text-zinc-500" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Edit Dialog */}
                <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
                    <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border-indigo-500/20 shadow-2xl">
                        <DialogHeader className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b">
                            <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                <PencilIcon className="size-6 text-indigo-500" />
                                Modifier: {editingRole?.name}
                            </DialogTitle>
                            <DialogDescription>
                                Ajustez les permissions système pour ce rôle.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-sm font-bold uppercase tracking-wider opacity-60">Nom du Rôle</Label>
                                <Input
                                    id="edit-name"
                                    className="h-12 text-lg font-medium border-zinc-200 dark:border-zinc-800"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    disabled={editingRole?.name === 'admin'}
                                />
                                {errors.name && <p className="text-sm text-destructive font-medium">{errors.name}</p>}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                                    <KeyIcon className="size-4" />
                                    Permissions Système
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {permissions.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className={cn(
                                                "flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                                                data.permissions.includes(permission.name)
                                                    ? "border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/5"
                                                    : "border-zinc-100 dark:border-zinc-800"
                                            )}
                                            onClick={() => togglePermission(permission.name)}
                                        >
                                            <Checkbox
                                                id={`edit-perm-${permission.id}`}
                                                checked={data.permissions.includes(permission.name)}
                                                onCheckedChange={() => { }} // Controlled by div onClick
                                                className="size-5 rounded-md border-zinc-300 pointer-events-none"
                                            />
                                            <span className="text-sm font-medium leading-none cursor-pointer select-none">
                                                {permission.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-zinc-50 dark:bg-zinc-900 border-t gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setEditingRole(null)} className="h-12 px-6 rounded-xl font-bold">Annuler</Button>
                            <Button onClick={handleUpdate} disabled={processing} className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700">
                                {processing ? 'Mise à jour...' : 'Sauvegarder les modifications'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
