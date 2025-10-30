import { COLORS } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * SF Symbols to Material Icons mapping
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',

  // Navigation icons
  'camera.fill': 'camera-alt',
  'photo.on.rectangle': 'photo-library',
  'xmark.square': 'close',

  // Action icons
  trash: 'delete',
  camera: 'camera-alt',
  photo: 'photo',
  'chevron.left': 'chevron-left',
  'arrow.clockwise': 'refresh',
  xmark: 'close',
  'arrow.triangle.2.circlepath': 'flip-camera-android',
  'checkmark.circle.fill': 'check-circle',

  // Editor icons
  pencil: 'edit',
  'arrow.right': 'arrow-forward',
  circle: 'radio-button-unchecked',
  eraser: 'web-asset',
  paintpalette: 'palette',
} as const;

export type IconName = keyof typeof MAPPING;

export const ICONS = Object.keys(MAPPING) as IconName[];

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function Icon({
  name,
  size = 24,
  color = COLORS.label.onDark.secondary,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name];
  if (!iconName) {
    return <MaterialIcons color={color} size={size} name="help" style={style} />;
  }

  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
