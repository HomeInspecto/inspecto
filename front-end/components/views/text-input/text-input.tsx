import { View, TextInput as RNTextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type Props = {
  value: string;
  placeholder?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;

  onChangeText?: (text: string) => void;
  onRightIconPress?: () => void;
};

export default function TextInput({
  value,
  placeholder,
  leftIcon,
  rightIcon,
  secureTextEntry,
  onChangeText,
  onRightIconPress,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: COLORS.material.secondary.fill }]}>
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={18}
          color={COLORS.label.onDark.primary}
          style={styles.iconLeft}
        />
      )}

      <RNTextInput
        style={[styles.input, { color: COLORS.label.onDark.primary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.label.onDark.tertiary}
        secureTextEntry={secureTextEntry}
      />

      {rightIcon && onRightIconPress && (
        <Pressable onPress={onRightIconPress} hitSlop={10}>
          <Ionicons
            name={rightIcon}
            size={18}
            color={COLORS.label.onDark.primary}
            style={styles.iconRight}
          />
        </Pressable>
      )}
      {rightIcon && !onRightIconPress && (
        <Ionicons
          name={rightIcon}
          size={18}
          color={COLORS.label.onDark.primary}
          style={styles.iconRight}
        />
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
    paddingHorizontal: 16,
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
