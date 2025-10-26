import type { Meta, StoryObj } from '@storybook/react-native';
import Component from './text';

const meta: Meta<typeof Component> = {
  title: 'Components / Text',
  component: Component,
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Primary: Story = {
  args: {
    variant: 'title1',
    color: 'default',
    children: 'Title 1',
  },
};
