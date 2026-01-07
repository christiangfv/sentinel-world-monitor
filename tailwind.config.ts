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
        // Paleta moderna y profesional
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Azul cielo moderno
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Colores de severidad mejorados
        severity: {
          1: '#10b981', // Verde esmeralda
          2: '#f59e0b', // Ámbar
          3: '#f97316', // Naranja vibrante
          4: '#ef4444', // Rojo coral
        },
        // Colores de desastres con mejor contraste
        disaster: {
          earthquake: '#dc2626', // Rojo más profesional
          tsunami: '#0891b2', // Cyan profesional
          volcano: '#ea580c', // Naranja rojizo
          wildfire: '#c2410c', // Rojo anaranjado
          flood: '#0369a1', // Azul profundo
          storm: '#7c3aed', // Violeta
          landslide: '#92400e', // Marrón rojizo
        },
        // Gradientes de fondo modernos
        background: {
          dark: '#0f172a',
          light: '#fafafa',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        surface: {
          dark: '#1e293b',
          light: '#ffffff',
          elevated: '#f8fafc',
        },
        // Colores de estado
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(14, 165, 233, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 25px rgba(0, 0, 0, 0.12)',
        'large': '0 8px 40px rgba(0, 0, 0, 0.16)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
