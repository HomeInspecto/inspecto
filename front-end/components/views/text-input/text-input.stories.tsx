import type { Meta, StoryObj } from '@storybook/react-native';
import Component from './text-input';
import { View } from 'react-native';

const meta: Meta<typeof Component> = {
  title: 'Components / Text Input',
  component: Component,
  decorators: [
    Story => (
      <View style={{ padding: 16, maxWidth: 400 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    leftIcon: {
      control: 'select',
      options: [undefined, 'search', 'mail', 'person', 'lock-closed'],
    },
    rightIcon: {
      control: 'select',
      options: [undefined, 'eye', 'eye-off', 'close-circle', 'checkmark'],
    },
    value: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    secureTextEntry: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

// Playground for testing different combinations
export const Playground: Story = {
  args: {
    value: '',
    placeholder: 'Enter text...',
  },
};

// Different variations showcase
export const Variations: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Component value="" placeholder="Basic input" />

      <Component value="" placeholder="With left icon" leftIcon="search" />

      <Component
        value=""
        placeholder="With right icon"
        rightIcon="eye"
        onRightIconPress={() => {}}
      />

      <Component value="" placeholder="With both icons" leftIcon="mail" rightIcon="checkmark" />

      <Component
        value=""
        placeholder="Password input"
        leftIcon="lock-closed"
        rightIcon="eye"
        secureTextEntry
        onRightIconPress={() => {}}
      />

      <Component value="Filled input" placeholder="With value" leftIcon="person" />
    </View>
  ),
};
