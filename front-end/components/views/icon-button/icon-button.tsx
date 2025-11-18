import { COLORS } from '@/constants/colors';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Icon, type IconName } from '@/components/views/icon/icon';
import type { ReactNode } from 'react';

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<IconButtonSize, number> = {
  xs: 32,
  sm: 40,
  md: 50,
  lg: 70,
};

type IconButtonProps = {
  onPress?: () => void;
  size?: IconButtonSize; // enforce "sm", "md", "lg"
  color?: 'primary' | 'secondary' | 'critical'; // primary = light, secondary = dark
  icon?: IconName;
  iconSlot?: ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export default function IconButton({
  onPress,
  size = 'md',
  color = 'primary',
  icon,
  iconSlot,
  disabled,
  accessibilityLabel,
}: IconButtonProps) {
  const pixelSize = SIZE_MAP[size];
  const radius = pixelSize / 2;
  const strokeWidth = Math.max(1, Math.round(pixelSize * 0.03));
  const iconSize = Math.round(pixelSize * 0.44);

  const fillColor =
    color === 'primary' ? COLORS.material.primary.fill : COLORS.material.secondary.fill;

  const strokeColor =
    color === 'primary' ? COLORS.material.primary.stroke : COLORS.material.secondary.stroke;

  const iconColor =
    color === 'primary' ? COLORS.label.onLight.primary : COLORS.label.onDark.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        {
          width: pixelSize,
          height: pixelSize,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.svgWrap}>
        <Svg width={pixelSize} height={pixelSize} viewBox={`0 0 ${pixelSize} ${pixelSize}`}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Svg>

        <View
          style={[styles.iconSlot, { width: pixelSize, height: pixelSize, pointerEvents: 'none' }]}
        >
          {iconSlot ? (
            iconSlot
          ) : (
            <Icon name={icon || 'questionmark'} size={iconSize} color={iconColor} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSlot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    top: 0,
  },
});
