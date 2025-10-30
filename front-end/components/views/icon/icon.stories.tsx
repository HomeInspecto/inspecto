import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Icon, ICONS } from './icon';
import Text from '../text/text';
import { COLORS } from '@/constants/colors';

const meta: Meta<typeof Icon> = {
  title: 'Components / Icon',
  component: Icon,
  decorators: [
    Story => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const AllIcons: Story = {
  render: () => {
    const [copied, setCopied] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);

    const handleCopy = async (name: string) => {
      await Clipboard.setStringAsync(name);
      setCopied(name);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // clear after 1.2s
      timerRef.current = setTimeout(() => {
        setCopied(null);
      }, 1200) as unknown as number;
    };

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {ICONS.map(name => (
          <Pressable key={name} onPress={() => handleCopy(name)} style={styles.item}>
            <View>
              <Icon name={name} size={28} />
              {copied === name && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Copied</Text>
                </View>
              )}
            </View>

            <Text numberOfLines={1} style={styles.label}>
              {name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    color: COLORS.label.onDark.secondary,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    lineHeight: 12,
  },
});
