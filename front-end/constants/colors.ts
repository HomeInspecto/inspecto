export const COLORS = {
  label: {
    onLight: {
      primary: '#6B6B6B',
      secondary: '#999999',
      tertiary: '#C3C3C3',
    },
    onDark: {
      primary: '#F3F3F3',
      secondary: '#888888',
      tertiary: 'rgba(243, 243, 243, 0.4)', // todo: turn to linear gradient and use react native linear gradient component in rendering the bg
    },
  },

  material: {
    primary: {
      fill: 'rgba(243, 243, 243, 0.8)',
      stroke: 'rgba(243, 243, 243, 0.8)',
    },
    secondary: {
      fill: 'rgba(128, 128, 128, 0.4)', // todo: linear gradient
      stroke: 'rgba(255,255,255,0.1)', // todo: linear gradient
    },
  },

  pageBackground: '#424245',

  severity: {
    critical: '#FF453A',
    medium: '#FFD60A',
    low: '#32D74B',
  },

  system: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
} as const;
