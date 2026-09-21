/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        calc: {
          bg: 'hsl(var(--color-app-bg) / <alpha-value>)',
          surface: 'hsl(var(--color-surface) / <alpha-value>)',
          secondary: 'hsl(var(--color-surface-secondary) / <alpha-value>)',
          elevated: 'hsl(var(--color-surface-elevated) / <alpha-value>)',

          // Text hierarchy
          text: {
            primary: 'hsl(var(--color-text-primary) / <alpha-value>)',
            secondary: 'hsl(var(--color-text-secondary) / <alpha-value>)',
            muted: 'hsl(var(--color-text-muted) / <alpha-value>)',
          },

          // Borders
          border: {
            subtle: 'hsl(var(--color-border-subtle) / <alpha-value>)',
            strong: 'hsl(var(--color-border-strong) / <alpha-value>)',
          },

          // Brand accents
          accent: {
            DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
            hover: 'hsl(var(--color-accent-hover) / <alpha-value>)',
            subtle: 'hsl(var(--color-accent-subtle))',
          },

          // Button Variant Colors
          key: {
            number: 'hsl(var(--color-key-number) / <alpha-value>)',
            'number-hover': 'hsl(var(--color-key-number-hover) / <alpha-value>)',
            operator: 'hsl(var(--color-key-operator) / <alpha-value>)',
            'operator-hover': 'hsl(var(--color-key-operator-hover) / <alpha-value>)',
            action: 'hsl(var(--color-key-action) / <alpha-value>)',
            'action-hover': 'hsl(var(--color-key-action-hover) / <alpha-value>)',
            equals: 'hsl(var(--color-key-equals) / <alpha-value>)',
            'equals-hover': 'hsl(var(--color-key-equals-hover) / <alpha-value>)',
          },

          // Feedback states
          error: 'hsl(var(--color-error) / <alpha-value>)',
          warning: 'hsl(var(--color-warning) / <alpha-value>)',
          success: 'hsl(var(--color-success) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'calc-sm': '8px',
        'calc-md': '12px',
        'calc-lg': '16px',
        'calc-button': '16px',
        'calc-shell': '32px',
      },
      boxShadow: {
        'calc-shell': 'var(--shadow-shell)',
        'calc-display': 'var(--shadow-display)',
        'calc-button': 'var(--shadow-button)',
        'calc-button-active': 'var(--shadow-button-active)',
        'calc-equals': 'var(--shadow-equals)',
      },
      screens: {
        'xs': '360px',
      },
    },
  },
  plugins: [],
};
