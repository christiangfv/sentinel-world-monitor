'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/lib/types';
import { updateUserSettings } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/Button';

interface OnboardingModalProps {
    user: User | null;
    onComplete: () => void;
}

const COUNTRIES = [
    "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador",
    "España", "Estados Unidos", "México", "Perú", "Uruguay", "Venezuela",
    "Global"
];

export function OnboardingModal({ user, onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [country, setCountry] = useState(user?.settings?.country || "Global");
    const [magnitude, setMagnitude] = useState(user?.settings?.minMagnitude || 4.5);
    const [notificationsEnabled, setNotificationsEnabled] = useState(user?.settings?.notificationsEnabled ?? true);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (user && !user.settings?.onboardingCompleted) {
            setIsOpen(true);
        }
    }, [user]);

    const handleFinish = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await updateUserSettings(user.uid, {
                ...user.settings,
                country,
                minMagnitude: magnitude,
                notificationsEnabled,
                onboardingCompleted: true
            });
            setIsOpen(false);
            onComplete();
        } catch (error) {
            console.error('Error during onboarding:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0D0E14]/90 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-[#1A1B22] border border-[#D4B57A]/20 rounded-3xl w-full max-w-lg shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="h-1 bg-[#4A5060]/20 flex">
                        <motion.div
                            className="h-full bg-[#D4B57A]"
                            animate={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    <div className="p-8 md:p-10">
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 bg-[#D4B57A]/10 rounded-full flex items-center justify-center text-4xl">
                                        🌍
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-[#E8E8F0] text-3xl font-bold mb-3 tracking-tight">Bienvenido a Sentinel</h2>
                                    <p className="text-[#8890A0] text-lg">Personalicemos tu experiencia. ¿Cuál es tu país principal de monitoreo?</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                                    {COUNTRIES.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCountry(c)}
                                            className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${country === c
                                                ? 'bg-[#D4B57A] text-[#0D0E14] border-[#D4B57A]'
                                                : 'bg-[#0D0E14]/50 text-[#8890A0] border-[#4A5060]/30 hover:border-[#D4B57A]/50'
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-6">
                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-[#D4B57A] hover:bg-[#C4A56A] text-[#0D0E14] rounded-2xl"
                                        onClick={() => setStep(2)}
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 bg-[#FACC15]/10 rounded-full flex items-center justify-center text-4xl">
                                        🚨
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-[#E8E8F0] text-3xl font-bold mb-3 tracking-tight">Umbral de Sismos</h2>
                                    <p className="text-[#8890A0] text-lg">¿A partir de qué magnitud quieres recibir notificaciones?</p>
                                </div>

                                <div className="pt-8 px-4">
                                    <div className="flex justify-between text-[#E8E8F0] font-bold text-2xl mb-4">
                                        <span>M{magnitude.toFixed(1)}</span>
                                        <span className="text-[#D4B57A]">
                                            {magnitude >= 6.5 ? 'Crítico' : magnitude >= 5.0 ? 'Aviso' : 'Informativo'}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="3"
                                        max="8.5"
                                        step="0.1"
                                        value={magnitude}
                                        onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                                        className="w-full h-3 bg-[#4A5060]/30 rounded-lg appearance-none cursor-pointer accent-[#D4B57A]"
                                    />
                                    <div className="flex justify-between text-[#8890A0] text-xs mt-3 font-medium uppercase tracking-widest">
                                        <span>M3.0 (Todo)</span>
                                        <span>M8.5 (Solo Desastres)</span>
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 text-lg font-bold border-[#4A5060]/50 text-[#8890A0] rounded-2xl"
                                        onClick={() => setStep(1)}
                                    >
                                        Atrás
                                    </Button>
                                    <Button
                                        className="flex-[2] h-14 text-lg font-bold bg-[#D4B57A] hover:bg-[#C4A56A] text-[#0D0E14] rounded-2xl"
                                        onClick={() => setStep(3)}
                                    >
                                        Continuar
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 bg-[#22C55E]/10 rounded-full flex items-center justify-center text-4xl">
                                        🔔
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-[#E8E8F0] text-3xl font-bold mb-3 tracking-tight">¡Todo Listo!</h2>
                                    <p className="text-[#8890A0] text-lg">Has configurado Sentinel para <strong>{country}</strong> con un umbral de <strong>M{magnitude.toFixed(1)}</strong>.</p>
                                </div>

                                <div className="bg-[#0D0E14]/50 border border-[#22C55E]/20 rounded-2xl p-6 my-6 text-center">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#4A5060]/20">
                                        <div className="text-left">
                                            <p className="text-[#E8E8F0] font-bold">Notificaciones</p>
                                            <p className="text-[#8890A0] text-xs">Recibir alertas en tiempo real</p>
                                        </div>
                                        <button
                                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${notificationsEnabled ? 'bg-[#22C55E]' : 'bg-[#4A5060]'}`}
                                        >
                                            <motion.div
                                                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                                                animate={{ x: notificationsEnabled ? 24 : 0 }}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-[#E8E8F0] text-sm">
                                        Has configurado Sentinel para <strong>{country}</strong>. Puedes cambiar esto en cualquier momento desde <strong>Configuración</strong>.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-[#22C55E] hover:bg-[#16A34A] text-[#0D0E14] rounded-2xl shadow-[0_10px_30px_rgba(34,197,94,0.3)]"
                                        onClick={handleFinish}
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : 'Finalizar Configuración'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
