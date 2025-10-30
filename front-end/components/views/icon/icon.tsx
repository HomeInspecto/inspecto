import { COLORS } from '@/constants/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, SymbolWeight } from 'expo-symbols';
import { ComponentProps, useEffect } from 'react';
import { OpaqueColorValue, Platform } from 'react-native';

type IconMapping = Partial<
  Record<ComponentProps<typeof SymbolView>['name'], ComponentProps<typeof MaterialIcons>['name']>
>;

/**
 * SF Symbols to Material Icons mapping
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',

  'chevron.left.forwardslash.chevron.right': 'code',

  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',

  // Navigation icons
  'camera.fill': 'camera-alt',
  'photo.on.rectangle': 'photo-library',
  'xmark.square': 'close',

  // Action icons
  trash: 'delete',
  photo: 'photo',
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

  plus: 'add',
  'bolt.fill': 'flash-on',
  checkmark: 'check',
  'arrow.uturn.left': 'undo',
  'arrow.up.right': 'arrow-outward',

  'doc.text.fill': 'assignment',
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
}: {
  name: IconName;
  size?: number;
  color?: string | OpaqueColorValue;
  weight?: SymbolWeight;
}) {
  // Ensure Material Icons font is loaded on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const linkId = 'material-icons-css';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        document.head.appendChild(link);
      }
    }
  }, []);

  if (Platform.OS === 'ios') return <SymbolView size={size} name={name} tintColor={color} />;

  const iconName = MAPPING[name];
  if (!iconName) {
    return <MaterialIcons color={color} size={size} name="help" />;
  }

  return <MaterialIcons color={color} size={size} name={iconName} />;
}
