import { useActiveObservationStore } from '@/features/edit-observation/state';
import { useState, useRef } from 'react';
import type { AddObservationProps } from '../views/add-observation-note-view';

export function useObservationNotes(): AddObservationProps {
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
    // hook up your recorder.start() here
    isRecordingRef.current = true;
  }

  function onMicStop() {
    // hook up your recorder.stop() here
    isRecordingRef.current = false;
  }

  function onNextPress() {
    // advance your flow (e.g., navigate or commit the observation)
    // you can also validate `note` here if needed
  }

  return {
    note,
    focused,
    onFocus,
    onBlur,
    onChangeText: setFieldNote,
    onMicStart,
    onMicStop,
    onNextPress,
  };
}
