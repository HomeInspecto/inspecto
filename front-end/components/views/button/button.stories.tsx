import type { Meta, StoryObj } from '@storybook/react-native';
import Button from './button';
import { View } from 'react-native';

const meta: Meta<typeof Button> = {
  title: 'Components / Button',
  component: Button,
  decorators: [
    Story => (
      <View style={{ padding: 16, maxWidth: 400 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    text: {
      control: 'text',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    icon: {
      control: 'select',
      options: [undefined, 'pencil', 'trash', 'plus', 'close', 'check', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Playground for testing combinations
export const Playground: Story = {
  args: {
    text: 'Button Text',
    color: 'primary',
    onPress: () => console.log('pressed'),
  },
};

// Show different button styles
export const Variations: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button text="Primary Button" color="primary" onPress={() => {}} />

      <Button text="Secondary Button" color="secondary" onPress={() => {}} />

      <Button text="With Icon" icon="plus" onPress={() => {}} />

      <Button text="Disabled Button" disabled onPress={() => {}} />
    </View>
  ),
};
