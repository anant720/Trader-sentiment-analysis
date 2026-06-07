/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0056B3',
          dark: '#003D80',
          light: '#EBF2FF',
          muted: '#3A7BD5',
        },
        surface: {
          light: '#FFFFFF',
          grey: '#F0F2F5',
          dark: '#000000',
          card: '#1C1C1E',
          darkgrey: '#2C2C2E',
        },
        accent: {
          pvc: '#B8860B',    // Gold — Pro Vice Chancellor
          vc: '#B71C1C',     // Crimson — Vice Chancellor
          dean: '#4E342E',   // Mahogany — Dean
          hod: '#0056B3',    // Blue — HOD
        },
        rank: {
          1: '#B8860B',
          2: '#B71C1C',
          3: '#4E342E',
          4: '#0056B3',
          5: '#37474F',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Roboto',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '12px',
        chip: '20px',
        sheet: '20px 20px 0 0',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-pressed': '0 0px 1px rgba(0,0,0,0.06)',
        sheet: '0 -4px 24px rgba(0,0,0,0.12)',
        fab: '0 4px 14px rgba(0,86,179,0.4)',
      },
      transitionDuration: {
        fast: '150ms',
        standard: '250ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
        'nav-h': '56px',
        'header-h': '112px',
      },
      zIndex: {
        nav: 50,
        header: 40,
        sheet: 60,
        modal: 70,
        toast: 80,
      },
    },
  },
  plugins: [],
};
