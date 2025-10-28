import { View, TextInput as RNTextInput, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useState } from 'react';

type Props = {
  value: string;
  placeholder?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;

  onChangeText?: (text: string) => void;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;

  numberOfLines?: number;
  multiline?: boolean;
};

export default function TextInput({
  value,
  placeholder,
  leftIcon,
  rightIcon,
  onChangeText,
  onRightIconPress,
  multiline,
}: Props) {
  const [height, setHeight] = useState(44);
  const MIN = 44;

  return (
    <View
      style={{
        backgroundColor: COLORS.material.secondary.fill,
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 16,
        gap: 10,
        alignItems: multiline ? 'flex-start' : 'center',
        borderRadius: multiline ? 20 : 50,
        paddingVertical: multiline ? 16 : 0,
        maxHeight: '100%',
      }}
    >
      {leftIcon && <Ionicons name={leftIcon} size={18} color={COLORS.label.onDark.primary} />}

      <RNTextInput
        style={{
          flex: 1,
          height,
          maxHeight: '100%',
          outline: 'none',
          fontSize: 16,
          color: COLORS.label.onDark.primary,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.label.onDark.tertiary}
        multiline={multiline}
        returnKeyType={multiline ? 'default' : 'done'}
        onContentSizeChange={e => {
          if (Platform.OS === 'web') {
            setHeight(Math.max(MIN, e.nativeEvent.contentSize.height));
          }
        }}
        autoComplete="off"
      />

      {rightIcon && onRightIconPress && (
        <Pressable onPress={onRightIconPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={18} color={COLORS.label.onDark.primary} />
        </Pressable>
      )}
      {rightIcon && !onRightIconPress && (
        <Ionicons name={rightIcon} size={18} color={COLORS.label.onDark.primary} />
      )}
    </View>
  );
}
