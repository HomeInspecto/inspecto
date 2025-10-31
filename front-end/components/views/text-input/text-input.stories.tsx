import type { Meta, StoryObj } from '@storybook/react-native';
import Component from './text-input';
import { View } from 'react-native';
import { useState } from 'react';

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
    multiline: {
      control: 'boolean',
    },
    numberOfLines: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

// New: stateful playground so you can type into a single input
const PlaygroundComponent = () => {
  const [value, setValue] = useState('');
  return (
    <View style={{ gap: 16 }}>
      <Component value={value} placeholder="Type here..." onChangeText={setValue} />
    </View>
  );
};

export const Playground: Story = {
  render: () => <PlaygroundComponent />,
};

const VariationsComponent = () => {
  const [basic, setBasic] = useState('');
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [both, setBoth] = useState('');
  const [pw, setPw] = useState('');
  const [filled, setFilled] = useState('Filled input');

  return (
    <View style={{ gap: 16 }}>
      <Component value={basic} placeholder="Basic input" onChangeText={setBasic} />

      <Component
        value={left}
        placeholder="With left icon"
        leftIcon="search"
        onChangeText={setLeft}
      />

      <Component
        value={right}
        placeholder="With right icon"
        rightIcon="eye"
        onRightIconPress={() => {}}
        onChangeText={setRight}
      />

      <Component
        value={both}
        placeholder="With both icons"
        leftIcon="mail"
        rightIcon="checkmark"
        onChangeText={setBoth}
      />

      <Component
        value={pw}
        placeholder="Password input"
        leftIcon="lock-closed"
        rightIcon="eye"
        secureTextEntry
        onRightIconPress={() => {}}
        onChangeText={setPw}
      />

      <Component
        value={filled}
        placeholder="With value"
        leftIcon="person"
        onChangeText={setFilled}
      />
    </View>
  );
};

export const Variations: Story = {
  render: () => <VariationsComponent />,
};

const MultilineVariationsComponent = () => {
  const [multi, setMulti] = useState('');
  const [multiBox, setMultiBox] = useState('');
  const [multiMax, setMultiMax] = useState(
    'Multiline filled with Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  );

  return (
    <View style={{ gap: 16 }}>
      <Component value={multi} placeholder="Multiline input " multiline onChangeText={setMulti} />

      <View style={{ maxHeight: 200 }}>
        <Component
          value={multiBox}
          placeholder="Multiline with max height"
          multiline
          onChangeText={setMultiBox}
        />
      </View>

      <Component
        value={multiMax}
        placeholder="Multiline filled"
        multiline
        onChangeText={setMultiMax}
      />
    </View>
  );
};

export const MultilineVariations: Story = {
  render: () => <MultilineVariationsComponent />,
};
