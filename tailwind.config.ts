import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          muted: 'var(--primary-muted)',
          subtle: 'var(--primary-subtle)',
        },
        text: {
          DEFAULT: 'var(--text-default)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        pipe: {
          prospect: 'var(--pipe-prospect)',
          contacted: 'var(--pipe-contacted)',
          replied: 'var(--pipe-replied)',
          followup: 'var(--pipe-followup)',
          proposal: 'var(--pipe-proposal)',
          won: 'var(--pipe-won)',
          lost: 'var(--pipe-lost)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        'sm-token': 'var(--shadow-sm)',
        'md-token': 'var(--shadow-md)',
        'lg-token': 'var(--shadow-lg)',
        'glow-primary': 'var(--glow-primary)',
        'glow-primary-sm': 'var(--glow-primary-sm)',
        'glow-success': 'var(--glow-success)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      transitionDuration: {
        instant: '80ms',
        fast: '150ms',
        base: '220ms',
        slow: '350ms',
        enter: '400ms',
      },
    },
  },
  plugins: [],
}

export default config
