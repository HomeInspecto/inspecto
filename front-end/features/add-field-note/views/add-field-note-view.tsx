import Text from '@/components/views/text/text';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';

import TextInput from '@/components/views/text-input/text-input';
import { useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/constants/colors';
import IconButton from '@/components/views/icon-button/icon-button';

export interface AddFieldNoteProps {
  note: string;

  onMicStart?: () => void;
  onMicStop?: () => void;
  onNextPress?: () => void; // keep if you still use it elsewhere

  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
  

  isRecording?: boolean;
  isUploading?: boolean;

  // Polish flow
  showPolishDialog?: boolean;
  onOpenPolishDialog?: () => void;
  onClosePolishDialog?: () => void;
  onConfirmPolish?: () => void;
  isPolishing?: boolean;
  polished?: {
    name: string;
    description: string;
    implications: string;
    recommendation: string;
    severity: string;
  } | null;
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
    showPolishDialog,
    onOpenPolishDialog,
    onClosePolishDialog,
    onConfirmPolish,
    isPolishing,
    polished,
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

          {/* Input with mic/stop + checkmark in the rightSlot */}
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
                  {/* Mic / Stop */}
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

                  {/* Checkmark only when there is text */}
                  {note ? (
                    <IconButton
                      icon="checkmark"
                      size="xs"
                      onPress={onOpenPolishDialog}
                    />
                  ) : null}
                </View>
              }
              onRightIconPress={undefined}
            />
          </View>

          {/* No polished result card needed since we replace the text directly */}
        </View>
      </KeyboardAvoidingView>

      {/* Polish confirmation modal */}
      <Modal
        visible={!!showPolishDialog}
        transparent
        animationType="fade"
        onRequestClose={onClosePolishDialog}
      >
        <View style={{ flex: 1, backgroundColor: COLORS.pageBackground }}>
          {/* Full screen content with text */}
          <View style={{ 
            flex: 1, 
            padding: 24,
            paddingTop: 48 // Extra padding at top for status bar
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <IconButton icon="xmark" size="sm" onPress={onClosePolishDialog} />
              {isPolishing ? (
                <ActivityIndicator />
              ) : (
                <IconButton icon="checkmark" size="sm" onPress={onConfirmPolish} />
              )}
            </View>
            
            <Text variant="title3" weight="emphasized" style={{ textAlign: 'center', marginBottom: 24 }}>
              Polish Text
            </Text>

            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16 }}
            >
              <View style={{
                backgroundColor: '#1f2326',
                borderRadius: 12,
                padding: 16,
              }}>
                <Text style={{ 
                  color: COLORS.system.white,
                  lineHeight: 20,
                }}>{note ?? ''}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
