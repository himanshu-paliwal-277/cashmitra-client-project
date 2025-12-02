/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#4C6FFF',
          light: '#7B93FF',
          dark: '#3A56CC',
          50: '#F0F4FF',
          100: '#E0E9FF',
          200: '#C7D7FF',
          300: '#A3BFFF',
          400: '#7B93FF',
          500: '#4C6FFF',
          600: '#3A56CC',
          700: '#2D4399',
          800: '#233366',
          900: '#1A2633',
          DEFAULT: '#4C6FFF',
        },
        accent: {
          main: '#00C853',
          light: '#5DFC82',
          dark: '#00A142',
          50: '#E8F8F0',
          100: '#C8F0D8',
          200: '#9DE8B8',
          300: '#6EDF95',
          400: '#42D674',
          500: '#00C853',
          600: '#00A142',
          700: '#007A32',
          800: '#005423',
          900: '#002E14',
          DEFAULT: '#00C853',
        },
        warning: {
          main: '#FFB300',
          light: '#FFD54F',
          dark: '#FF8F00',
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFB300',
          600: '#FF8F00',
          700: '#FF6F00',
          800: '#E65100',
          900: '#BF360C',
          DEFAULT: '#FFB300',
        },
        error: {
          main: '#E53935',
          light: '#EF5350',
          dark: '#C62828',
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#EF5350',
          500: '#E53935',
          600: '#D32F2F',
          700: '#C62828',
          800: '#B71C1C',
          900: '#8B0000',
          DEFAULT: '#E53935',
        },
        success: {
          main: '#00C853',
          light: '#5DFC82',
          dark: '#00A142',
          50: '#E8F8F0',
          100: '#C8F0D8',
          200: '#9DE8B8',
          300: '#6EDF95',
          400: '#42D674',
          500: '#00C853',
          600: '#00A142',
          700: '#007A32',
          800: '#005423',
          900: '#002E14',
          DEFAULT: '#00C853',
        },
        info: {
          main: '#2196F3',
          light: '#64B5F6',
          dark: '#1976D2',
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
          DEFAULT: '#2196F3',
        },
        grey: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        background: {
          default: '#FFFFFF',
          paper: '#FAFAFA',
          grey: '#F5F5F5',
          primary: '#FFFFFF',
          secondary: '#F5F5F5',
        },
        border: {
          primary: '#E0E0E0',
          secondary: '#EEEEEE',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
          disabled: '#BDBDBD',
          hint: '#9E9E9E',
        },
      },
      fontFamily: {
        sans: [
          'Manrope',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem', // 48px
        '6xl': '3.75rem', // 60px
      },
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
      },
      spacing: {
        0: '0',
        1: '0.25rem', // 4px
        2: '0.5rem', // 8px
        3: '0.75rem', // 12px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        8: '2rem', // 32px
        10: '2.5rem', // 40px
        12: '3rem', // 48px
        16: '4rem', // 64px
        20: '5rem', // 80px
        24: '6rem', // 96px
        32: '8rem', // 128px
        40: '10rem', // 160px
        48: '12rem', // 192px
        56: '14rem', // 224px
        64: '16rem', // 256px
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem', // 2px
        base: '0.25rem', // 4px
        md: '0.375rem', // 6px
        lg: '0.5rem', // 8px
        xl: '0.75rem', // 12px
        '2xl': '1rem', // 16px
        '3xl': '1.5rem', // 24px
        full: '9999px',
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      zIndex: {
        hide: '-1',
        auto: 'auto',
        base: '0',
        docked: '10',
        dropdown: '1000',
        sticky: '1100',
        banner: '1200',
        overlay: '1300',
        modal: '1400',
        popover: '1500',
        skipLink: '1600',
        toast: '1700',
        tooltip: '1800',
      },
      transitionDuration: {
        fastest: '75ms',
        faster: '100ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms',
        slowest: '1000ms',
      },
      transitionTimingFunction: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
