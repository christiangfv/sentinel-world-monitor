'use client';

import { useState, useEffect } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    updateAvailable: false,
    registration: null
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Detectar si la app está instalada
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;

      setPwaState(prev => ({
        ...prev,
        isInstalled: isStandalone || isInWebAppiOS
      }));
    };

    checkInstalled();

    // Escuchar cambios en el display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addListener(checkInstalled);

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPwaState(prev => ({
        ...prev,
        isInstallable: true
      }));
    };

    // Escuchar el evento appinstalled
    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false
      }));
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Verificar estado de conexión
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOffline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Estado inicial de conexión
    setPwaState(prev => ({ ...prev, isOffline: !navigator.onLine }));

    // Registrar service worker si existe
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setPwaState(prev => ({ ...prev, registration }));

        // Escuchar actualizaciones del service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setPwaState(prev => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });
      });
    }

    return () => {
      mediaQuery.removeListener(checkInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setPwaState(prev => ({
      ...prev,
      isInstallable: false,
      isInstalled: outcome === 'accepted'
    }));

    return outcome === 'accepted';
  };

  const updatePWA = () => {
    if (pwaState.registration?.waiting) {
      pwaState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const share = async (data: { title?: string; text?: string; url?: string }) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title || 'Sentinel - Monitoreo de Desastres',
          text: data.text,
          url: data.url || window.location.href
        });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
    return false;
  };

  return {
    ...pwaState,
    installPWA,
    updatePWA,
    share,
    canInstall: pwaState.isInstallable && !!deferredPrompt,
    canShare: !!navigator.share
  };
}
