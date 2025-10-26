import type { Meta, StoryObj } from '@storybook/react-native';
import Component from './text-input';

const meta: Meta<typeof Component> = {
  title: 'Components / Text input',
  component: Component,
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Primary: Story = {
  args: {
    leftIcon: 'search',
    rightIcon: 'add',
  },
};
