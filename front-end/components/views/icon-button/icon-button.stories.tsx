import type { Meta, StoryObj } from '@storybook/react-native';
import Component from './icon-button';
import { View } from 'react-native';

const meta: Meta<typeof Component> = {
  title: 'Components / Icon Button',
  component: Component,
  decorators: [
    Story => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    icon: {
      control: 'select',
      options: ['pencil', 'trash', 'plus', 'close', 'check', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

// Playground for testing combinations
export const Playground: Story = {
  args: {
    icon: 'pencil',
    size: 'md',
    color: 'primary',
    onPress: () => console.log('pressed'),
  },
};

// Show all sizes
export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <Component size="sm" icon="pencil" onPress={() => {}} />
      <Component size="md" icon="pencil" onPress={() => {}} />
      <Component size="lg" icon="pencil" onPress={() => {}} />
    </View>
  ),
};

// Show all colors
export const Colors: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Component color="primary" icon="pencil" onPress={() => {}} />
      <Component color="secondary" icon="pencil" onPress={() => {}} />
    </View>
  ),
};

// Show states (normal vs disabled)
export const States: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Component icon="pencil" onPress={() => {}} />
      <Component icon="pencil" onPress={() => {}} disabled />
    </View>
  ),
};
