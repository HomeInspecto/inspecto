import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useState, useRef } from 'react';
import type { AddFieldNoteProps } from '../views/add-field-note-view';
import { Keyboard } from 'react-native';

export function useFieldNotes(goToLogObservation: () => void): AddFieldNoteProps {
  const note = useActiveObservationStore(s => s.fieldNote);
  const setFieldNote = useActiveObservationStore(s => s.setFieldNote);

  const [focused, setFocus] = useState(false);
  const isRecordingRef = useRef(false);

  const onFocus = () => {
    setFocus(true);
  };
  const onBlur = () => {
    setFocus(false);
  };

  function onMicStart() {
    // recorder.start() here
    isRecordingRef.current = true;
  }

  function onMicStop() {
    // recorder.stop() here
    isRecordingRef.current = false;
  }

  function onNextPress() {
    Keyboard.dismiss();
    goToLogObservation();
  }

  function onChangeText(text: string) {
    setFieldNote(text);
  }

  return {
    note,
    focused,
    onFocus,
    onBlur,
    onChangeText,
    onMicStart,
    onMicStop,
    onNextPress,
  };
}
