// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Navigation icons
  'camera.fill': 'camera-alt',
  'photo.on.rectangle': 'photo-library',
  'xmark.square': 'close',
  // Action icons
  'trash': 'delete',
  'camera': 'camera-alt',
  'photo': 'photo',
  'chevron.left': 'chevron-left',
  'arrow.clockwise': 'refresh',
  'xmark': 'close',
  'arrow.triangle.2.circlepath': 'flip-camera-android',
  'checkmark.circle.fill': 'check-circle',
  // Editor icons
  'pencil': 'edit',
  'arrow.right': 'arrow-forward',
  'circle': 'radio-button-unchecked',
  'eraser': 'web-asset',
  'paintpalette': 'palette',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name];
  if (!iconName) {
    console.warn(`Icon "${name}" not found in mapping`);
    return <MaterialIcons color={color} size={size} name="help" style={style} />;
  }
  
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
