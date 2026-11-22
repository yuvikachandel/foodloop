/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // forest ramp → Deep Emerald / Dark Forest Green (primary brand)
        forest: {
          50: '#F0F7F4',
          100: '#DCE7DD',
          200: '#B8D4C0',
          300: '#8FBCA0',
          400: '#5E9E7B',
          500: '#087F5B',
          600: '#064E3B',
          700: '#103B32',
          800: '#0A2E26',
          900: '#051F1A',
          950: '#021410',
        },
        // cream ramp → Warm Ivory / Soft Sage / Charcoal neutrals
        cream: {
          50: '#F8F5ED',
          100: '#F2EEE3',
          200: '#DCE7DD',
          300: '#C8D4C9',
          400: '#A8B5AC',
          500: '#8A9890',
          600: '#6B7872',
          700: '#4A554F',
          800: '#252B28',
          900: '#1A1F1C',
        },
        // accent ramp → Champagne Gold
        accent: {
          50: '#FBF8F0',
          100: '#F5EBD6',
          200: '#EBDDB8',
          300: '#DDC99A',
          400: '#D6B77A',
          500: '#D6B77A',
          600: '#C0A065',
          700: '#9E8350',
          800: '#7A6540',
          900: '#5C4D30',
        },
        // Explicit brand tokens for clarity
        burgundy: '#064E3B',
        wine: '#103B32',
        copper: '#D6B77A',
        champagne: '#D6B77A',
        espresso: '#252B28',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'premium': '0 2px 8px -2px rgba(6, 78, 59, 0.08), 0 4px 24px -4px rgba(6, 78, 59, 0.06)',
        'premium-lg': '0 8px 32px -8px rgba(6, 78, 59, 0.18), 0 2px 8px -2px rgba(6, 78, 59, 0.1)',
      },
    },
  },
  plugins: [],
};
