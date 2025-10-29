import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useState, useRef, type RefObject } from 'react';
import type { AddObservationProps } from '../views/add-observation-note-view';
import type { BottomSheetRef } from '@/components/views/bottom-sheet/bottom-sheet';

export function useObservationNotes(
  bottomSheetRef?: RefObject<BottomSheetRef | null>
): AddObservationProps {
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
    bottomSheetRef?.current?.expand();
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
