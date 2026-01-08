'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { Button } from '@/components/ui/Button'

export function PWAInstallPrompt() {
  const { canInstall, installPWA, updatePWA, updateAvailable, isOffline } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if ((canInstall || updateAvailable) && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [canInstall, updateAvailable, dismissed])

  if (dismissed) return null

  if (updateAvailable) {
    return (
      <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
        <div className="bg-[#1A1B22]/90 backdrop-blur-md border border-[#D4B57A]/40 rounded-xl p-3 shadow-2xl flex items-center gap-4 min-w-[280px]">
          <div className="bg-[#D4B57A]/20 p-2 rounded-lg">
            <span className="text-xl">🔄</span>
          </div>
          <div className="flex-1">
            <p className="text-[#E8E8F0] font-semibold text-xs tracking-tight">Actualización disponible</p>
            <p className="text-[#8890A0] text-[10px] mt-0.5">Nueva versión de Sentinel</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={updatePWA}
                className="text-[10px] bg-[#D4B57A] text-[#0D0E14] px-3 py-1 rounded-md font-bold hover:bg-[#B89A5A] transition-colors"
              >
                Actualizar ahora
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-[10px] text-[#8890A0] hover:text-[#E8E8F0] px-2"
              >
                Después
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (canInstall) {
    return (
      <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
        <div className="bg-[#1A1B22]/90 backdrop-blur-md border border-[#4A5060]/40 rounded-xl p-3 shadow-2xl flex items-center gap-4 min-w-[280px]">
          <div className="bg-[#4A5060]/20 p-2 rounded-lg">
            <span className="text-xl">📱</span>
          </div>
          <div className="flex-1">
            <p className="text-[#E8E8F0] font-semibold text-xs tracking-tight">Sentinel Web App</p>
            <p className="text-[#8890A0] text-[10px] mt-0.5">Instala para notificaciones</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={installPWA}
                className="text-[10px] bg-[#E8E8F0] text-[#0D0E14] px-3 py-1 rounded-md font-bold hover:bg-[#C8C8D0] transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-[10px] text-[#8890A0] hover:text-[#E8E8F0] px-2"
              >
                Ocultar
              </button>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-[#8890A0] hover:text-[#E8E8F0] p-1">
            ✕
          </button>
        </div>
      </div>
    )
  }

  if (isOffline) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-[#FBBF24]/10 border border-[#FBBF24]/30 rounded-lg px-4 py-2 flex items-center gap-2">
          <span>📡</span>
          <span className="text-[#FBBF24] text-sm">Modo offline</span>
        </div>
      </div>
    )
  }

  return null
}
