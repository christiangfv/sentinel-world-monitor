'use client'

import { useState } from 'react'
import { usePWA } from '@/lib/hooks/usePWA'
import { Button } from '@/components/ui/Button'

export function PWAInstallPrompt() {
  const { canInstall, installPWA, updatePWA, updateAvailable, isOffline } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 z-50 animate-slide-up">
        <div className="bg-[#1A1B22] border border-[#D4B57A]/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔄</span>
            <div className="flex-1">
              <p className="text-[#E8E8F0] font-medium text-sm">Actualización disponible</p>
              <p className="text-[#8890A0] text-xs mt-0.5">Nueva versión de Sentinel</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={updatePWA}>Actualizar</Button>
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>Después</Button>
          </div>
        </div>
      </div>
    )
  }

  if (canInstall) {
    return (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 z-50 animate-slide-up">
        <div className="bg-[#1A1B22] border border-[#4A5060]/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-xl">📱</span>
            <div className="flex-1">
              <p className="text-[#E8E8F0] font-medium text-sm">Instalar Sentinel</p>
              <p className="text-[#8890A0] text-xs mt-0.5">Acceso rápido y notificaciones</p>
            </div>
            <button onClick={() => setDismissed(true)} className="text-[#8890A0] hover:text-[#E8E8F0]">✕</button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={installPWA}>Instalar</Button>
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>No</Button>
          </div>
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
