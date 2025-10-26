import { type Preview } from '@storybook/react-native';
import { View } from 'react-native';

const preview: Preview = {
  decorators: [
    (Story, c) => (
      <View style={{ padding: 24, flex: 1, backgroundColor: '#424245' }}>
        <Story />
      </View>
    ),
  ],
};

export default preview;
