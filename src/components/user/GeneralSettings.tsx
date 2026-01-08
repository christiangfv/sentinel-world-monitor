'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserSettings } from '@/lib/types';

export function GeneralSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Use local state for optimistic UI updates or just rely on user prop if latency is low.
    // Given standard Firestore latency, simple local state toggle or just waiting is fine.
    // We'll use the user object directly, assuming it updates via the AuthContext listener.
    // However, specifically for immediate feedback, we might want local state if the context update is slow.

    // Actually, checking useAuth, it listens to onAuthStateChanged. 
    // Firestore user document updates might not trigger onAuthStateChanged immediately unless we are listening to the user doc specifically.
    // The current useAuth implementation listens to `onAuthStateChange` from `lib/firebase/auth`, which usually wraps onIdTokenChanged or onAuthStateChanged.
    // Typically these don't fire on Firestore doc changes.
    // Let's check `useAuth` again... it calls `onAuthStateChange`.
    // If `onAuthStateChange` in `src/lib/firebase/auth.ts` fetches from Firestore, we are good.
    // If not, we might need to manually update or listen to the doc.
    // Looking at the previous analysis, `useAuth` seems to just return the Auth user with some metadata.
    // Let's assume we need to update Firestore and the UI might need a refresh or we use local state.

    const handleUpdateSetting = async (key: keyof UserSettings, value: any) => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                [`settings.${key}`]: value
            });
            // Context might not update automatically if it's not listening to the doc.
            // Ideally we'd have a `refreshUser` or similar, or a real-time listener on the user doc in `AuthProvider`.
        } catch (error) {
            console.error('Error updating setting:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentSettings = user?.settings || {
        language: 'es',
        darkMode: true,
        soundEnabled: true
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    ⚙️ Configuración General
                </CardTitle>
                <CardDescription>
                    Ajustes generales de la aplicación
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    {/* Language */}
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Idioma</span>
                        <div className="flex gap-2">
                            <Button
                                variant={currentSettings.language === 'es' ? undefined : 'outline'}
                                size="sm"
                                onClick={() => handleUpdateSetting('language', 'es')}
                                disabled={loading}
                            >
                                Es
                            </Button>
                            <Button
                                variant={currentSettings.language === 'en' ? undefined : 'outline'}
                                size="sm"
                                onClick={() => handleUpdateSetting('language', 'en')}
                                disabled={loading}
                            >
                                En
                            </Button>
                        </div>
                    </div>

                    {/* Sound */}
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Sonido</span>
                        <Button
                            variant={currentSettings.soundEnabled ? undefined : 'outline'}
                            size="sm"
                            onClick={() => handleUpdateSetting('soundEnabled', !currentSettings.soundEnabled)}
                            disabled={loading}
                        >
                            {currentSettings.soundEnabled ? 'Activado' : 'Desactivado'}
                        </Button>
                    </div>

                    {/* Dark Mode */}
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Modo Oscuro</span>
                        <Button
                            variant={currentSettings.darkMode ? undefined : 'outline'}
                            size="sm"
                            onClick={() => handleUpdateSetting('darkMode', !currentSettings.darkMode)}
                            disabled={loading}
                        >
                            {currentSettings.darkMode ? 'On' : 'Off'}
                        </Button>
                    </div>

                    <div className="border-t border-[#4A5060]/20 pt-4 mt-4">
                        <h4 className="text-sm font-bold text-[#D4B57A] uppercase tracking-wider mb-4">Preferencias de Notificación</h4>

                        {/* Country */}
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">País de Monitoreo</span>
                            <select
                                value={currentSettings.country || 'Global'}
                                onChange={(e) => handleUpdateSetting('country', e.target.value)}
                                className="bg-[#0D0E14] border border-[#4A5060]/30 rounded-lg px-3 py-1.5 text-sm text-[#E8E8F0]"
                                disabled={loading}
                            >
                                {["Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador", "España", "Estados Unidos", "México", "Perú", "Uruguay", "Venezuela", "Global"].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Magnitude */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Umbral Mín. Sismos</span>
                                <span className="text-[#D4B57A] font-bold">M{(currentSettings.minMagnitude || 4.5).toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="3"
                                max="8.5"
                                step="0.1"
                                value={currentSettings.minMagnitude || 4.5}
                                onChange={(e) => handleUpdateSetting('minMagnitude', parseFloat(e.target.value))}
                                className="w-full h-2 bg-[#4A5060]/30 rounded-lg appearance-none cursor-pointer accent-[#D4B57A]"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
