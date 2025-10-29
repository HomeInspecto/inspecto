import Text from '@/components/views/text/text';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import TextInput from '@/components/views/text-input/text-input';
import { useRef, useEffect } from 'react';

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

export const AddFieldNoteView = ({
  note,
  onNextPress,
  focused,
  onFocus,
  onBlur,
  onChangeText,
  onMicStart,
  onMicStop,
}: AddFieldNoteProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animate the text opacity whenever focus changes
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        StyleSheet.absoluteFill,
        {
          pointerEvents: 'box-none',
          justifyContent: 'flex-end',
        },
      ]}
    >
      <TouchableWithoutFeedback
        style={{ pointerEvents: 'auto' }}
        disabled={!focused}
        onPress={() => {
          onBlur?.();
        }}
      >
        <>
          {/* background blur */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.8)',
                opacity: fadeAnim,
                display: focused ? 'flex' : 'none',
                width: '100%',
                height: '100%',
              },
            ]}
          ></Animated.View>
          <View
            style={{
              gap: 16,
              padding: 16,
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              pointerEvents: 'auto',
            }}
          >
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
              style={{
                opacity: 1,
              }}
              rightIcon={'navigate'}
              onRightIconPress={note ? onNextPress : undefined}
            />
          </View>
        </>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
