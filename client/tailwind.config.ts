import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0284c7', // Sky 600 - Trust, Calm
        secondary: '#6366f1', // Indigo 500 - Tech accent
        background: '#f8fafc', // Slate 50 - Clinical clean
        surface: '#ffffff', // White
        text: {
          main: '#0f172a', // Slate 900
          muted: '#64748b', // Slate 500
        },
        success: '#10b981', // Emerald 500
        warning: '#f59e0b', // Amber 500
        error: '#ef4444', // Red 500
      },
      fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
        heading: ['Figtree', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        'floating': '0 8px 30px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
