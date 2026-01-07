import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Colores principales
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Azul principal
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Colores de severidad
        severity: {
          1: '#22c55e', // Verde - Menor
          2: '#eab308', // Amarillo - Leve
          3: '#f97316', // Naranja - Moderado
          4: '#ef4444', // Rojo - Severo
        },
        // Colores de desastres
        disaster: {
          earthquake: '#FF6B6B',
          tsunami: '#4ECDC4',
          volcano: '#FF8C42',
          wildfire: '#F4722B',
          flood: '#1A535C',
          storm: '#6B5B95',
          landslide: '#8B4513',
        },
        // Fondo oscuro/claro
        background: {
          dark: '#0F172A',
          light: '#F8FAFC',
        },
        surface: {
          dark: '#1E293B',
          light: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
