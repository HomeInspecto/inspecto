import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { useState } from 'react';
import { RadioGroup } from './radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components / Radio Group',
  component: RadioGroup,
  decorators: [
    Story => (
      <View style={{ padding: 16, maxWidth: 400 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const OPTIONS = [
  { name: 'First option', value: 'a' },
  { name: 'Second option', value: 'b' },
  { name: 'Third option', value: 'c' },
  { name: 'Fourth option', value: 'd' },
];

const NoneSelectedComponent = () => {
  const [value, setValue] = useState<string>(''); // none selected
  return <RadioGroup value={value} onValueChange={setValue} options={OPTIONS} />;
};

export const NoneSelected: Story = {
  render: () => <NoneSelectedComponent />,
};

const OneSelectedComponent = () => {
  const [value, setValue] = useState<string>('b'); // preselect second option
  return <RadioGroup value={value} onValueChange={setValue} options={OPTIONS} />;
};

export const OneSelected: Story = {
  render: () => <OneSelectedComponent />,
};
