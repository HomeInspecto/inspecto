import type { Meta, StoryObj } from '@storybook/react-native';
import Component from './icon-button';

const meta: Meta<typeof Component> = {
  title: 'Components / Icon Button',
  component: Component,
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Primary: Story = {
  args: {
    color: 'primary',
    icon: 'pencil',
  },
};
