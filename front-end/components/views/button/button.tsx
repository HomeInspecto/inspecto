import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { COLORS } from '@/constants/colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Text from '@/components/views/text/text';

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
      style={({ pressed }) => ({
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        backgroundColor: fillColor,
        borderRadius: radius,
        borderColor: strokeColor,
        borderWidth: strokeWidth,
      })}
    >
      <View
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={[
            {
              position: 'absolute',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            },
            { height, pointerEvents: 'none', paddingHorizontal: 16, gap: icon ? 8 : 0 },
          ]}
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
