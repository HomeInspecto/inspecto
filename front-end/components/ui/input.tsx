import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
  ColorValue,
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
  isDark?: boolean;
};

export default function Input({
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  containerStyle,
  inputStyle,
  isDark = true,
}: Props) {
  const palette = isDark ? COLORS.label.onDark : COLORS.label.onLight;
  const fill = isDark ? COLORS.material.secondary.fill[0] : COLORS.material.primary.fill;
  const textColor: ColorValue = palette.primary;
  const placeholderColor: ColorValue = palette.secondary;

  return (
    <View style={[styles.container, { backgroundColor: fill }, containerStyle]}>
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={18}
          color={placeholderColor as string}
          style={styles.iconLeft}
        />
      )}

      <TextInput
        style={[styles.input, { color: textColor }, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor as string}
        secureTextEntry={secureTextEntry}
      />

      {rightIcon && (
        <Pressable onPress={onRightIconPress} hitSlop={10}>
          <Ionicons
            name={rightIcon}
            size={18}
            color={placeholderColor as string}
            style={styles.iconRight}
          />
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
