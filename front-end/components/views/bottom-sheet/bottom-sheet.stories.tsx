import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { useRef } from 'react';
import Sheet, { BottomSheetRef } from './bottom-sheet';
import Button from '../button/button';
import Text from '../text/text';

const meta: Meta<typeof Sheet> = {
  title: 'Components / Bottom Sheet',
  component: Sheet,
  decorators: [
    Story => (
      <View style={{ flex: 1, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

const PlaygroundComponent = () => {
  const ref = useRef<BottomSheetRef | null>(null);
  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: 12, gap: 4 }}>
        <Button text="Expand" onPress={() => ref.current?.expand()} />
        <Button text="Collapse" onPress={() => ref.current?.collapse()} />
        <Button text="Snap to End" onPress={() => ref.current?.snapToIndex(2)} />
      </View>

      <Sheet ref={ref}>
        <View>
          <Text style={{ marginBottom: 8 }}>This is sample sheet content.</Text>
          <Text>Put any React node(s) here — lists, forms, images, etc.</Text>
        </View>
      </Sheet>
    </View>
  );
};

export const Playground: Story = {
  render: () => <PlaygroundComponent />,
};

export const DefaultExample: Story = {
  render: () => (
    <View style={{ flex: 1 }}>
      <Sheet initialIndex={0}>
        <View>
          <Text style={{ marginBottom: 8 }}>Default sheet opened at the first snap.</Text>
          <Text>Use the playground to control the sheet programmatically.</Text>
        </View>
      </Sheet>
    </View>
  ),
};
