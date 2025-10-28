import { View, TextInput as RNTextInput, StyleSheet, Pressable } from 'react-native';
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

  multiline?: boolean;
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
  return (
    <View
      style={{
        backgroundColor: COLORS.material.secondary.fill,
        flexDirection: 'row',
        alignItems: 'flex-start', // allows top-aligned multiline content
        borderRadius: numberOfLines === 1 ? 50 : 20,
        width: '100%',
        height: !numberOfLines || numberOfLines === 1 ? 44 : numberOfLines * 34,
        paddingHorizontal: 16,
        paddingVertical: numberOfLines === 1 ? 0 : 16,
      }}
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
        style={[styles.input, { color: COLORS.label.onDark.primary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.label.onDark.tertiary}
        numberOfLines={numberOfLines ? numberOfLines : undefined}
        returnKeyType={'default'}
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
  input: {
    flex: 1,
    fontSize: 16,
  },
  iconLeft: {
    marginRight: 8,
    paddingTop: 13, // visually centers vs. single-line baseline
  },
  iconRight: {
    marginLeft: 8,
    paddingTop: 13,
  },
});
