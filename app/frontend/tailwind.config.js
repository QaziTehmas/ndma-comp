/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkThemeText: '#E0E0E0',
        lightThemeText: '#1A1A1A',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: {
          DEFAULT: 'var(--bg-primary)',
          light: 'var(--bg-secondary)',
          lighter: 'var(--bg-tertiary)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          sidebar: 'var(--sidebar-border)',
        },
        primary: {
          DEFAULT: 'var(--primary-color)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        secondary: {
          DEFAULT: '#8b5cf6', // Violet 500 - keeping static for now or can make dynamic if needed
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        risk: {
          low: 'var(--status-low)',
          medium: 'var(--status-medium)',
          high: 'var(--status-high)',
          critical: 'var(--status-critical)',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'neon': 'var(--shadow-neon)',
      }
    },
  },
  plugins: [],
}
