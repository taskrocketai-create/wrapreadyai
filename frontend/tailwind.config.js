/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:        '#0B0F14',
          surface:   '#111827',
          border:    '#1F2937',
          muted:     '#374151',
          text:      '#E5E7EB',
          secondary: '#9CA3AF',
          subtle:    '#6B7280',
          dim:       '#4B5563',
          selected:  '#0F2027',
        },
        teal: {
          DEFAULT: '#14B8A6',
          dark:    '#0F766E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
