// Web-specific icon implementation with Material Icons font loading
import { useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
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
  // Editor icons
  'pencil': 'edit',
  'arrow.right': 'arrow-forward',
  'circle': 'radio-button-unchecked',
  'eraser': 'web-asset',
  'paintpalette': 'palette',
  // Missing icons for web
  'ellipsis': 'more-horiz',
  'hand.raised': 'pan-tool',
  'crop': 'crop',
} as IconMapping;

/**
 * Web-specific icon component that ensures Material Icons font is loaded
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
  // Load Material Icons font for web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Check if Material Icons font is already loaded
      const existingLink = document.querySelector('link[href*="Material+Icons"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, []);

  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
