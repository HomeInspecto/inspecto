import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type Props = {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

export default function TextInput({
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  containerStyle,
  inputStyle,
}: Props) {
  const rightIconColor = onRightIconPress
    ? COLORS.label.onDark.primary
    : COLORS.label.onDark.secondary;
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: COLORS.material.secondary.fill },
        containerStyle,
      ]}
    >
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={18}
          color={COLORS.label.onDark.primary}
          style={styles.iconLeft}
        />
      )}

      <RNTextInput
        style={[styles.input, { color: COLORS.label.onDark.primary }, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.label.onDark.tertiary}
        secureTextEntry={secureTextEntry}
      />

      {rightIcon && (
        <Pressable onPress={onRightIconPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={18} color={rightIconColor} style={styles.iconRight} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
