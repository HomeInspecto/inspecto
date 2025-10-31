import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useState, type ReactNode } from 'react';

interface Props {
  value: string;
  placeholder?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightSlot?: ReactNode;

  onChangeText?: (text: string) => void;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;

  numberOfLines?: number;
  multiline?: boolean;
}

export default function TextInput({
  value,
  placeholder,
  leftIcon,
  rightIcon,
  rightSlot,
  onChangeText,
  onRightIconPress,
  multiline,
  ...props
}: Props & RNTextInputProps) {
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
        position: 'relative',
      }}
    >
      {leftIcon && <Ionicons name={leftIcon} size={18} color={COLORS.label.onDark.primary} />}

      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.label.onDark.tertiary}
        multiline={multiline}
        returnKeyType={multiline ? 'default' : 'done'}
        onContentSizeChange={e => {
          if (multiline && e.nativeEvent?.contentSize?.height) {
            const contentHeight = e.nativeEvent.contentSize.height;
            setHeight(Math.max(MIN, contentHeight));
          }
        }}
        autoComplete="off"
        {...props}
        style={[
          {
            flex: 1,
            height,
            maxHeight: '100%',
            outline: 'none',
            fontSize: 16,
            color: COLORS.label.onDark.primary,
          },
          props.style,
        ]}
      />

      {rightSlot ? (
        <>{rightSlot}</>
      ) : rightIcon && onRightIconPress ? (
        <Pressable onPress={onRightIconPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={18} color={COLORS.label.onDark.primary} />
        </Pressable>
      ) : rightIcon ? (
        <Ionicons name={rightIcon} size={18} color={COLORS.label.onDark.primary} />
      ) : null}
    </View>
  );
}
