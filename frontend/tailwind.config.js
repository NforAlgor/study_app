/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0F14',
          soft: '#1A1D25',
          muted: '#2C3040',
        },
        accent: {
          DEFAULT: '#7C6FFF',
          hover: '#9589FF',
          light: '#EBE9FF',
        },
        emerald: {
          ssp: '#10C4A0',
        },
        surface: {
          DEFAULT: '#F5F4FC',
          card: '#FFFFFF',
          border: '#E8E6F5',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      boxShadow: {
        card: '0 2px 20px rgba(124,111,255,0.08)',
        glow: '0 0 30px rgba(124,111,255,0.2)',
      }
    },
  },
  plugins: [],
}