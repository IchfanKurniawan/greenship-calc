/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'mint-glow': '#D3FEAB',
        'deep-teal': '#1B4E4D',
        'jet-gray': '#272727',
        'amber-orange': '#FF9500',
      },
      borderRadius: {
        'card': '8px',
      },
    },
  },
  plugins: [],
}
