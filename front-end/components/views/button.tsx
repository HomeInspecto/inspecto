import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { COLORS } from '@/constants/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Text from '@/components/views/text';

type IconName = Parameters<typeof IconSymbol>[0]['name'];

type ButtonProps = {
  onPress: () => void;
  icon?: IconName;
  text: string;
  color?: 'primary' | 'secondary'; // primary = light, secondary = dark
  disabled?: boolean;
  accessibilityLabel?: string;
};

export default function Button({
  onPress,
  icon,
  text,
  color = 'primary',
  disabled,
  accessibilityLabel,
}: ButtonProps) {
  const height = 50;
  const radius = height / 2;
  const strokeWidth = 1;

  const fillColor =
    color === 'primary' ? COLORS.material.primary.fill : COLORS.material.secondary.fill;

  const strokeColor =
    color === 'primary' ? COLORS.material.primary.stroke : COLORS.material.secondary.stroke;

  const textColor =
    color === 'primary' ? COLORS.label.onLight.primary : COLORS.label.onDark.primary;

  const iconColor = textColor;
  const iconSize = 22;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.svgWrap}>
        <Svg width="100%" height={height} viewBox={`0 0 100 ${height}`}>
          <Rect
            x={0.5}
            y={0.5}
            width={99}
            height={height - 1}
            rx={radius}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Svg>

        <View
          pointerEvents="none"
          style={[styles.content, { height, paddingHorizontal: 16, gap: icon ? 8 : 0 }]}
        >
          {icon && <IconSymbol name={icon} size={iconSize} color={iconColor} />}
          <Text variant="callout" weight="emphasized" style={{ color: textColor }}>
            {text}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrap: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
