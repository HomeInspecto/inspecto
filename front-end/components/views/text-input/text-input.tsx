import { View, TextInput as RNTextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type Props = {
  value: string;
  placeholder?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;

  onChangeText?: (text: string) => void;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;

  numberOfLines?: number;
};

export default function TextInput({
  value,
  placeholder,
  leftIcon,
  rightIcon,
  onChangeText,
  onRightIconPress,
  numberOfLines,
}: Props) {
  const multiline = numberOfLines && numberOfLines > 1;

  return (
    <View
      style={{
        backgroundColor: COLORS.material.secondary.fill,
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 16,
        gap: 14,
        alignItems: multiline ? 'flex-start' : 'center', // allows top-aligned multiline content
        borderRadius: multiline ? 20 : 50,
        height: multiline ? (numberOfLines || 1) * 34 : 44,
        paddingVertical: multiline ? 16 : 0,
      }}
    >
      {leftIcon && <Ionicons name={leftIcon} size={18} color={COLORS.label.onDark.primary} />}

      <RNTextInput
        style={{
          flex: 1,
          fontSize: 16,
          color: COLORS.label.onDark.primary,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.label.onDark.tertiary}
        numberOfLines={numberOfLines ? numberOfLines : undefined}
        returnKeyType={'default'}
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
