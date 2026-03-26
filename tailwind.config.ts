// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        dm: ['var(--font-dm)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
      },
      colors: {
        accent: '#7c6aff',
        'accent-hover': '#8f80ff',
      },
      animation: {
        'fade-in': 'fadeInUp 0.4s ease-out forwards',
        'skeleton': 'skeleton-pulse 1.5s ease-in-out infinite',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5)',
        'glow': '0 0 30px rgba(124,106,255,0.3)',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
