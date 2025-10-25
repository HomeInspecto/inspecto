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
      tertiary: 'linear-gradient(0deg, #5E5E5E 24%, #FFFFFF 20%)',
    },
  },

  material: {
    primary: {
      fill: 'rgba(243, 243, 243, 0.8)',
      stroke: 'rgba(243, 243, 243, 0.8)',
    },
    secondary: {
      fill: ['rgba(128, 128, 128, 0.4)', 'rgba(0, 0, 0, 0.12)'],
      stroke:
        'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 41%, rgba(255,255,255,0) 57%, rgba(255,255,255,0.1) 100%)',
    },
  },

  system: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
} as const;
