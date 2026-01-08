'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';

export function AccountSettings() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', {
            month: 'long',
            year: 'numeric'
        }).format(new Date(date));
    };

    const handleDeleteAccount = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            return;
        }
        setLoading(true);
        // TODO: Implement actual delete account logic function in auth service if not exists
        // For now we just alert as it might require a cloud function to clean up properly
        alert('Funcionalidad de eliminar cuenta pendiente de implementación segura');
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    👤 Cuenta
                </CardTitle>
                <CardDescription>
                    Información de tu cuenta de usuario
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{user.email}</div>
                    </div>

                    <div>
                        <div className="text-sm text-muted-foreground">Nombre</div>
                        <div className="font-medium">{user.displayName || 'No especificado'}</div>
                    </div>

                    <div>
                        <div className="text-sm text-muted-foreground">Miembro desde</div>
                        <div className="font-medium">
                            {user.createdAt ? formatDate(user.createdAt) : 'Desconocido'}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-muted-foreground">ID de Usuario</div>
                        <div className="font-mono text-xs text-muted-foreground">{user.uid}</div>
                    </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleDeleteAccount}
                        disabled={loading}
                    >
                        Eliminar Cuenta
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
