import type { Meta, StoryObj } from '@storybook/react-native';
import Component from './text';
import { View } from 'react-native';

const meta: Meta<typeof Component> = {
  title: 'Components / Text',
  component: Component,
  decorators: [
    Story => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Component>;

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <View style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
      <View style={{ gap: 12 }}>
        <Component variant="title1">Title 1</Component>
        <Component variant="title2">Title 2</Component>
        <Component variant="title3">Title 3</Component>
        <Component variant="headline">Headline</Component>
        <Component variant="body">Body</Component>
        <Component variant="callout">Callout</Component>
        <Component variant="subhead">Subhead</Component>
        <Component variant="footnote">Footnote</Component>
        <Component variant="caption1">Caption 1</Component>
        <Component variant="caption2">Caption 2</Component>
      </View>

      <View style={{ gap: 12 }}>
        <Component variant="title1" weight="emphasized">
          Title 1
        </Component>
        <Component variant="title2" weight="emphasized">
          Title 2
        </Component>
        <Component variant="title3" weight="emphasized">
          Title 3
        </Component>
        <Component variant="headline" weight="emphasized">
          Headline
        </Component>
        <Component variant="body" weight="emphasized">
          Body
        </Component>
        <Component variant="callout" weight="emphasized">
          Callout
        </Component>
        <Component variant="subhead" weight="emphasized">
          Subhead
        </Component>
        <Component variant="footnote" weight="emphasized">
          Footnote
        </Component>
        <Component variant="caption1" weight="emphasized">
          Caption 1
        </Component>
        <Component variant="caption2" weight="emphasized">
          Caption 2
        </Component>
      </View>
    </View>
  ),
};

// Color variants
export const ColorVariants: Story = {
  render: () => (
    <View style={{ display: 'flex', flexDirection: 'row', gap: 32 }}>
      <View style={{ gap: 12 }}>
        <Component weight="emphasized" color="on-dark-primary">
          On Dark Primary
        </Component>
        <Component weight="emphasized" color="on-dark-secondary">
          On Dark Secondary
        </Component>
        <Component weight="emphasized" color="on-dark-tertiary">
          On Dark Tertiary
        </Component>
      </View>
      <View style={{ gap: 12 }}>
        <Component weight="emphasized" color="on-light-primary">
          On Light Primary
        </Component>
        <Component weight="emphasized" color="on-light-secondary">
          On Light Secondary
        </Component>
        <Component weight="emphasized" color="on-light-tertiary">
          On Light Tertiary
        </Component>
      </View>
    </View>
  ),
};
