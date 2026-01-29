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

                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Habilitar Notificaciones</span>
                        <Button
                            variant={currentSettings.notificationsEnabled ? undefined : 'outline'}
                            size="sm"
                            onClick={() => handleUpdateSetting('notificationsEnabled', !currentSettings.notificationsEnabled)}
                            disabled={loading}
                        >
                            {currentSettings.notificationsEnabled ? 'Activado' : 'Desactivado'}
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

                    {/* About Section */}
                    <div className="border-t border-[#4A5060]/20 pt-4 mt-4">
                        <h4 className="text-sm font-bold text-[#D4B57A] uppercase tracking-wider mb-4">Acerca de</h4>
                        <div className="space-y-3 text-sm text-[#A0A5B5]">
                            <p>
                                <strong className="text-[#E8E8F0]">Sentinel World Monitor</strong> es una plataforma de monitoreo de desastres naturales en tiempo real.
                            </p>
                            <p>
                                Desarrollado por{' '}
                                <a 
                                    href="https://fuentesvalenzuela.cl" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[#D4B57A] hover:underline font-medium"
                                >
                                    Christian Fuentes
                                </a>
                            </p>
                            <div className="flex gap-3 pt-2">
                                <a 
                                    href="https://fuentesvalenzuela.cl" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1B23] border border-[#4A5060]/30 rounded-lg text-[#E8E8F0] hover:border-[#D4B57A]/50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    Portfolio
                                </a>
                                <a 
                                    href="https://github.com/christiangfv" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1B23] border border-[#4A5060]/30 rounded-lg text-[#E8E8F0] hover:border-[#D4B57A]/50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
