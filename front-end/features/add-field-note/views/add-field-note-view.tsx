import Text from '@/components/views/text/text';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import TextInput from '@/components/views/text-input/text-input';
import { useRef, useEffect } from 'react';
import { KeyboardController } from 'react-native-keyboard-controller';

export interface AddFieldNoteProps {
  note: string;

  onMicStart?: () => void;
  onMicStop?: () => void;
  onNextPress?: () => void;

  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
}

export const AddFieldNoteView = (props: AddFieldNoteProps) => {
  const { note, onNextPress, focused, onFocus, onBlur, onChangeText } = props;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const dismiss = () => {
    // Use the controller's dismiss; it plays nice with its animations
    KeyboardController.dismiss({ animated: true, keepFocus: false });
    // Let TextInput's native onBlur fire; call prop as a fallback if you need
    onBlur?.();
  };

  return (
    <>
      <Animated.View
        pointerEvents={focused ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', opacity: fadeAnim }]}
      />

      {focused && <Pressable style={[StyleSheet.absoluteFill, { zIndex: 1 }]} onPress={dismiss} />}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ justifyContent: 'flex-end' }}
      >
        <View style={{ gap: 16, paddingHorizontal: 16, paddingBottom: 16 }}>
          <Animated.View style={{ opacity: fadeAnim, display: focused ? 'flex' : 'none' }}>
            <Text variant="title3" weight="emphasized" style={{ textAlign: 'center' }}>
              What did you observe?
            </Text>
          </Animated.View>

          <TextInput
            value={note}
            onChangeText={onChangeText}
            placeholder="Write a field note"
            multiline
            onFocus={onFocus}
            onBlur={onBlur}
            rightIcon="navigate"
            onRightIconPress={note ? onNextPress : undefined}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};
