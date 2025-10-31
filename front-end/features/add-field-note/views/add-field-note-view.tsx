import Text from '@/components/views/text/text';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';

import TextInput from '@/components/views/text-input/text-input';
import { useRef, useEffect } from 'react';
import { COLORS } from '@/constants/colors';
import IconButton from '@/components/views/icon-button/icon-button';

export interface AddFieldNoteProps {
  note: string;

  onMicStart?: () => void;
  onMicStop?: () => void;
  onNextPress?: () => void;

  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;

  isRecording?: boolean;
  isUploading?: boolean;
}

export const AddFieldNoteView = (props: AddFieldNoteProps) => {
  const {
  note,
  onNextPress,
  focused,
  onFocus,
  onBlur,
  onChangeText,
  onMicStart,
  onMicStop,
  isRecording,
  isUploading,
} = props;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const dismiss = () => {
    Keyboard.dismiss();
    onBlur?.();
  };

  return (
    <>
      <Animated.View
        pointerEvents={focused ? 'auto' : 'none'}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: COLORS.pageBackground, opacity: fadeAnim },
        ]}
      />

      {focused && <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />}

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

        </View>

      <View style={{ position: 'relative' }}>
        <TextInput
          value={note}
          onChangeText={onChangeText}
          placeholder="Write a field note"
          multiline
          onFocus={onFocus}
          onBlur={onBlur}
          rightSlot={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* Mic / Stop button */}
              {!isRecording ? (
                <IconButton
                  icon="mic"
                  size="xs"
                  disabled={!!isUploading}
                  onPress={onMicStart}
                />
              ) : (
                <IconButton
                  icon="stop"
                  size="xs"
                  disabled={!!isUploading}
                  onPress={onMicStop}
                />
              )}

              {/* Checkmark shows only if there is text */}
              {note ? (
                <IconButton
                  icon="checkmark"
                  size="xs"
                  onPress={onNextPress}
                />
              ) : null}
            </View>
          }
        />
      </View>
      </KeyboardAvoidingView>
    </>
  );
};
