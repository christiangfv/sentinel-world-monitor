'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';
import { useNotificationSettings } from '@/lib/hooks/useNotifications';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

export function SystemHealth() {
    const { enabled: notificationsEnabled, permission } = useNotificationSettings();
    const [apiStatus, setApiStatus] = useState<'active' | 'inactive' | 'checking'>('checking');
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    useEffect(() => {
        async function checkApi() {
            try {
                setApiStatus('checking');
                const db = getFirestore();
                // Check firestore connection by a simple fetch
                // We can fetch 1 event just to see if we can read
                const q = query(collection(db, 'events'), limit(1));
                await getDocs(q);
                setApiStatus('active');
                setLastCheck(new Date());
            } catch (e) {
                console.error('System health check failed:', e);
                setApiStatus('inactive');
            }
        }

        checkApi();
        // Refresh every 5 minutes
        const interval = setInterval(checkApi, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: 'active' | 'inactive' | 'checking') => {
        switch (status) {
            case 'active': return <Badge variant="success">Activo</Badge>;
            case 'inactive': return <Badge variant="danger">Error</Badge>;
            case 'checking': return <Badge variant="secondary">...</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    ⚙️ Estado del Sistema
                </CardTitle>
                <CardDescription>
                    Información del servicio
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Conexión API</span>
                        {getStatusBadge(apiStatus)}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Notificaciones Push</span>
                        {notificationsEnabled ? (
                            <Badge variant="success">Activadas</Badge>
                        ) : permission === 'denied' ? (
                            <Badge variant="danger">Bloqueadas</Badge>
                        ) : (
                            <Badge variant="secondary">Inactivas</Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Última comprobación</span>
                        <span className="text-xs text-muted-foreground">
                            {lastCheck ? lastCheck.toLocaleTimeString() : '-'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
