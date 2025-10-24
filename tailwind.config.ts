import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#4fd1c5',
          cyan: '#38b2ac',
          dark: '#0f172a',
          slate: '#1e293b',
        },
        light: {
          bg: '#f8fafc',
          card: '#ffffff',
          text: '#1e293b',
          muted: '#64748b',
          border: '#e2e8f0',
        },
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          text: '#f1f5f9',
          muted: '#94a3b8',
          border: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
