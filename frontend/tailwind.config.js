/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#0F1216',
          900: '#14171C',
          800: '#1B1F26',
          700: '#242933',
          600: '#323847',
        },
        headlight: {
          400: '#F6C05C',
          500: '#F2A93B',
          600: '#D98F26',
        },
        taillight: {
          400: '#EF6B4A',
          500: '#E4572E',
          600: '#C0451F',
        },
        mist: {
          100: '#F5F6F8',
          300: '#C7CDD6',
          500: '#8B93A1',
        },
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grille-fade': 'linear-gradient(180deg, rgba(242,169,59,0.10) 0%, rgba(15,18,22,0) 60%)',
      },
      letterSpacing: {
        widest2: '0.2em',
      },
    },
  },
  plugins: [],
};
