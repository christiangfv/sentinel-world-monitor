'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export function MockLoginButton() {
    const { mockSignIn } = useAuth()
    const [isLoading, setIsLoading] = useState(false)

    const handleMockLogin = async () => {
        try {
            setIsLoading(true)
            await mockSignIn()
        } catch (error) {
            console.error('Error during mock login:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleMockLogin}
            disabled={isLoading}
            className="text-xs text-[#8890A0] hover:text-[#D4B57A] underline underline-offset-4 transition-colors disabled:opacity-50"
        >
            {isLoading ? 'Iniciando...' : 'Entrar como Invitado (Modo Prueba)'}
        </button>
    )
}
