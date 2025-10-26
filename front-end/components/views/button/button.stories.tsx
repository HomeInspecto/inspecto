import type { Meta, StoryObj } from '@storybook/react-native';
import Button from './button';

const meta: Meta<typeof Button> = {
  title: 'Components / Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    color: 'primary',
    text: 'Press',
  },
};
