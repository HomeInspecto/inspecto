import type { Preview } from '@storybook/react-native';

const preview: Preview = {
  parameters: {
    backgrounds: {
      options: {
        // 👇 Default options
        dark: { name: 'Dark', value: '#424245' },
        light: { name: 'Light', value: '#F7F9F2' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
